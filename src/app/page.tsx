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
import { ShieldCheck } from 'lucide-react';

export default function HomePage() {
  const { language, t } = useLanguage();
  const [state, setState] = useState<PortalState | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Navigation flow:
  // Step 1: Login page (when !currentUser)
  // Step 2: Portal Home (activeView === 'landing')
  // Step 3: Workspace (activeView === 'workspace')
  const [activeView, setActiveView] = useState<'landing' | 'workspace'>('landing');

  const refreshState = useCallback(() => {
    const currentState = getStoredState();
    setState(currentState);
  }, []);

  useEffect(() => {
    setMounted(true);
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

      if (event.type === 'NEW_MESSAGE') {
        const stored = getStoredState();
        if (stored.currentUser && event.payload?.senderId !== stored.currentUser.id) {
          if (!isMuted) {
            playNotificationChime();
          }
        }
      }
    });

    return () => unsubscribe();
  }, [isMuted, refreshState]);

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
    refreshState();
    // Sequential step: Login -> Portal Home
    setActiveView('landing');
  };

  const handleGoToWorkspace = () => {
    // Sequential step: Portal Home -> Workspace
    setActiveView('workspace');
  };

  const handleLogout = () => {
    // 1-click instant logout directly back to Login page
    logoutUser();
    refreshState();
    setActiveView('landing');
  };

  // STEP 1: If not logged in, render Login Page (CAS Unified Auth)
  if (!currentUser) {
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
        {/* Top Navigation */}
        <HeaderNavbar
          currentUser={currentUser}
          students={students}
          teachers={teachers}
          onRefresh={refreshState}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(!isMuted)}
          onGoToLanding={() => setActiveView('landing')}
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
                onClick={() => setActiveView('landing')}
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
    <EditorialLandingPage
      currentUser={currentUser}
      onOpenAuth={() => {}}
      onGoToWorkspace={handleGoToWorkspace}
      onLogout={handleLogout}
    />
  );
}
