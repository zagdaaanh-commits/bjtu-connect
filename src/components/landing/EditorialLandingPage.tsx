'use client';

import React, { useState } from 'react';
import { AcademicRailEmblem } from '../common/AcademicRailEmblem';
import { useLanguage } from '../../context/LanguageContext';
import { UserProfile } from '../../types/portal';

interface EditorialLandingPageProps {
  currentUser: UserProfile | null;
  onOpenAuth: (initialRole?: 'student' | 'teacher') => void;
  onGoToWorkspace: () => void;
  onLogout?: () => void;
}

export const EditorialLandingPage: React.FC<EditorialLandingPageProps> = ({
  currentUser,
  onOpenAuth,
  onGoToWorkspace,
  onLogout,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'about' | 'faculties' | 'courses' | 'consultations'>('about');
  const [slotStatus, setSlotStatus] = useState<'pending' | 'accepted' | 'rescheduled'>('pending');
  const [chatInputValue, setChatInputValue] = useState(
    'Thank you Professor. I have annotated Section 3 with the boundary proof.'
  );
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: 'student' | 'professor'; text: string; time: string }>
  >([]);

  // Track active scroll section for dynamic navbar indicator
  React.useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'faculty-matrix', key: 'consultations' as const },
        { id: 'telemetry', key: 'courses' as const },
        { id: 'roster-stream', key: 'faculties' as const },
        { id: 'hero', key: 'about' as const },
      ];
      const scrollY = window.scrollY + 160;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && scrollY >= el.offsetTop) {
          setActiveSection(s.key);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSendChat = () => {
    if (!chatInputValue.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { sender: 'student', text: chatInputValue, time: 'Just now' },
    ]);
    const sentText = chatInputValue;
    setChatInputValue('');
    showToast(
      language === 'zh'
        ? '学术咨询消息已加密提交至张晨教授终端'
        : 'Academic inquiry encrypted and delivered to Prof. Chen Zhang'
    );

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'professor',
          text:
            language === 'zh'
              ? '收到你的补充证明，我将在15:30答疑时与你讨论。'
              : 'Received your proof notes. We will review them during the 15:30 session.',
          time: 'Just now',
        },
      ]);
    }, 1800);
  };

  const handleActionClick = (targetRole: 'student' | 'teacher' = 'student') => {
    if (currentUser) {
      onGoToWorkspace();
    } else {
      onOpenAuth(targetRole);
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-surface-container-high border border-primary/40 text-on-surface px-unit-md py-unit-sm rounded-lg shadow-2xl backdrop-blur-xl flex items-center gap-unit-sm animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
          <span className="font-body-sm text-sm">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-outline hover:text-on-surface ml-auto text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Floating Obsidian Header */}
      <header className="fixed top-0 left-0 right-0 z-40 pointer-events-none">
        <div className="max-w-container-max mx-auto px-gutter-desktop pt-unit-sm">
          <div className="h-20 w-full rounded-full bg-surface-container-low/85 backdrop-blur-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.7),0_0_30px_1px_rgba(16,185,129,0.12)] border border-outline-variant/30 px-unit-lg flex items-center justify-between pointer-events-auto">
            {/* Logo & Institutional Identity */}
            <div className="flex items-center gap-unit-md">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md p-0.5 overflow-hidden ring-1 ring-primary/40 shrink-0">
                <img
                  src="/bjtu_emblem.png"
                  alt="北京交通大学校徽"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-unit-xs">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-medium tracking-tight">
                    BJTU Connect
                  </span>
                  <span className="text-outline font-label-code text-label-code">|</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    北京交通大学
                  </span>
                </div>
                <span className="font-label-code text-label-code text-secondary tracking-widest uppercase">
                  学业咨询平台
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center gap-unit-xs p-unit-2xs rounded-full bg-surface-container-lowest/60 backdrop-blur-md border border-outline-variant/20">
              <a
                onClick={() => setActiveSection('about')}
                className={`px-unit-md py-unit-xs transition-colors rounded-full ${
                  activeSection === 'about'
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'text-on-surface-variant font-body-sm hover:text-on-surface'
                }`}
                href="#hero"
              >
                {language === 'zh' ? '关于门户' : 'About'}
              </a>
              <a
                onClick={() => setActiveSection('faculties')}
                className={`px-unit-md py-unit-xs transition-colors rounded-full ${
                  activeSection === 'faculties'
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'text-on-surface-variant font-body-sm hover:text-on-surface'
                }`}
                href="#roster-stream"
              >
                {language === 'zh' ? '导师名录' : 'Faculties'}
              </a>
              <a
                onClick={() => setActiveSection('courses')}
                className={`px-unit-md py-unit-xs transition-colors rounded-full ${
                  activeSection === 'courses'
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'text-on-surface-variant font-body-sm hover:text-on-surface'
                }`}
                href="#telemetry"
              >
                {language === 'zh' ? '教务协同' : 'Courses'}
              </a>
              <a
                onClick={() => setActiveSection('consultations')}
                className={`px-unit-md py-unit-xs transition-colors rounded-full ${
                  activeSection === 'consultations'
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'text-on-surface-variant font-body-sm hover:text-on-surface'
                }`}
                href="#faculty-matrix"
              >
                {language === 'zh' ? '学术研讨' : 'Consultations'}
              </a>
            </nav>

            {/* Right Controls & Workspace Trigger */}
            <div className="flex items-center gap-unit-md">
              {/* Language Switcher */}
              <button
                type="button"
                onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
                className="px-unit-xs py-1 rounded-full bg-surface-container text-outline hover:text-primary transition-colors font-label-code text-xs flex items-center gap-1 border border-outline-variant/30 cursor-pointer"
                title="Toggle Language / 切换语言"
              >
                <span className="material-symbols-outlined text-sm">translate</span>
                <span>{language === 'zh' ? 'EN' : '中文'}</span>
              </button>

              {/* Access Workspace Button */}
              <button
                type="button"
                onClick={() => handleActionClick('student')}
                className="hidden sm:inline-flex items-center justify-center px-unit-md py-unit-xs rounded-full bg-gradient-to-r from-primary-container to-secondary-container text-on-primary font-label-code text-label-code tracking-wider uppercase font-semibold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_28px_rgba(16,185,129,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                {currentUser
                  ? language === 'zh'
                    ? '进入我的工作台'
                    : 'Access Workspace'
                  : language === 'zh'
                  ? '登录协同空间'
                  : 'Access Workspace'}
              </button>

              {/* User Avatar or CAS Authenticated Pill */}
              {currentUser ? (
                <div className="flex items-center gap-unit-xs pl-unit-xs border-l border-outline-variant/30">
                  <img
                    alt={currentUser.fullName}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-primary/40 cursor-pointer"
                    src={currentUser.avatar}
                    onError={(e) => {
                      e.currentTarget.src = '/academic_rail_emblem.svg';
                    }}
                    onClick={onGoToWorkspace}
                    title={`${currentUser.fullName} (${currentUser.role})`}
                  />
                  {onLogout && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onLogout();
                      }}
                      className="text-outline hover:text-rose-400 p-1 transition-colors cursor-pointer"
                      title={language === 'zh' ? '退出登录' : 'Sign Out'}
                    >
                      <span className="material-symbols-outlined text-sm">logout</span>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenAuth('student')}
                  className="flex items-center gap-unit-xs pl-unit-xs border-l border-outline-variant/30 text-outline hover:text-primary transition-colors cursor-pointer"
                  title="CAS Sign In"
                >
                  <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center ring-1 ring-primary/40">
                    <span className="material-symbols-outlined text-sm text-primary">lock</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="w-full pt-20 bg-surface">
        <div className="flex flex-col w-full">
          {/* HERO SECTION */}
          <section
            id="hero"
            className="relative w-full min-h-[92vh] flex items-center justify-center -mt-20 overflow-hidden scroll-mt-24"
          >
            {/* Campus Background with obsidian blur */}
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-1000 scale-105 will-change-transform"
              style={{
                backgroundColor: '#0f1512',
                backgroundImage: `radial-gradient(circle at 50% 30%, rgba(16, 185, 129, 0.12), transparent 70%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuCciFrSxzjBKkzMD9dBUUXAVyiQOiCvZMYhu9Bclowp3JSns-xKcm4S-PLteMiXG43ezQVh6Q8cM5Lw0_ubN6ZJn_Y8cp3LaBYgcYuBKyfdO1dtguW8ra-zT726YnAQOiJQ4sDM9Y_Fd7h4gA-V4PmnqJJQl4Au-YnCtgtaIYJOyFDrf5RC-8_H4GwNvZbr2QkjiyZqx3TUtDpFanN8ZzvkXgh49U4KM8Z-6Ey52WhDt-I17FisfPD1qBxTbIayuO2pPg")`,
              }}
            />
            <div className="absolute inset-0 bg-surface-container-lowest/80 backdrop-blur-[2px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-surface-container-lowest/70" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-surface-container-lowest/90 pointer-events-none" />
            <div className="absolute w-[680px] h-[360px] rounded-full bg-primary-container/10 blur-[120px] pointer-events-none -top-12" />

            <div className="relative z-10 max-w-container-max mx-auto px-gutter-desktop pt-unit-4xl pb-unit-2xl flex flex-col items-center text-center">
              {/* Telemetry Operational Status Badge */}
              <div className="inline-flex items-center gap-unit-xs px-unit-md py-unit-2xs rounded-full bg-surface-container-high/80 backdrop-blur-xl shadow-lg mb-unit-lg transition-transform hover:scale-[1.02] cursor-default border border-outline-variant/30">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                </span>
                <span className="font-label-code text-label-code tracking-widest uppercase text-secondary">
                  BJTU Intelligent Academic Portal 2026
                </span>
                <span className="font-body-sm text-body-sm text-outline">·</span>
                <span className="font-label-code text-label-code text-on-surface-variant">
                  Siyuan Operational Net
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="font-headline-xl text-headline-xl md:font-display-hero md:text-display-hero text-on-surface max-w-5xl tracking-tight leading-[1.08] mb-unit-sm">
                Bridging Students &amp; Professors with{' '}
                <span className="italic text-primary font-title-editorial">Real-Time Precision.</span>
              </h1>

              {/* Chinese Motto Calligraphy Line */}
              <div className="flex items-center justify-center gap-unit-md my-unit-sm">
                <span className="h-px w-10 bg-outline-variant" />
                <p className="font-title-editorial text-title-editorial text-tertiary tracking-wide italic">
                  知行合一 · 教学相长
                </p>
                <span className="h-px w-10 bg-outline-variant" />
              </div>

              {/* Subtitle */}
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-unit-xl font-normal leading-relaxed">
                {language === 'zh'
                  ? '消除学业答疑延迟。为北京交通大学全体院系师生打造即时一对一沟通、课程辅导与答疑预约平台。'
                  : 'Eliminate consultation delays. Instant 1-on-1 direct dialogue, course advising, and office-hour scheduling tailored for every faculty across Beijing Jiaotong University.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-unit-md w-full max-w-md">
                <button
                  type="button"
                  onClick={() => handleActionClick('student')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-unit-xs px-unit-lg py-unit-sm rounded-full bg-primary-container text-on-primary font-label-code text-label-code uppercase tracking-wider font-semibold shadow-[0_0_35px_rgba(16,185,129,0.35)] hover:shadow-[0_0_50px_rgba(16,185,129,0.55)] hover:bg-surface-tint active:scale-[0.98] transition-all duration-300 cursor-pointer"
                >
                  <span>
                    {currentUser
                      ? language === 'zh'
                        ? '进入咨询空间'
                        : 'Enter Consultation Portal'
                      : language === 'zh'
                      ? '开启学术咨询'
                      : 'Launch Consultation Portal'}
                  </span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>

                <a
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-unit-xs px-unit-lg py-unit-sm rounded-full bg-surface-container-high/60 backdrop-blur-md text-on-surface font-label-code text-label-code uppercase tracking-wider font-medium hover:bg-surface-container-highest transition-all duration-300 shadow-sm border border-outline-variant/30"
                  href="#roster-stream"
                >
                  <span className="material-symbols-outlined text-base text-secondary">explore</span>
                  <span>{language === 'zh' ? '浏览学者名录' : 'Explore Faculty Directory'}</span>
                </a>
              </div>

              {/* Live Metric Stats */}
              <div className="mt-unit-2xl grid grid-cols-2 sm:grid-cols-4 gap-unit-md pt-unit-lg border-t border-outline-variant/20 w-full max-w-4xl">
                <div className="flex flex-col items-center">
                  <span className="font-label-code text-label-code text-outline uppercase tracking-wider">
                    Active Faculty
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-semibold">
                    1,420+
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-label-code text-label-code text-outline uppercase tracking-wider">
                    Avg Latency
                  </span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    &lt; 14 Min
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-label-code text-label-code text-outline uppercase tracking-wider">
                    State Laboratories
                  </span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    9 Key Bases
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-label-code text-label-code text-outline uppercase tracking-wider">
                    Daily Sessions
                  </span>
                  <span className="font-headline-sm text-headline-sm text-secondary font-semibold">
                    680 Live
                  </span>
                </div>
              </div>

              <a
                className="mt-unit-xl inline-flex items-center gap-unit-xs px-unit-md py-unit-2xs rounded-full bg-surface-container-lowest/60 text-outline-variant hover:text-on-surface transition-colors border border-outline-variant/20"
                href="#roster-stream"
              >
                <span className="font-label-code text-label-code uppercase tracking-widest text-on-surface-variant">
                  Scroll to explore narrative
                </span>
                <span className="material-symbols-outlined text-sm animate-bounce text-primary">
                  expand_more
                </span>
              </a>
            </div>
          </section>

          {/* SECTION 2: ARCHITECTURAL PILLARS */}
          <section className="w-full py-unit-4xl relative overflow-hidden bg-surface scroll-mt-24" id="roster-stream">
            <div className="absolute top-1/4 -left-48 w-96 h-96 rounded-full bg-secondary-container/20 blur-[140px] pointer-events-none" />
            <div className="absolute bottom-10 -right-48 w-96 h-96 rounded-full bg-tertiary/10 blur-[140px] pointer-events-none" />

            <div className="max-w-container-max mx-auto px-gutter-desktop">
              {/* Section Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-unit-3xl">
                <div className="flex flex-col gap-unit-xs max-w-2xl">
                  <div className="flex items-center gap-unit-xs">
                    <span className="w-6 h-px bg-primary" />
                    <span className="font-label-code text-label-code text-primary uppercase tracking-widest">
                      Architectural Pillars
                    </span>
                  </div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">
                    Designed for Scholarly Rigor &amp; Frictionless Advisement
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    A synchronized academic operating environment designed specifically for the doctoral
                    candidate, graduate researcher, and undergraduate scholar.
                  </p>
                </div>
                <div className="mt-unit-md md:mt-0 flex items-center gap-unit-sm">
                  <span className="font-label-code text-label-code text-outline uppercase">
                    BJTU CAS PROTOCOL 3.4
                  </span>
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                </div>
              </div>

              <div className="flex flex-col gap-unit-3xl">
                {/* MODULE 01: Student Viewfinder */}
                <div className="w-full rounded-xl bg-surface-container-low/90 backdrop-blur-2xl p-unit-xl shadow-2xl relative overflow-hidden group border border-outline-variant/30">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-transparent opacity-80" />
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-unit-xl items-center">
                    <div className="lg:col-span-5 flex flex-col gap-unit-md">
                      <div className="flex items-center gap-unit-xs">
                        <span className="px-unit-xs py-0.5 rounded bg-surface-container-high font-label-code text-label-code text-secondary">
                          MODULE 01
                        </span>
                        <span className="font-label-code text-label-code text-outline uppercase tracking-wider">
                          Student Viewfinder
                        </span>
                      </div>
                      <h3 className="font-headline-md text-headline-md text-on-surface">
                        Smart Roster &amp; Real-Time Availability
                      </h3>
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        Live faculty telepresence tracking down to campus hall coordinates. Monitor ongoing
                        office hours, available thesis guidance blocks, and schedule sync with BJTU Academic
                        Affairs calendar.
                      </p>
                      <div className="flex flex-col gap-unit-xs pt-unit-xs">
                        <div className="flex items-center gap-unit-sm text-body-sm text-on-surface">
                          <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                          <span>Instant geo-verified office presence via Siyuan Hall iBeacons</span>
                        </div>
                        <div className="flex items-center gap-unit-sm text-body-sm text-on-surface">
                          <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                          <span>Intelligent time-slot booking with Outlook / DingTalk calendar synchro</span>
                        </div>
                        <div className="flex items-center gap-unit-sm text-body-sm text-on-surface">
                          <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                          <span>Automated queue status &amp; walk-in alerts for laboratory office desks</span>
                        </div>
                      </div>
                      <div className="pt-unit-sm">
                        <button
                          type="button"
                          onClick={() => handleActionClick('student')}
                          className="inline-flex items-center gap-unit-xs px-unit-md py-unit-xs rounded bg-surface-container-highest text-primary font-label-code text-label-code uppercase tracking-wider hover:bg-primary-container hover:text-on-primary transition-all cursor-pointer"
                        >
                          <span>Explore Live Roster</span>
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                      </div>
                    </div>

                    <div className="lg:col-span-7 flex flex-col gap-unit-md">
                      {/* Live Ticker of Student-Teacher Consultations */}
                      <div className="flex items-center justify-between px-unit-sm py-2 rounded-lg bg-surface-container-high/60 backdrop-blur-md border border-primary/20 text-xs">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="relative flex h-2 w-2 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                          </span>
                          <span className="font-label-code text-primary uppercase font-semibold shrink-0">
                            {language === 'zh' ? '全校答疑实时动态' : 'Live Advising Stream'}
                          </span>
                          <span className="text-outline shrink-0">•</span>
                          <span className="font-body-sm text-on-surface-variant truncate">
                            {language === 'zh'
                              ? '张晨教授正在思源楼402为王浩然同学解答控制算法；李微教授线上答疑室3人在线研讨中'
                              : 'Prof. Chen Zhang is advising Wang Haoran on Rail Control (Siyuan 402); Prof. Li Wei room has 3 students active'}
                          </span>
                        </div>
                        <span className="font-label-code text-[11px] text-secondary shrink-0 hidden sm:inline-block">
                          {language === 'zh' ? '14个答疑室进行中' : '14 Sessions Active'}
                        </span>
                      </div>

                      {/* Faculty Card 1: Prof. Chen Zhang */}
                      <div className="rounded-lg bg-surface-container p-unit-md shadow-md transition-all hover:bg-surface-container-high border border-outline-variant/20">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-unit-sm">
                          <div className="flex items-center gap-unit-md">
                            <img
                              className="w-14 h-14 rounded-full object-cover shadow-md ring-1 ring-primary/30"
                              alt="Prof. Chen Zhang"
                              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQKPrt-I2VNAUYYXmhphKcPo0bf1AA8q7moxA7W08n4dz5VM2wLH9v52LyXhXyeYHCQxJvCvLkvsTXjhDva0ZvRPQ4delQU9Wb9hRI_xYepHEH0sU10cHJQI5y2oqkzPDRvUte74Bi4vDi7pu6IWqR2q010aCkU_nxrKX8rbSytIIKQrYej-aGpUjhIjTO1xHtuN0MdrXS9b5xX_AIvUfOaZDl8sIxfkN4OeFkB2sRM-IvlVbeyLUr"
                              onError={(e) => {
                                e.currentTarget.src = '/bjtu_emblem.png';
                              }}
                            />
                            <div className="flex flex-col">
                              <div className="flex items-center gap-unit-xs">
                                <span className="font-headline-sm text-headline-sm text-on-surface">
                                  Prof. Chen Zhang
                                </span>
                                <span className="px-unit-2xs py-0.5 rounded bg-surface-container-highest font-label-badge text-label-badge text-secondary">
                                  IEEE Fellow
                                </span>
                              </div>
                              <span className="font-label-code text-label-code text-outline">
                                School of Computer &amp; Information Technology
                              </span>
                              <span className="font-body-sm text-body-sm text-on-surface-variant">
                                Focus: Autonomous Rail Safety &amp; Edge Neural Networks
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-start sm:items-end gap-unit-2xs w-full sm:w-auto">
                            <span className="inline-flex items-center gap-1.5 px-unit-xs py-0.5 rounded-full bg-surface-container-lowest text-primary font-label-code text-label-code border border-primary/20">
                              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                              Live in Siyuan Hall 402
                            </span>
                            <span className="font-body-sm text-body-sm text-secondary">
                              Next slot: Today 15:30
                            </span>
                          </div>
                        </div>

                        {/* ACTIVE STUDENT-TEACHER CONSULTATION SECTION */}
                        <div className="mt-unit-sm p-unit-sm rounded bg-surface-container-low/95 border border-primary/30 relative overflow-hidden">
                          <div className="flex items-center justify-between gap-unit-xs mb-unit-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                              </span>
                              <span className="font-label-code text-xs text-primary font-semibold uppercase tracking-wider">
                                {language === 'zh' ? '正在进行一对一答疑' : 'Active 1-on-1 Advising Session'}
                              </span>
                            </div>
                            <span className="font-label-code text-[11px] text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">
                              {language === 'zh' ? '已进行 28 分钟 · 思源东楼402' : '28 min elapsed · Siyuan East 402'}
                            </span>
                          </div>

                          <div className="flex items-center gap-unit-sm bg-surface-container/90 p-unit-xs rounded">
                            <img
                              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgd-b1mcTk4ODLnXjMeQ3s4f3hrEMvobs-2cgcxrBFjiQPoMEjcO5lVTA9_SnyinOU14tkMrqfm1Ci94dkYjmmlsIfTgulYgwm01MdDSoUkp4ce_fNeznqGomCqPjrAViVghKQtebGHAmmy6QmsQqc7J0ud63z9LCZD14Tt94se5ziyMejMnpcGamNxkILx22-aIqY--gTL3bEt-uer3CaaGpygVSQdlHz5Ihf2XXvGEHm_gVEfXVF"
                              alt="Wang Haoran"
                              className="w-10 h-10 rounded-full object-cover ring-1 ring-primary/40 shrink-0"
                              onError={(e) => {
                                e.currentTarget.src = '/bjtu_emblem.png';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-unit-xs">
                                <span className="font-headline-sm text-sm text-on-surface font-semibold">
                                  {language === 'zh' ? '王浩然 (本科大四 · 软件工程)' : 'Wang Haoran (Senior · SE)'}
                                </span>
                                <span className="font-label-code text-[11px] text-outline">ID: 21281034</span>
                              </div>
                              <p className="font-body-sm text-xs text-secondary truncate">
                                {language === 'zh'
                                  ? '咨询议题：《高速列车分布式协同控制》李雅普诺夫收敛性证明'
                                  : 'Topic: Rail Transit Multi-Agent Consensus Stability Proof'}
                              </p>
                            </div>
                          </div>

                          <div className="mt-unit-xs flex items-center justify-between text-[11px] font-label-code text-on-surface-variant pt-1 border-t border-outline-variant/20">
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs text-tertiary">hourglass_top</span>
                              <span>
                                {language === 'zh'
                                  ? '排队等待: 2位同学 (李明、张伟)'
                                  : 'Queue: 2 students waiting (Ming Li, Wei Zhang)'}
                              </span>
                            </div>
                            <span className="text-primary font-medium">
                              {language === 'zh' ? '白板协同同步中' : 'Whiteboard Sync Active'}
                            </span>
                          </div>
                        </div>

                        {/* Actions Row */}
                        <div className="mt-unit-sm pt-unit-xs flex flex-wrap items-center justify-between gap-unit-sm bg-surface-container-low p-unit-sm rounded">
                          <div className="flex items-center gap-unit-xs">
                            <span className="material-symbols-outlined text-secondary text-sm">schedule</span>
                            <span className="font-body-sm text-body-sm text-on-surface">
                              Office Hours: Tue/Thu 14:00 - 17:00
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleActionClick('student')}
                              className="px-unit-sm py-unit-xs rounded bg-surface-container-highest text-primary font-label-code text-xs uppercase tracking-wider hover:bg-primary hover:text-on-primary transition-all cursor-pointer"
                            >
                              {language === 'zh' ? '进入师生答疑室' : 'Enter Advising Room'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleActionClick('student')}
                              className="px-unit-md py-unit-xs rounded bg-primary-container text-on-primary font-label-code text-label-code uppercase tracking-wider font-semibold hover:bg-surface-tint shadow-sm transition-all cursor-pointer"
                            >
                              {language === 'zh' ? '预约下一答疑时段' : 'Instant Reserve Office Hour'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Faculty Card 2: Prof. Li Wei */}
                      <div className="rounded-lg bg-surface-container p-unit-md shadow-md transition-all hover:bg-surface-container-high border border-outline-variant/20">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-unit-sm">
                          <div className="flex items-center gap-unit-md">
                            <img
                              className="w-14 h-14 rounded-full object-cover shadow-md ring-1 ring-secondary/30"
                              alt="Prof. Li Wei"
                              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEZD2IE-5QFAZx0eWnOpG2xzHkAPQX3tUJ2_aewLJ2mDmwCzyQiV8gVLCNjd5uoStz9P1ZWZf8iK8jd_0GPmiqf4NxOPU9ozThwshOZkGrzTiKZRM7rkf6VumCCizhEsq-zyRT6OYGjBX8GPLFnegXLuf1_XuD1p17bDVMDOl0P5uOIyEnHG_hqEz_JNy-rFFmLHS8WKhdQlVcm7QhQJBNcYpaoKnHLb2NvnyH7kVdXDKxmKcD39xM"
                              onError={(e) => {
                                e.currentTarget.src = '/bjtu_emblem.png';
                              }}
                            />
                            <div className="flex flex-col">
                              <div className="flex items-center gap-unit-xs">
                                <span className="font-headline-sm text-headline-sm text-on-surface">
                                  Prof. Li Wei
                                </span>
                                <span className="px-unit-2xs py-0.5 rounded bg-surface-container-highest font-label-badge text-label-badge text-tertiary">
                                  Chair of Telecom
                                </span>
                              </div>
                              <span className="font-label-code text-label-code text-outline">
                                School of Electronic &amp; Information Engineering
                              </span>
                              <span className="font-body-sm text-body-sm text-on-surface-variant">
                                Focus: 6G High-Speed Train Wireless Comms &amp; MIMO
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-start sm:items-end gap-unit-2xs w-full sm:w-auto">
                            <span className="inline-flex items-center gap-1.5 px-unit-xs py-0.5 rounded-full bg-surface-container-lowest text-tertiary font-label-code text-label-code border border-tertiary/20">
                              <span className="w-2 h-2 rounded-full bg-tertiary" />
                              Virtual Office Hour (4 slots left)
                            </span>
                            <span className="font-body-sm text-body-sm text-outline">
                              Open consultation queue
                            </span>
                          </div>
                        </div>

                        {/* ACTIVE VIRTUAL CONSULTATION ROOM SECTION */}
                        <div className="mt-unit-sm p-unit-sm rounded bg-surface-container-low/95 border border-tertiary/30 relative overflow-hidden">
                          <div className="flex items-center justify-between gap-unit-xs mb-unit-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary" />
                              </span>
                              <span className="font-label-code text-xs text-tertiary font-semibold uppercase tracking-wider">
                                {language === 'zh' ? '线上答疑研讨室 #304 进行中' : 'Virtual Advising Room #304 Open'}
                              </span>
                            </div>
                            <span className="font-label-code text-[11px] text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">
                              {language === 'zh' ? '3位同学在线研讨' : '3 Students Connected'}
                            </span>
                          </div>

                          <div className="bg-surface-container/90 p-unit-xs rounded space-y-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center -space-x-1.5 overflow-hidden">
                                <div className="w-6 h-6 rounded-full bg-primary-container text-[10px] text-surface-container-lowest font-bold flex items-center justify-center ring-1 ring-surface">韩</div>
                                <div className="w-6 h-6 rounded-full bg-secondary-container text-[10px] text-secondary font-bold flex items-center justify-center ring-1 ring-surface">赵</div>
                                <div className="w-6 h-6 rounded-full bg-tertiary-container text-[10px] text-tertiary font-bold flex items-center justify-center ring-1 ring-surface">孙</div>
                              </div>
                              <span className="font-label-code text-[11px] text-secondary">
                                {language === 'zh' ? '正在解答: 韩林同学提问' : 'Live Q&A: Student Han Lin'}
                              </span>
                            </div>
                            <p className="font-body-sm text-xs text-on-surface italic">
                              {language === 'zh'
                                ? '“李老师，请教一下在350km/h高速移动场景下，6G大规模MIMO信道的多普勒频移多径补偿方案参数选取？”'
                                : '"Professor, how to optimize Doppler shift compensation in 350km/h rail MIMO?"'}
                            </p>
                          </div>

                          <div className="mt-unit-xs flex items-center justify-between text-[11px] font-label-code text-on-surface-variant pt-1 border-t border-outline-variant/20">
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs text-primary">forum</span>
                              <span>{language === 'zh' ? '开放互动讨论通道' : 'Open Q&A Discussion Thread'}</span>
                            </div>
                            <span className="text-tertiary font-medium">
                              {language === 'zh' ? '剩余 4 个咨询名额' : '4 slots remaining'}
                            </span>
                          </div>
                        </div>

                        {/* Actions Row */}
                        <div className="mt-unit-md pt-unit-sm flex flex-wrap items-center justify-between gap-unit-sm bg-surface-container-low p-unit-sm rounded">
                          <div className="flex items-center gap-unit-xs">
                            <span className="material-symbols-outlined text-outline text-sm">meeting_room</span>
                            <span className="font-body-sm text-body-sm text-on-surface">
                              Room 612, Mechanical Building West
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleActionClick('student')}
                              className="px-unit-sm py-unit-xs rounded bg-surface-container-highest text-tertiary font-label-code text-xs uppercase tracking-wider hover:bg-tertiary hover:text-surface-container-lowest transition-all cursor-pointer"
                            >
                              {language === 'zh' ? '进入线上研讨' : 'Join Virtual Room'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleActionClick('student')}
                              className="px-unit-md py-unit-xs rounded bg-primary text-on-primary font-label-code text-label-code uppercase tracking-wider hover:bg-primary-container transition-all cursor-pointer"
                            >
                              {language === 'zh' ? '发起学业咨询' : 'Request 1-on-1 Sync'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* MODULE 02: Exchange Core */}
                <div className="w-full rounded-xl bg-surface-container-low/90 backdrop-blur-2xl p-unit-xl shadow-2xl relative overflow-hidden group border border-outline-variant/30">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-tertiary via-primary to-transparent opacity-80" />
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-unit-xl items-center">
                    {/* Left: Chat Simulator */}
                    <div className="lg:col-span-7 order-2 lg:order-1 flex flex-col rounded-lg bg-surface-container-lowest p-unit-md shadow-xl border border-outline-variant/30">
                      <div className="flex items-center justify-between pb-unit-sm bg-surface-container px-unit-sm py-unit-xs rounded">
                        <div className="flex items-center gap-unit-xs">
                          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                          <span className="font-label-code text-label-code text-on-surface font-semibold">
                            DIRECT SESSION: #BJTU-8842-ADV
                          </span>
                          <span className="font-body-sm text-body-sm text-outline">| Prof. Chen Zhang</span>
                        </div>
                        <div className="flex items-center gap-unit-xs">
                          <span className="font-label-code text-label-code text-secondary bg-secondary-container/40 px-2 py-0.5 rounded">
                            Encrypted Institutional Channel
                          </span>
                          <span className="font-label-code text-label-code text-outline">Avg &lt; 12m</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-unit-md py-unit-md px-unit-xs max-h-[380px] overflow-y-auto">
                        {/* Message 1 */}
                        <div className="flex flex-col items-end self-end max-w-[85%]">
                          <div className="p-unit-sm rounded-lg bg-surface-container-high text-on-surface text-body-sm shadow-sm">
                            <p className="mb-1">
                              Professor, I reviewed{' '}
                              <span className="text-primary font-semibold">Theorem 4.2</span> in the Advanced
                              Rail Transit Control paper—could we discuss the Lyapunov stability condition for
                              discrete-time perturbations?
                            </p>
                            <span className="font-label-code text-label-code text-outline block text-right mt-1">
                              14:18 · CAS Student ID: 21281034
                            </span>
                          </div>
                        </div>

                        {/* Message 2 */}
                        <div className="flex flex-col items-start self-start max-w-[88%]">
                          <div className="p-unit-sm rounded-lg bg-surface-container-highest text-on-surface text-body-sm shadow-sm">
                            <div className="flex items-center gap-unit-xs mb-1">
                              <span className="font-label-badge text-label-badge text-tertiary">
                                Prof. Chen Zhang
                              </span>
                              <span className="font-label-code text-label-code text-outline">14:26</span>
                            </div>
                            <p className="mb-2">
                              Good catch. The Lyapunov function holds provided the slip vector remains within
                              the Euclidean bounded manifold. Take a look at the attached lemma notes before our
                              slot at 15:30.
                            </p>
                            <div className="flex items-center justify-between p-unit-xs rounded bg-surface-container-lowest gap-unit-md border border-outline-variant/20">
                              <div className="flex items-center gap-unit-xs">
                                <span className="material-symbols-outlined text-primary text-xl">
                                  picture_as_pdf
                                </span>
                                <div className="flex flex-col">
                                  <span className="font-label-code text-label-code text-on-surface font-medium">
                                    Research_Draft_v3_LemmaNotes.pdf
                                  </span>
                                  <span className="font-body-sm text-body-sm text-outline">
                                    2.4 MB · Verified Hash
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-unit-xs">
                                <span className="px-unit-2xs py-0.5 rounded bg-surface-container text-secondary font-label-badge text-label-badge">
                                  Reviewed
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    showToast(
                                      language === 'zh'
                                        ? '正在下载 Research_Draft_v3_LemmaNotes.pdf...'
                                        : 'Downloading Research_Draft_v3_LemmaNotes.pdf...'
                                    )
                                  }
                                  className="p-1 rounded bg-surface-container-high hover:bg-primary hover:text-on-primary transition-colors cursor-pointer"
                                  title="Download Lemma Notes"
                                >
                                  <span className="material-symbols-outlined text-sm">download</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Appended simulation messages */}
                        {chatMessages.map((m, idx) => (
                          <div
                            key={idx}
                            className={`flex flex-col ${
                              m.sender === 'student'
                                ? 'items-end self-end max-w-[85%]'
                                : 'items-start self-start max-w-[88%]'
                            }`}
                          >
                            <div
                              className={`p-unit-sm rounded-lg text-body-sm shadow-sm ${
                                m.sender === 'student'
                                  ? 'bg-surface-container-high text-on-surface'
                                  : 'bg-surface-container-highest text-on-surface'
                              }`}
                            >
                              {m.sender === 'professor' && (
                                <div className="flex items-center gap-unit-xs mb-1">
                                  <span className="font-label-badge text-label-badge text-tertiary">
                                    Prof. Chen Zhang
                                  </span>
                                  <span className="font-label-code text-label-code text-outline">
                                    {m.time}
                                  </span>
                                </div>
                              )}
                              <p>{m.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Chat Input row */}
                      <div className="flex items-center gap-unit-xs p-unit-xs bg-surface-container rounded border border-outline-variant/30">
                        <button
                          type="button"
                          onClick={() =>
                            showToast(
                              language === 'zh'
                                ? '文件附件选择器已就绪'
                                : 'File attachment picker active'
                            )
                          }
                          className="p-unit-xs text-outline hover:text-on-surface transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-lg">attach_file</span>
                        </button>
                        <input
                          className="w-full bg-surface-container-low px-unit-sm py-unit-xs rounded text-body-sm text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder={
                            language === 'zh'
                              ? '输入学术咨询内容或公式推导批注...'
                              : 'Draft academic query or reference equation notation...'
                          }
                          type="text"
                          value={chatInputValue}
                          onChange={(e) => setChatInputValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSendChat();
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleSendChat}
                          className="px-unit-md py-unit-xs rounded bg-primary text-on-primary font-label-code text-label-code uppercase tracking-wider font-semibold hover:bg-primary-container transition-colors cursor-pointer"
                        >
                          Send
                        </button>
                      </div>
                    </div>

                    {/* Right: Module 2 Specs */}
                    <div className="lg:col-span-5 order-1 lg:order-2 flex flex-col gap-unit-md">
                      <div className="flex items-center gap-unit-xs">
                        <span className="px-unit-xs py-0.5 rounded bg-surface-container-high font-label-code text-label-code text-tertiary">
                          MODULE 02
                        </span>
                        <span className="font-label-code text-label-code text-outline uppercase tracking-wider">
                          Exchange Core
                        </span>
                      </div>
                      <h3 className="font-headline-md text-headline-md text-on-surface">
                        Live Dialogue &amp; Academic Exchange Engine
                      </h3>
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        Replace cluttered email inboxes with contextual, equation-ready dialogue threads. Direct
                        document markup, LaTeX syntax parsing, and institutional traceability for research papers.
                      </p>
                      <div className="grid grid-cols-2 gap-unit-sm pt-unit-xs">
                        <div className="p-unit-sm rounded bg-surface-container border border-outline-variant/20">
                          <span className="material-symbols-outlined text-primary mb-1">functions</span>
                          <span className="font-headline-sm text-headline-sm text-on-surface block">
                            LaTeX
                          </span>
                          <span className="font-body-sm text-body-sm text-outline">
                            Real-time formula and equation compilation
                          </span>
                        </div>
                        <div className="p-unit-sm rounded bg-surface-container border border-outline-variant/20">
                          <span className="material-symbols-outlined text-secondary mb-1">security</span>
                          <span className="font-headline-sm text-headline-sm text-on-surface block">
                            State IP
                          </span>
                          <span className="font-body-sm text-body-sm text-outline">
                            Protected by BJTU State Lab NDA protocols
                          </span>
                        </div>
                      </div>
                      <div className="pt-unit-sm">
                        <a
                          className="font-label-code text-label-code text-tertiary hover:text-on-surface uppercase tracking-wider inline-flex items-center gap-unit-2xs"
                          href="#telemetry"
                        >
                          <span>View Telemetry Guidelines</span>
                          <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* MODULE 03: Faculty Console */}
                <div
                  className="w-full rounded-xl bg-surface-container-low/90 backdrop-blur-2xl p-unit-xl shadow-2xl relative overflow-hidden group border border-outline-variant/30 scroll-mt-24"
                  id="telemetry"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary-container opacity-80" />
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-unit-xl items-center">
                    <div className="lg:col-span-5 flex flex-col gap-unit-md">
                      <div className="flex items-center gap-unit-xs">
                        <span className="px-unit-xs py-0.5 rounded bg-surface-container-high font-label-code text-label-code text-primary">
                          MODULE 03
                        </span>
                        <span className="font-label-code text-label-code text-outline uppercase tracking-wider">
                          Faculty Console
                        </span>
                      </div>
                      <h3 className="font-headline-md text-headline-md text-on-surface">
                        Academic Transparency &amp; Automated Student Profiling
                      </h3>
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        When students request guidance, professors receive instant verified academic
                        telemetry. Course enrollment history, thesis topic synopsis, and academic standings are
                        synchronized seamlessly.
                      </p>
                      <div className="flex flex-col gap-unit-xs pt-unit-xs">
                        <div className="flex items-center justify-between p-unit-xs rounded bg-surface-container border border-outline-variant/20">
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            Faculty Preparation Time Reduced
                          </span>
                          <span className="font-label-code text-label-code text-primary font-bold">
                            ~74%
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-unit-xs rounded bg-surface-container border border-outline-variant/20">
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            Cross-Discipline Major Alignments
                          </span>
                          <span className="font-label-code text-label-code text-secondary font-bold">
                            100% Siyuan Sync
                          </span>
                        </div>
                      </div>
                      <div className="pt-unit-sm">
                        <button
                          type="button"
                          onClick={() => handleActionClick('teacher')}
                          className="inline-flex items-center gap-unit-xs px-unit-md py-unit-xs rounded bg-surface-container-highest text-on-surface font-label-code text-label-code uppercase tracking-wider hover:bg-primary hover:text-on-primary transition-colors cursor-pointer"
                        >
                          <span>Open Faculty Workspace</span>
                          <span className="material-symbols-outlined text-sm">open_in_new</span>
                        </button>
                      </div>
                    </div>

                    <div className="lg:col-span-7 flex flex-col gap-unit-sm">
                      <div className="rounded-lg bg-surface-container p-unit-lg shadow-xl relative overflow-hidden border border-outline-variant/30">
                        <div className="flex items-center justify-between pb-unit-sm mb-unit-sm border-b border-outline-variant/30">
                          <div className="flex items-center gap-unit-xs">
                            <span className="material-symbols-outlined text-primary text-base">badge</span>
                            <span className="font-label-code text-label-code text-on-surface font-semibold uppercase">
                              Incoming Advisement Consultation Request
                            </span>
                          </div>
                          {slotStatus === 'accepted' ? (
                            <span className="px-unit-xs py-0.5 rounded-full bg-primary-container/30 text-primary font-label-badge text-label-badge font-semibold uppercase flex items-center gap-1 border border-primary/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              {language === 'zh' ? '已接受预约 · 今日 15:30' : 'Slot Confirmed · Today 15:30'}
                            </span>
                          ) : slotStatus === 'rescheduled' ? (
                            <span className="px-unit-xs py-0.5 rounded-full bg-secondary-container/30 text-secondary font-label-badge text-label-badge font-semibold uppercase flex items-center gap-1 border border-secondary/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                              {language === 'zh' ? '调整方案已发出' : 'Reschedule Proposed'}
                            </span>
                          ) : (
                            <span className="px-unit-xs py-0.5 rounded-full bg-tertiary-container/30 text-tertiary font-label-badge text-label-badge font-semibold uppercase border border-tertiary/30">
                              {language === 'zh' ? '待导师审批' : 'Pending Professor Approval'}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-unit-md">
                          <div className="flex items-center gap-unit-md">
                            <img
                              className="w-16 h-16 rounded-lg object-cover shadow ring-1 ring-primary/40"
                              alt="Wang Haoran"
                              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgd-b1mcTk4ODLnXjMeQ3s4f3hrEMvobs-2cgcxrBFjiQPoMEjcO5lVTA9_SnyinOU14tkMrqfm1Ci94dkYjmmlsIfTgulYgwm01MdDSoUkp4ce_fNeznqGomCqPjrAViVghKQtebGHAmmy6QmsQqc7J0ud63z9LCZD14Tt94se5ziyMejMnpcGamNxkILx22-aIqY--gTL3bEt-uer3CaaGpygVSQdlHz5Ihf2XXvGEHm_gVEfXVF"
                              onError={(e) => {
                                e.currentTarget.src = '/academic_rail_emblem.svg';
                              }}
                            />
                            <div className="flex flex-col">
                              <div className="flex items-center gap-unit-xs">
                                <span className="font-headline-sm text-headline-sm text-on-surface">
                                  Wang Haoran (王浩然)
                                </span>
                                <span className="font-label-code text-label-code text-outline">
                                  ID: 21281034
                                </span>
                              </div>
                              <span className="font-body-sm text-body-sm text-secondary font-medium">
                                School of Software Engineering / Transit Information
                              </span>
                              <span className="font-body-sm text-body-sm text-on-surface-variant">
                                Undergraduate Year 4 · Recommended for Master's Exemption
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-start sm:items-end bg-surface-container-low p-unit-xs rounded border border-outline-variant/20">
                            <span className="font-label-code text-label-code text-outline uppercase">
                              Cumulative Standing
                            </span>
                            <span className="font-headline-sm text-headline-sm text-primary font-bold">
                              GPA 3.92{' '}
                              <span className="text-body-sm font-normal text-on-surface-variant">
                                (Top 3%)
                              </span>
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-unit-xs my-unit-md">
                          <span className="px-unit-xs py-1 rounded bg-secondary-container/30 text-secondary font-label-code text-label-code">
                            Honor Student
                          </span>
                          <span className="px-unit-xs py-1 rounded bg-surface-container-high text-on-surface font-label-code text-label-code">
                            Graduate Thesis Candidate
                          </span>
                          <span className="px-unit-xs py-1 rounded bg-surface-container-high text-primary font-label-code text-label-code">
                            Enrolled: High-Speed Rail Intelligent Dispatching
                          </span>
                          <span className="px-unit-xs py-1 rounded bg-surface-container-high text-tertiary font-label-code text-label-code">
                            Prerequisite Completed (Grade: A+)
                          </span>
                        </div>

                        <div className="p-unit-sm rounded bg-surface-container-low mb-unit-md border border-outline-variant/20">
                          <span className="font-label-code text-label-code text-outline uppercase block mb-1">
                            Proposed Discussion Topic
                          </span>
                          <p className="font-body-sm text-body-sm text-on-surface">
                            “Validation of graph neural network dispatch models for Beijing-Shanghai High-Speed Line disruptions under extreme winter blizzard conditions.”
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-unit-xs">
                          <button
                            type="button"
                            onClick={() => {
                              setSlotStatus('accepted');
                              showToast(
                                language === 'zh'
                                  ? '已成功确认接受王浩然同学的答疑预约 (今日 15:30 思源楼402)！'
                                  : 'Successfully accepted Wang Haoran advisement slot (Today 15:30 Siyuan 402)!'
                              );
                            }}
                            className="inline-flex items-center justify-center gap-unit-xs px-unit-md py-unit-xs rounded bg-primary-container text-on-primary font-label-code text-label-code uppercase tracking-wider font-semibold hover:bg-surface-tint transition-all cursor-pointer shadow-sm"
                          >
                            <span className="material-symbols-outlined text-base">check</span>
                            <span>{slotStatus === 'accepted' ? (language === 'zh' ? '已接受' : 'Accepted') : 'Accept Slot'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSlotStatus('rescheduled');
                              showToast(
                                language === 'zh'
                                  ? '预约日程调整方案已通过校园CAS发送至学生个人中心。'
                                  : 'Rescheduling proposal transmitted to student CAS calendar.'
                              );
                            }}
                            className="inline-flex items-center justify-center gap-unit-xs px-unit-md py-unit-xs rounded bg-surface-container-highest text-on-surface font-label-code text-label-code uppercase tracking-wider hover:bg-surface-bright transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base">edit_calendar</span>
                            <span>{slotStatus === 'rescheduled' ? (language === 'zh' ? '已调整' : 'Rescheduled') : 'Reschedule'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              showToast(
                                language === 'zh'
                                  ? '正在连接北京交通大学校内加密语音通道 (BJTU VoCAS)...'
                                  : 'Connecting encrypted BJTU campus voice bridge...'
                              )
                            }
                            className="inline-flex items-center justify-center gap-unit-xs px-unit-md py-unit-xs rounded bg-surface-container-highest text-secondary font-label-code text-label-code uppercase tracking-wider hover:bg-secondary-container hover:text-on-secondary transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base">call</span>
                            <span>Audio Call</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: METRIC COUNTERS */}
          <section className="w-full py-unit-3xl bg-surface-container-lowest relative overflow-hidden border-y border-outline-variant/20">
            <div className="max-w-container-max mx-auto px-gutter-desktop">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-unit-lg">
                <div className="flex flex-col p-unit-lg rounded-lg bg-surface-container-low/70 backdrop-blur-md relative overflow-hidden group hover:bg-surface-container transition-all border border-outline-variant/20">
                  <div className="flex items-center justify-between mb-unit-sm">
                    <span className="material-symbols-outlined text-primary text-3xl">diversity_3</span>
                    <span className="font-label-code text-label-code text-secondary font-semibold">
                      +28% YoY
                    </span>
                  </div>
                  <span className="font-display-hero text-headline-xl text-on-surface font-bold tracking-tight mb-unit-xs">
                    18,400+
                  </span>
                  <span className="font-headline-sm text-headline-sm text-secondary font-medium">
                    Consultations Completed
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Verified 1-on-1 sessions between registered BJTU students and professors across campus.
                  </p>
                </div>

                <div className="flex flex-col p-unit-lg rounded-lg bg-surface-container-low/70 backdrop-blur-md relative overflow-hidden group hover:bg-surface-container transition-all border border-outline-variant/20">
                  <div className="flex items-center justify-between mb-unit-sm">
                    <span className="material-symbols-outlined text-tertiary text-3xl">timer</span>
                    <span className="font-label-code text-label-code text-tertiary font-semibold">
                      Strict SLA
                    </span>
                  </div>
                  <span className="font-display-hero text-headline-xl text-on-surface font-bold tracking-tight mb-unit-xs">
                    98.4%
                  </span>
                  <span className="font-headline-sm text-headline-sm text-tertiary font-medium">
                    On-Time Response Rate
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Direct feedback within institutional 24-hour guidelines during active semester weeks.
                  </p>
                </div>

                <div className="flex flex-col p-unit-lg rounded-lg bg-surface-container-low/70 backdrop-blur-md relative overflow-hidden group hover:bg-surface-container transition-all border border-outline-variant/20">
                  <div className="flex items-center justify-between mb-unit-sm">
                    <span className="material-symbols-outlined text-secondary text-3xl">
                      account_balance
                    </span>
                    <span className="font-label-code text-label-code text-primary font-semibold">
                      Campus Wide
                    </span>
                  </div>
                  <span className="font-display-hero text-headline-xl text-on-surface font-bold tracking-tight mb-unit-xs">
                    23
                  </span>
                  <span className="font-headline-sm text-headline-sm text-secondary font-medium">
                    Academic Schools Active
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Full coverage from Traffic &amp; Transportation to Software, Economics, and Architecture.
                  </p>
                </div>

                <div className="flex flex-col p-unit-lg rounded-lg bg-surface-container-low/70 backdrop-blur-md relative overflow-hidden group hover:bg-surface-container transition-all border border-outline-variant/20">
                  <div className="flex items-center justify-between mb-unit-sm">
                    <span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
                    <span className="font-label-code text-label-code text-primary font-semibold">
                      Zero-Trust CAS
                    </span>
                  </div>
                  <span className="font-display-hero text-headline-xl text-on-surface font-bold tracking-tight mb-unit-xs">
                    100%
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-medium">
                    Siyuan Verified
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Secure role-based permissions authenticated via BJTU central identity credentialing.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: RESEARCH COLLOQUIA SCHEDULE */}
          <section className="w-full py-unit-4xl bg-surface relative scroll-mt-24" id="faculty-matrix">
            <div className="max-w-container-max mx-auto px-gutter-desktop">
              <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-unit-2xl">
                <div>
                  <span className="font-label-code text-label-code text-secondary uppercase tracking-widest block mb-1">
                    State Key Laboratory Network
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">
                    Upcoming Thesis &amp; Research Colloquia
                  </h2>
                </div>
                <div className="mt-unit-sm md:mt-0">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Live booking open for week 12 of semester calendar.
                  </span>
                </div>
              </div>

              <div className="flex flex-col rounded-xl overflow-hidden bg-surface-container-low shadow-xl border border-outline-variant/20">
                {/* Colloquium Row 1 */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-unit-lg bg-surface-container-low hover:bg-surface-container transition-colors gap-unit-md border-b border-outline-variant/15">
                  <div className="flex items-center gap-unit-md min-w-[280px]">
                    <span className="font-headline-md text-headline-md text-primary font-bold">14:00</span>
                    <div className="flex flex-col">
                      <span className="font-label-code text-label-code text-outline uppercase">
                        Today · Siyuan East 301
                      </span>
                      <span className="font-headline-sm text-headline-sm text-on-surface font-medium">
                        High-Speed Train Aerodynamics &amp; Tunnel Pressure Waves
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-unit-md">
                    <span className="px-unit-xs py-0.5 rounded bg-surface-container-high text-on-surface font-body-sm text-body-sm">
                      Lead: Prof. Zhao Gang
                    </span>
                    <span className="px-unit-xs py-0.5 rounded bg-primary/20 text-primary font-label-badge text-label-badge font-semibold">
                      2 Seats Open
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      showToast(
                        language === 'zh'
                          ? '已为您登记《高速列车气动学与隧道压力波》学术研讨会席位！'
                          : 'Registered seat for High-Speed Train Aerodynamics Colloquium!'
                      )
                    }
                    className="px-unit-md py-unit-xs rounded bg-surface-container-highest text-on-surface hover:bg-primary hover:text-on-primary font-label-code text-label-code uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Join Colloquium
                  </button>
                </div>

                {/* Colloquium Row 2 */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-unit-lg bg-surface-container/60 hover:bg-surface-container transition-colors gap-unit-md border-b border-outline-variant/15">
                  <div className="flex items-center gap-unit-md min-w-[280px]">
                    <span className="font-headline-md text-headline-md text-secondary font-bold">
                      16:15
                    </span>
                    <div className="flex flex-col">
                      <span className="font-label-code text-label-code text-outline uppercase">
                        Today · Virtual Webex Room A
                      </span>
                      <span className="font-headline-sm text-headline-sm text-on-surface font-medium">
                        Discrete Optimization in National Rail Freight Logistics
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-unit-md">
                    <span className="px-unit-xs py-0.5 rounded bg-surface-container-high text-on-surface font-body-sm text-body-sm">
                      Lead: Prof. Lin Yun
                    </span>
                    <span className="px-unit-xs py-0.5 rounded bg-tertiary/20 text-tertiary font-label-badge text-label-badge font-semibold">
                      Thesis Only
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      showToast(
                        language === 'zh'
                          ? '研讨会链接已发送至您的北交大校园邮箱与Webex日程。'
                          : 'Colloquium Webex bridge invitation dispatched to campus email.'
                      )
                    }
                    className="px-unit-md py-unit-xs rounded bg-surface-container-highest text-on-surface hover:bg-primary hover:text-on-primary font-label-code text-label-code uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Join Colloquium
                  </button>
                </div>

                {/* Colloquium Row 3 */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-unit-lg bg-surface-container-low hover:bg-surface-container transition-colors gap-unit-md">
                  <div className="flex items-center gap-unit-md min-w-[280px]">
                    <span className="font-headline-md text-headline-md text-on-surface font-bold">
                      09:30
                    </span>
                    <div className="flex flex-col">
                      <span className="font-label-code text-label-code text-outline uppercase">
                        Tomorrow · Mechanical Complex 512
                      </span>
                      <span className="font-headline-sm text-headline-sm text-on-surface font-medium">
                        Quantum Cryptography &amp; Railway Signaling Security
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-unit-md">
                    <span className="px-unit-xs py-0.5 rounded bg-surface-container-high text-on-surface font-body-sm text-body-sm">
                      Lead: Prof. Sun Qiang
                    </span>
                    <span className="px-unit-xs py-0.5 rounded bg-surface-bright text-on-surface font-label-badge text-label-badge font-semibold">
                      Walk-ins Welcome
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      showToast(
                        language === 'zh'
                          ? '已为您生成机械工程楼512现场通行研讨卡。'
                          : 'Generated access pass for Mechanical Complex 512.'
                      )
                    }
                    className="px-unit-md py-unit-xs rounded bg-surface-container-highest text-on-surface hover:bg-primary hover:text-on-primary font-label-code text-label-code uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Join Colloquium
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 5: ELEVATED CTA */}
          <section className="w-full py-unit-4xl bg-gradient-to-b from-surface to-surface-container-lowest relative overflow-hidden">
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[720px] h-[380px] rounded-full bg-primary-container/15 blur-[160px] pointer-events-none" />
            <div className="max-w-container-max mx-auto px-gutter-desktop relative z-10 text-center flex flex-col items-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-surface-container-high mb-unit-lg shadow-xl border border-outline-variant/30">
                <span className="material-symbols-outlined text-primary text-3xl">school</span>
              </div>
              <h2 className="font-headline-xl text-headline-xl text-on-surface max-w-3xl mb-unit-md tracking-tight">
                Elevate Your Academic Trajectory Today.
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto mb-unit-2xl">
                Available seamlessly for all BJTU undergraduate scholars, doctoral researchers, and faculty
                members with unified CAS login credentials.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-unit-md w-full max-w-md mb-unit-xl">
                <button
                  type="button"
                  onClick={() => handleActionClick('student')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-unit-sm px-unit-xl py-unit-sm rounded-full bg-gradient-to-r from-primary-container to-secondary-container text-on-primary font-label-code text-label-code uppercase tracking-wider font-bold shadow-[0_0_35px_rgba(16,185,129,0.35)] hover:shadow-[0_0_55px_rgba(16,185,129,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">vpn_key</span>
                  <span>Sign In With BJTU CAS</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      language === 'zh'
                        ? '北京交通大学信息化中心技术支持热线: 010-51688888 (思源楼103)'
                        : 'BJTU Cyber Support: 010-51688888 (Siyuan Hall 103)'
                    )
                  }
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-unit-xs px-unit-lg py-unit-sm rounded-full bg-surface-container-high text-on-surface font-label-code text-label-code uppercase tracking-wider hover:bg-surface-bright transition-all border border-outline-variant/30 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg text-outline">help_outline</span>
                  <span>Helpdesk &amp; Support</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-unit-lg text-outline font-label-code text-label-code">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-primary">domain</span>
                  Haidian Campus Main Hall
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-secondary">domain</span>
                  Weihai International Campus
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-tertiary">hub</span>
                  State Key Lab Data Hub
                </span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/20 pt-unit-4xl pb-unit-2xl mt-unit-4xl">
        <div className="max-w-container-max mx-auto px-gutter-desktop">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-unit-2xl pb-unit-3xl border-b border-outline-variant/15">
            <div className="flex flex-col gap-unit-md md:col-span-1">
              <div className="flex items-center gap-unit-sm">
                <AcademicRailEmblem className="w-8 h-8 shrink-0" />
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  BJTU Connect
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                北京交通大学学业咨询及跨学科学术辅导平台。连接名师学者与卓越学子，启迪未来研究思想。
              </p>
              <div className="flex items-center gap-unit-xs">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-label-code text-label-code text-primary uppercase">
                  System Nominal · Sabbatical Window Active
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-unit-sm">
              <span className="font-label-code text-label-code uppercase tracking-widest text-secondary">
                Academic Core
              </span>
              <ul className="flex flex-col gap-unit-xs font-body-sm text-body-sm text-on-surface-variant">
                <li
                  onClick={() => handleActionClick('student')}
                  className="hover:text-on-surface cursor-pointer transition-colors"
                >
                  Faculty Directory
                </li>
                <li
                  onClick={() => handleActionClick('student')}
                  className="hover:text-on-surface cursor-pointer transition-colors"
                >
                  Thesis Consultation
                </li>
                <li
                  onClick={() => {
                    const el = document.getElementById('faculty-matrix');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-on-surface cursor-pointer transition-colors"
                >
                  Research Colloquia
                </li>
                <li
                  onClick={() => handleActionClick('student')}
                  className="hover:text-on-surface cursor-pointer transition-colors"
                >
                  Syllabus Matrix
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-unit-sm">
              <span className="font-label-code text-label-code uppercase tracking-widest text-secondary">
                Institutional
              </span>
              <ul className="flex flex-col gap-unit-xs font-body-sm text-body-sm text-on-surface-variant">
                <li className="hover:text-on-surface cursor-pointer transition-colors">
                  BJTU Graduate School
                </li>
                <li className="hover:text-on-surface cursor-pointer transition-colors">
                  Office of Academic Affairs
                </li>
                <li className="hover:text-on-surface cursor-pointer transition-colors">
                  State Key Laboratories
                </li>
                <li className="hover:text-on-surface cursor-pointer transition-colors">
                  Academic Integrity Policy
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-unit-sm">
              <span className="font-label-code text-label-code uppercase tracking-widest text-secondary">
                Accreditations &amp; Security
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Authenticated through BJTU Unified Identity Authentication System (CAS). Encrypted under
                institutional zero-trust research protocol.
              </p>
              <div className="p-unit-sm rounded bg-surface-container-low border border-outline-variant/30">
                <span className="font-label-code text-label-code text-on-surface-variant block font-medium">
                  BJTU EDUPASS CERTIFIED
                </span>
                <span className="font-body-sm text-body-sm text-outline">Haidian District, Beijing 100044</span>
              </div>
            </div>
          </div>

          <div className="pt-unit-xl flex flex-col md:flex-row items-center justify-between gap-unit-md">
            <span className="font-body-sm text-body-sm text-outline">
              © 2024-2026 Beijing Jiaotong University (北京交通大学). Academic Affairs Division. All rights reserved.
            </span>
            <div className="flex items-center gap-unit-lg font-label-code text-label-code text-outline">
              <span
                onClick={() =>
                  showToast('Security Directive: Encrypted TLS 1.3 BJTU Central CAS.')
                }
                className="hover:text-on-surface cursor-pointer transition-colors"
              >
                PRIVACY DIRECTIVE
              </span>
              <span
                onClick={() =>
                  showToast('Accessibility: WCAG 2.1 AA Compliant Academic Terminal.')
                }
                className="hover:text-on-surface cursor-pointer transition-colors"
              >
                CAMPUS ACCESSIBILITY
              </span>
              <span
                onClick={() =>
                  showToast('CAS Siyuan Gateway Status: 100% Operational, Latency 12ms.')
                }
                className="hover:text-on-surface cursor-pointer transition-colors"
              >
                PORTAL STATUS
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
