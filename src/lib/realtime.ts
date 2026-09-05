import { supabase, isSupabaseConfigured, rowToMessage, rowToConversation, rowToTeacher } from './supabase';

export interface PortalRealtimeEvent {
  type:
    | 'DATA_RESET'
    | 'USER_SWITCHED'
    | 'USER_LOGGED_OUT'
    | 'TEACHER_STATUS_UPDATED'
    | 'NEW_MESSAGE'
    | 'CONVERSATION_READ'
    | 'CONVERSATION_CREATED'
    | 'NOTES_UPDATED'
    | 'BOOKING_STATUS_CHANGED'
    | 'PROFILE_UPDATED'
    | 'TYPING_STATUS';
  payload?: any;
}

const CHANNEL_NAME = 'bjtu_portal_sync_v2';

let localBroadcastChannel: BroadcastChannel | null = null;
let supabaseRealtimeChannel: any = null;
const listeners = new Set<(event: PortalRealtimeEvent) => void>();

function getLocalBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (!localBroadcastChannel && 'BroadcastChannel' in window) {
    try {
      localBroadcastChannel = new BroadcastChannel(CHANNEL_NAME);
      localBroadcastChannel.onmessage = (ev: MessageEvent<PortalRealtimeEvent>) => {
        if (ev.data) {
          notifyLocalListeners(ev.data);
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel not supported or threw error:', e);
      localBroadcastChannel = null;
    }
  }
  return localBroadcastChannel;
}

function notifyLocalListeners(event: PortalRealtimeEvent): void {
  listeners.forEach((listener) => {
    try {
      listener(event);
    } catch (e) {
      console.error('Error in realtime listener:', e);
    }
  });
}

/**
 * Initialize Supabase Realtime channel for Postgres replication and cross-device broadcast
 */
function initializeSupabaseRealtime(): void {
  if (typeof window === 'undefined') return;
  if (!isSupabaseConfigured()) return;
  if (supabaseRealtimeChannel) return;

  try {
    supabaseRealtimeChannel = supabase
      .channel('bjtu_portal_realtime_stream')
      // 1. Listen for new messages inserted in Supabase
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          if (payload.new) {
            const message = rowToMessage(payload.new);
            // Sync to local storage
            syncIncomingMessageToLocalStorage(message);
            notifyLocalListeners({ type: 'NEW_MESSAGE', payload: message });
          }
        }
      )
      // 2. Listen for message updates (e.g. read status, booking proposal status)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        (payload) => {
          if (payload.new) {
            const message = rowToMessage(payload.new);
            syncUpdatedMessageToLocalStorage(message);
            notifyLocalListeners({ type: 'BOOKING_STATUS_CHANGED', payload: message });
          }
        }
      )
      // 3. Listen for conversation updates or creations
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        (payload) => {
          if (payload.new) {
            const conv = rowToConversation(payload.new);
            syncConversationToLocalStorage(conv);
            notifyLocalListeners({ type: 'CONVERSATION_CREATED', payload: conv });
          }
        }
      )
      // 4. Listen for teacher status changes (available, office hours, etc.)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'teachers' },
        (payload) => {
          if (payload.new) {
            const teacher = rowToTeacher(payload.new);
            syncTeacherToLocalStorage(teacher);
            notifyLocalListeners({
              type: 'TEACHER_STATUS_UPDATED',
              payload: {
                teacherId: teacher.id,
                status: teacher.status,
                customMessage: teacher.customStatusMessage,
              },
            });
          }
        }
      )
      // 5. Cross-client instant broadcast channel
      .on('broadcast', { event: 'portal_event' }, ({ payload }) => {
        if (payload) {
          notifyLocalListeners(payload);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase Realtime] Subscribed to BJTU Academic Portal channel');
        }
      });
  } catch (err) {
    console.warn('Failed to initialize Supabase Realtime channel:', err);
  }
}

// Local storage synchronization helpers for incoming Supabase realtime events
function syncIncomingMessageToLocalStorage(message: any): void {
  try {
    const raw = localStorage.getItem('bjtu_portal_messages_v3');
    if (!raw) return;
    const list = JSON.parse(raw);
    if (!list.some((m: any) => m.id === message.id)) {
      list.push(message);
      localStorage.setItem('bjtu_portal_messages_v3', JSON.stringify(list));
    }
  } catch (e) {
    console.warn('Error syncing incoming message locally:', e);
  }
}

function syncUpdatedMessageToLocalStorage(message: any): void {
  try {
    const raw = localStorage.getItem('bjtu_portal_messages_v3');
    if (!raw) return;
    const list = JSON.parse(raw);
    const idx = list.findIndex((m: any) => m.id === message.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...message };
      localStorage.setItem('bjtu_portal_messages_v3', JSON.stringify(list));
    }
  } catch (e) {
    console.warn('Error syncing updated message locally:', e);
  }
}

function syncConversationToLocalStorage(conv: any): void {
  try {
    const raw = localStorage.getItem('bjtu_portal_conversations_v3');
    if (!raw) return;
    const list = JSON.parse(raw);
    const idx = list.findIndex((c: any) => c.id === conv.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...conv };
    } else {
      list.unshift(conv);
    }
    localStorage.setItem('bjtu_portal_conversations_v3', JSON.stringify(list));
  } catch (e) {
    console.warn('Error syncing conversation locally:', e);
  }
}

function syncTeacherToLocalStorage(teacher: any): void {
  try {
    const raw = localStorage.getItem('bjtu_portal_teachers_v3');
    if (!raw) return;
    const list = JSON.parse(raw);
    const idx = list.findIndex((t: any) => t.id === teacher.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...teacher };
      localStorage.setItem('bjtu_portal_teachers_v3', JSON.stringify(list));
    }
  } catch (e) {
    console.warn('Error syncing teacher locally:', e);
  }
}

/**
 * Broadcast an event across all tabs, local listeners, and Supabase Realtime
 */
export function broadcastEvent(event: PortalRealtimeEvent): void {
  if (typeof window === 'undefined') return;

  // 1. Broadcast to other tabs on same device via local BroadcastChannel
  const ch = getLocalBroadcastChannel();
  if (ch) {
    try {
      ch.postMessage(event);
    } catch (e) {
      console.warn('Failed to broadcast event to local channel:', e);
    }
  }

  // 2. Broadcast to other devices/browsers via Supabase Realtime
  if (isSupabaseConfigured() && supabaseRealtimeChannel) {
    try {
      supabaseRealtimeChannel.send({
        type: 'broadcast',
        event: 'portal_event',
        payload: event,
      });
    } catch (e) {
      // broadcast send error, continue
    }
  }

  // 3. Notify listeners in current tab so local state is updated immediately
  notifyLocalListeners(event);
}

/**
 * Subscribe to realtime portal events from both local channels and Supabase Realtime
 */
export function subscribeToPortalEvents(callback: (event: PortalRealtimeEvent) => void): () => void {
  listeners.add(callback);
  getLocalBroadcastChannel();
  initializeSupabaseRealtime();

  // Storage event listener for older browser tabs
  const storageHandler = (e: StorageEvent) => {
    if (e.key && e.key.startsWith('bjtu_portal_')) {
      callback({ type: 'DATA_RESET' });
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', storageHandler);
  }

  return () => {
    listeners.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', storageHandler);
    }
  };
}

/**
 * Notification sound chime using Web Audio API (no asset download needed)
 */
export function playNotificationChime(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // AudioContext might be restricted before first user gesture
  }
}
