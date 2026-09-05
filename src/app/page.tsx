'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  PortalState,
  getStoredState,
  logoutUser,
  hydrateFromSupabase,
} from '../lib/storage';
import {
  subscribeToPortalEvents,
  playNotificationChime,
} from '../lib/realtime';
import { AuthPortal } from '../components/auth/AuthPortal';
import { EditorialLandingPage } from '../components/landing/EditorialLandingPage';
import { UniversityLogo } from '../components/common/UniversityLogo';
import { HeaderNavbar } from '../components/navbar/HeaderNavbar';
import { StudentWorkspace } from '../components/student/StudentWorkspace';
import { TeacherWorkspace } from '../components/teacher/TeacherWorkspace';
import { StudentProfile, TeacherProfile } from '../types/portal';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, X } from 'lucide-react';
import { Avatar } from '../components/common/Avatar';

export default function HomePage() {
  const { language, t } = useLanguage();
  const [state, setState] = useState<PortalState | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Navigation flow:
  // Step 1: Login page (activeView === 'login' || !currentUser)
  // Step 2: Portal Home (activeView === 'landing')
  // Step 3: Workspace (activeView === 'workspace')
  const [activeView, setActiveView] = useState<'login' | 'landing' | 'workspace'>('login');
  const [toastNotif, setToastNotif] = useState<{
    id: string;
    title: string;
    content: string;
    senderAvatar?: string;
    linkConversationId?: string;
  } | null>(null);

  const refreshState = useCallback(() => {
    const currentState = getStoredState();
    setState(currentState);
  }, []);

  // Auto-dismiss floating toast notification after 6 seconds
  useEffect(() => {
    if (!toastNotif) return;
    const timer = setTimeout(() => setToastNotif(null), 6000);
    return () => clearTimeout(timer);
  }, [toastNotif]);

  useEffect(() => {
    setMounted(true);
    const sessionActive =
      typeof window !== 'undefined' &&
      sessionStorage.getItem('bjtu_session_active') === 'true';
    const savedView =
      typeof window !== 'undefined'
        ? (sessionStorage.getItem('bjtu_active_view') as 'landing' | 'workspace' | null)
        : null;

    if (sessionActive && savedView) {
      setActiveView(savedView);
    } else {
      setActiveView('login');
    }

    refreshState();

    // Hydrate latest data from Supabase in background
    hydrateFromSupabase().then((hydrated) => {
      if (hydrated) {
        refreshState();
      }
    });

    // Subscribe to cross-tab & Supabase realtime events
    const unsubscribe = subscribeToPortalEvents((event) => {
      refreshState();

      if (event.type === 'USER_LOGGED_OUT') {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('bjtu_session_active');
          sessionStorage.removeItem('bjtu_active_view');
        }
        setActiveView('login');
      }

      if (event.type === 'NEW_MESSAGE') {
        const stored = getStoredState();
        if (stored.currentUser && event.payload?.senderId !== stored.currentUser.id) {
          if (!isMuted) {
            playNotificationChime();
          }
          const msg = event.payload;
          setToastNotif({
            id: msg.id || String(Date.now()),
            title: msg.senderName || 'BJTU Connect',
            content: msg.content || '',
            senderAvatar: msg.senderAvatar,
            linkConversationId: msg.conversationId,
          });

          // Push browser native notification if permitted
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(msg.senderName || 'BJTU Connect', {
                body: msg.content,
                icon: msg.senderAvatar || '/favicon.ico',
              });
            } catch (e) {}
          }
        }
      }

      if (event.type === 'BOOKING_STATUS_CHANGED') {
        const stored = getStoredState();
        if (stored.currentUser) {
          if (!isMuted) {
            playNotificationChime();
          }
          setToastNotif({
            id: String(Date.now()),
            title: language === 'zh' ? '学业答疑预约状态更新' : 'Consultation Booking Updated',
            content: language === 'zh' ? '您的答疑预约有了新的处理结果，请前往咨询查看。' : 'Your consultation proposal was updated.',
            linkConversationId: event.payload?.conversationId,
          });
        }
      }
    });

    return () => unsubscribe();
  }, [isMuted, refreshState, language]);

  if (!mounted || !state) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-3">
          <UniversityLogo size="md" />
          <div>
            <div className="text-base font-bold text-on-surface font-headline-sm">
              {language === 'zh'
                ? '正在载入北京交通大学师生协同门户...'
                : 'Loading BJTU Consultation Portal...'}
            </div>
            <div className="text-xs text-outline font-label-code">
              {language === 'zh'
                ? '正在连接北京交通大学实时数据与教务认证'
                : 'Connecting Beijing Jiaotong University real-time synchronization'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { currentUser, students, teachers, courses, conversations, messages } = state;

  const handleLoginSuccess = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('bjtu_session_active', 'true');
      sessionStorage.setItem('bjtu_active_view', 'landing');
    }
    refreshState();
    // Sequential step: Login -> Portal Home
    setActiveView('landing');
  };

  const handleGoToWorkspace = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('bjtu_active_view', 'workspace');
    }
    // Sequential step: Portal Home -> Workspace
    setActiveView('workspace');
  };

  const handleGoToLanding = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('bjtu_active_view', 'landing');
    }
    setActiveView('landing');
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('bjtu_session_active');
      sessionStorage.removeItem('bjtu_active_view');
    }
    // 1-click instant logout directly back to Login page
    logoutUser();
    refreshState();
    setActiveView('login');
  };

  const renderToastBanner = () => {
    if (!toastNotif) return null;
    return (
      <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full bg-white/95 backdrop-blur-xl border border-academic-300 rounded-2xl shadow-2xl p-4 transition-all animate-in fade-in slide-in-from-top-4 duration-300 flex items-start gap-3 ring-1 ring-academic-600/20">
        {toastNotif.senderAvatar ? (
          <Avatar src={toastNotif.senderAvatar} name={toastNotif.title} size="md" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-academic-100 text-academic-700 flex items-center justify-center shrink-0 font-bold text-sm">
            🔔
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="font-bold text-xs text-slate-900 truncate">{toastNotif.title}</span>
            <span className="text-[10px] text-academic-700 font-semibold uppercase tracking-wider bg-academic-50 px-1.5 py-0.2 rounded border border-academic-200">
              {language === 'zh' ? '新通知' : 'Alert'}
            </span>
          </div>
          <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed break-words">
            {toastNotif.content}
          </p>
          <div className="flex items-center gap-2 mt-2.5">
            <button
              type="button"
              onClick={() => {
                handleGoToWorkspace();
                setToastNotif(null);
              }}
              className="text-[11px] font-bold text-white bg-academic-700 hover:bg-academic-800 px-3 py-1 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              {language === 'zh' ? '查看咨询' : 'View Chat'}
            </button>
            <button
              type="button"
              onClick={() => setToastNotif(null)}
              className="text-[11px] text-slate-400 hover:text-slate-600 px-2 py-1 rounded-lg transition-colors cursor-pointer"
            >
              {language === 'zh' ? '忽略' : 'Dismiss'}
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setToastNotif(null)}
          className="text-slate-400 hover:text-slate-600 p-1 -mr-1 -mt-1 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  };

  // STEP 1: If not logged in or active view is login, render Login Page (CAS Unified Auth)
  if (activeView === 'login' || !currentUser) {
    return (
      <AuthPortal
        initialRole="student"
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // STEP 3: If in workspace view and user is authenticated
  if (activeView === 'workspace') {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900">
        {renderToastBanner()}
        {/* Top Navigation */}
        <HeaderNavbar
          currentUser={currentUser}
          students={students}
          teachers={teachers}
          onRefresh={refreshState}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(!isMuted)}
          onGoToLanding={handleGoToLanding}
          onNavigateToConversation={() => handleGoToWorkspace()}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {currentUser.role === 'student' ||
          (currentUser.role === 'admin' && Boolean((currentUser as any).studentId && !(currentUser as any).title)) ? (
            <StudentWorkspace
              student={currentUser as StudentProfile}
              teachers={teachers}
              courses={courses}
              conversations={conversations}
              messages={messages}
              onRefresh={refreshState}
            />
          ) : (
            <TeacherWorkspace
              teacher={currentUser as TeacherProfile}
              students={students}
              courses={courses}
              conversations={conversations}
              messages={messages}
              onRefresh={refreshState}
            />
          )}
        </main>

        {/* University Portal Footer */}
        <footer className="border-t border-slate-200/80 bg-white py-6 text-slate-500 text-xs mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">
                {language === 'zh' ? '知行协同' : 'BJTU Connect'}
              </span>
              <span>•</span>
              <span>
                {language === 'zh'
                  ? '北京交通大学师生咨询协同门户'
                  : 'Beijing Jiaotong University Consultation Portal'}
              </span>
              <span>•</span>
              <span className="text-slate-400">
                {language === 'zh' ? '2026-2027学年' : 'Academic Year 2026-2027'}
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <button
                type="button"
                onClick={handleGoToLanding}
                className="text-emerald-700 hover:underline font-medium cursor-pointer"
              >
                {language === 'zh' ? '← 返回门户主页' : '← Back to Portal Home'}
              </button>
              <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                {language === 'zh' ? '全校教学网络实时同步' : 'BJTU End-to-End Academic Sync'}
              </span>
              <span>BroadcastChannel Sync Engine v2.0</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // STEP 2: Render the Portal Home (Editorial Landing Page)
  return (
    <>
      {renderToastBanner()}
      <EditorialLandingPage
        currentUser={currentUser}
        onOpenAuth={() => setActiveView('login')}
        onGoToWorkspace={handleGoToWorkspace}
        onLogout={handleLogout}
      />
    </>
  );
}
