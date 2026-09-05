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

let channel: BroadcastChannel | null = null;
const listeners = new Set<(event: PortalRealtimeEvent) => void>();

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (!channel && 'BroadcastChannel' in window) {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (ev: MessageEvent<PortalRealtimeEvent>) => {
        if (ev.data) {
          listeners.forEach((listener) => {
            try {
              listener(ev.data);
            } catch (e) {
              console.error('Error in realtime listener:', e);
            }
          });
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel not supported or threw error:', e);
      channel = null;
    }
  }
  return channel;
}

export function broadcastEvent(event: PortalRealtimeEvent): void {
  if (typeof window === 'undefined') return;

  // Broadcast to other tabs
  const ch = getBroadcastChannel();
  if (ch) {
    try {
      ch.postMessage(event);
    } catch (e) {
      console.warn('Failed to broadcast event to channel:', e);
    }
  }

  // Also notify listeners in current tab so local state is uniform
  listeners.forEach((listener) => {
    try {
      listener(event);
    } catch (e) {
      console.error('Error notifying local listener:', e);
    }
  });
}

export function subscribeToPortalEvents(callback: (event: PortalRealtimeEvent) => void): () => void {
  listeners.add(callback);
  getBroadcastChannel(); // ensure channel is initialized

  // Fallback storage event listener for older browser tabs
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

// Sound chime simulation using Web Audio API (no external asset download needed!)
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
    // AudioContext may be restricted before user gesture, fail silently
  }
}
