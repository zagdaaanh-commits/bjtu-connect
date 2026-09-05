'use client';

import React, { useState, useEffect } from 'react';
import {
  StudentProfile,
  TeacherProfile,
  UserProfile,
  FacultyKey,
} from '../../types/portal';
import {
  loginUser,
  registerStudent,
  registerTeacher,
  getStoredState,
} from '../../lib/storage';
import { FACULTIES } from '../../data/dummyData';
import { useLanguage } from '../../context/LanguageContext';
import { AcademicRailEmblem } from '../common/AcademicRailEmblem';

interface AuthPortalProps {
  onLoginSuccess: () => void;
  onClose?: () => void;
  initialRole?: 'student' | 'teacher';
}

const CAPTCHA_SAMPLES = ['8M2K', '4V7X', '9T1Q', '3N6P', '5W8Z', '2K4L', '7H9S'];

export const AuthPortal: React.FC<AuthPortalProps> = ({
  onLoginSuccess,
  onClose,
  initialRole = 'student',
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher'>(initialRole);

  // Form inputs
  const [uidInput, setUidInput] = useState(
    initialRole === 'student' ? '21281034' : 'T2018092'
  );
  const [passwordInput, setPasswordInput] = useState('bjtu2026');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('8M2K');
  const [currentCaptcha, setCurrentCaptcha] = useState('8M2K');
  const [rememberSession, setRememberSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [qrScanning, setQrScanning] = useState(false);

  // Registration state for Student
  const [regFullName, setRegFullName] = useState('');
  const [regChineseName, setRegChineseName] = useState('');
  const [regId, setRegId] = useState('');
  const [regFaculty, setRegFaculty] = useState<FacultyKey>('se');
  const [regMajor, setRegMajor] = useState('Software Engineering');
  const [regGrade, setRegGrade] = useState('Year 1 (Class of 2028)');
  const [regClass, setRegClass] = useState('SE-2601');
  const [regEmail, setRegEmail] = useState('');

  // Registration state for Teacher
  const [regTeacherTitle, setRegTeacherTitle] = useState('Associate Professor');
  const [regTeacherDept, setRegTeacherDept] = useState('Dept. of Computer Science');
  const [regTeacherOffice, setRegTeacherOffice] = useState('Siyuan East Hall 302');
  const [regTeacherHours, setRegTeacherHours] = useState('Tue & Thu 14:00 - 16:30');

  useEffect(() => {
    setSelectedRole(initialRole);
    setUidInput(initialRole === 'student' ? '21281034' : 'T2018092');
  }, [initialRole]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const refreshCaptcha = () => {
    const next = CAPTCHA_SAMPLES[Math.floor(Math.random() * CAPTCHA_SAMPLES.length)];
    setCurrentCaptcha(next);
    setCaptchaInput(next);
  };

  const handleRoleChange = (role: 'student' | 'teacher') => {
    setSelectedRole(role);
    setErrorMessage('');
    if (role === 'student') {
      if (uidInput === 'T2018092' || !uidInput.trim()) {
        setUidInput('21281034');
      }
    } else {
      if (uidInput === '21281034' || !uidInput.trim()) {
        setUidInput('T2018092');
      }
    }
  };

  const handleQuickLogin = (user: UserProfile) => {
    loginUser(user);
    onLoginSuccess();
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (captchaInput.trim().toUpperCase() !== currentCaptcha.toUpperCase()) {
      setErrorMessage(
        language === 'zh'
          ? '验证码输入错误，请重新输入。'
          : 'Security token mismatch. Please enter the captcha code.'
      );
      refreshCaptcha();
      return;
    }

    const state = getStoredState();
    const cleanId = uidInput.trim().toLowerCase();

    if (selectedRole === 'student') {
      const student = state.students.find(
        (s) =>
          s.studentId.trim().toLowerCase() === cleanId ||
          s.email.toLowerCase() === cleanId ||
          s.fullName.toLowerCase().includes(cleanId) ||
          (s.chineseName && s.chineseName.includes(cleanId))
      );

      if (student) {
        loginUser(student);
        onLoginSuccess();
        return;
      }

      // Check if it's a teacher ID entered while on student tab
      const teacher = state.teachers.find(
        (t) =>
          (t.staffId && t.staffId.trim().toLowerCase() === cleanId) ||
          t.email.toLowerCase() === cleanId ||
          t.fullName.toLowerCase().includes(cleanId) ||
          (t.chineseName && t.chineseName.includes(cleanId))
      );

      if (teacher) {
        loginUser(teacher);
        onLoginSuccess();
        return;
      }

      setErrorMessage(
        language === 'zh'
          ? `学号或校园账号 "${uidInput}" 未在BJTU CAS系统中检索到。请检查输入或进行新用户激活。`
          : `Student ID "${uidInput}" not recognized in BJTU CAS. Please check credentials or activate account.`
      );
    } else {
      const teacher = state.teachers.find(
        (t) =>
          (t.staffId && t.staffId.trim().toLowerCase() === cleanId) ||
          t.email.toLowerCase() === cleanId ||
          t.fullName.toLowerCase().includes(cleanId) ||
          (t.chineseName && t.chineseName.includes(cleanId))
      );

      if (teacher) {
        loginUser(teacher);
        onLoginSuccess();
        return;
      }

      // Check if it's a student ID entered while on teacher tab
      const student = state.students.find(
        (s) =>
          s.studentId.trim().toLowerCase() === cleanId ||
          s.email.toLowerCase() === cleanId ||
          s.fullName.toLowerCase().includes(cleanId) ||
          (s.chineseName && s.chineseName.includes(cleanId))
      );

      if (student) {
        loginUser(student);
        onLoginSuccess();
        return;
      }

      setErrorMessage(
        language === 'zh'
          ? `教工号或校园账号 "${uidInput}" 未在BJTU CAS系统中检索到。请检查输入或进行新用户激活。`
          : `Faculty Staff ID "${uidInput}" not recognized in BJTU CAS. Please check credentials or activate account.`
      );
    }
  };

  const handleQrClick = () => {
    setQrScanning(true);
    setTimeout(() => {
      setQrScanning(false);
      const state = getStoredState();
      if (selectedRole === 'student') {
        const student =
          state.students.find((s) => s.studentId === '21281034') || state.students[0];
        if (student) {
          loginUser(student);
          onLoginSuccess();
        }
      } else {
        const teacher =
          state.teachers.find((t) => t.staffId === 'T2018092') || state.teachers[0];
        if (teacher) {
          loginUser(teacher);
          onLoginSuccess();
        }
      }
    }, 1200);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regFullName.trim() || !regId.trim()) {
      setErrorMessage(
        language === 'zh'
          ? '请完整填写姓名及有效学工号。'
          : 'Please complete full name and official ID number.'
      );
      return;
    }

    const facultyObj = FACULTIES.find((f) => f.key === regFaculty);
    const facultyLabel = facultyObj
      ? `${facultyObj.nameEn} (${facultyObj.nameZh})`
      : 'School of Software Engineering (软件学院)';

    if (selectedRole === 'student') {
      const created = registerStudent({
        fullName: regFullName.trim(),
        chineseName: regChineseName.trim() || undefined,
        studentId: regId.trim(),
        faculty: facultyLabel,
        facultyKey: regFaculty,
        major: regMajor.trim() || 'Software Engineering',
        grade: regGrade,
        classGroup: regClass.trim() || 'SE-2601',
        email: regEmail.trim() || `${regId.trim()}@bjtu.edu.cn`,
      });
      loginUser(created);
      onLoginSuccess();
    } else {
      const created = registerTeacher({
        fullName: regFullName.trim(),
        chineseName: regChineseName.trim() || undefined,
        staffId: regId.trim(),
        title: regTeacherTitle,
        faculty: facultyLabel,
        facultyKey: regFaculty,
        department: regTeacherDept,
        officeLocation: regTeacherOffice,
        officeHours: regTeacherHours,
        email: regEmail.trim() || `faculty.${regId.trim()}@bjtu.edu.cn`,
      });
      loginUser(created);
      onLoginSuccess();
    }
  };

  const state = getStoredState();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-surface/95 backdrop-blur-xl flex items-center justify-center p-unit-xs sm:p-unit-md">
      <div className="relative w-full max-w-[1440px] mx-auto min-h-0 lg:min-h-[920px] rounded-xl overflow-hidden bg-surface-container-lowest shadow-2xl flex flex-col lg:flex-row my-auto border border-outline-variant/30">
        {/* Close Button if rendered as modal */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-surface-container-high/80 hover:bg-surface-container-highest text-outline hover:text-on-surface flex items-center justify-center border border-outline-variant/40 transition-colors shadow-lg cursor-pointer"
            title="Close / 关闭"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        )}

        {/* LEFT COLUMN: University Campus Showcase & Telepresence */}
        <div className="relative lg:w-[48%] min-h-[480px] lg:min-h-[920px] flex flex-col justify-between p-unit-xl lg:p-unit-3xl overflow-hidden bg-surface-dim">
          <div
            className="absolute inset-0 bg-cover bg-center transform duration-1000 ease-out scale-105 opacity-80"
            style={{
              backgroundColor: '#0f1512',
              backgroundImage: `radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.15), transparent 70%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuDZH_mFtKCdsL1et914yjivNpB1Gu1wWNStS6wEC5f4tywh5YvoPNdAeXH_fyalOoJv1UAjjwVV-M3bebL06Lz9d2Gw3deIfjjMQGYMOv5a8Re2zwWZhpKl_9tsBaG5qi6vfjzpDd1Q8rpAKicV58NrjqG57O5ZGPCZ4ipGocmrmYShbK8l11IfGRKlUqw1gfRHs-I6_riAUgJ_AVaB6oD0AtZov3hRhUPTGAKzMt_FsiYXIw9O1SgckSOoFxjc3eMOQg")`,
              backgroundPosition: 'center 25%',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-surface-dim/40 to-surface-dim/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-dim/80 via-surface-dim/30 to-transparent" />
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-primary-container/10 blur-3xl pointer-events-none" />

          {/* Left Top Header */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-unit-md">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg p-0.5 overflow-hidden ring-2 ring-primary/40 shrink-0">
                <img
                  src="/bjtu_emblem.png"
                  alt="北京交通大学校徽"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div>
                <div className="flex items-center gap-unit-xs">
                  <span className="font-label-code text-label-code uppercase tracking-widest text-primary">
                    BJTU CONNECT
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                </div>
                <p className="font-headline-sm text-headline-sm text-on-surface leading-none tracking-tight mt-0.5">
                  北京交通大学 · 学业咨询空间
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-unit-xs bg-surface-container-high/70 backdrop-blur-md px-unit-sm py-1 rounded-full border border-outline-variant/20">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="font-label-code text-xs text-secondary">CAS3 ACTIVE</span>
            </div>
          </div>

          {/* Left Middle Quote */}
          <div className="relative z-10 my-auto py-unit-xl lg:py-unit-2xl">
            <div className="p-unit-lg rounded-xl bg-surface-container-lowest/60 backdrop-blur-md max-w-xl shadow-xl border border-outline-variant/30">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-surface-container-high/80 backdrop-blur-md mb-unit-md border border-outline-variant/20">
                <span className="material-symbols-outlined text-tertiary text-sm">auto_stories</span>
                <span className="font-label-code text-label-code text-tertiary uppercase tracking-wider">
                  Academic Portal &amp; Advising Network
                </span>
              </div>
              <h1 className="font-headline-xl text-headline-xl text-on-surface leading-tight tracking-tight mb-unit-sm drop-shadow-md">
                知行合一 <span className="font-title-editorial text-primary italic font-normal">·</span>{' '}
                教学相长
              </h1>
              <p className="font-title-editorial text-title-editorial text-on-surface italic font-light max-w-xl mb-unit-md drop-shadow-sm">
                Synchronized telepresence and personalized academic consultation across Beijing, Weihai,
                XiongAn and State Key Laboratories.
              </p>
              <div className="p-unit-md rounded-xl bg-surface-container-high/70 backdrop-blur-md shadow-sm border border-outline-variant/20">
                <div className="flex items-start gap-unit-sm">
                  <span className="material-symbols-outlined text-primary/80 text-xl mt-0.5">
                    verified_user
                  </span>
                  <div>
                    <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
                      &quot;Direct mentorship bridges exploratory research with foundational rigor. The
                      seamless CAS platform links thesis defense schedules in real time.&quot;
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-label-code text-label-code text-secondary">Prof. Z. Lin</span>
                      <span className="text-outline-variant text-xs">•</span>
                      <span className="font-label-badge text-label-badge text-outline">
                        State Key Lab of Rail Traffic Control
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Left Bottom Stats */}
          <div className="relative z-10 grid grid-cols-3 gap-unit-sm pt-unit-md">
            <div className="p-unit-sm rounded-lg bg-surface-container-low/80 backdrop-blur-sm border border-outline-variant/20">
              <p className="font-label-code text-label-code text-outline uppercase tracking-wider">
                CAS System
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <p className="font-body-md text-body-md font-semibold text-on-surface">100% Active</p>
              </div>
            </div>
            <div className="p-unit-sm rounded-lg bg-surface-container-low/80 backdrop-blur-sm border border-outline-variant/20">
              <p className="font-label-code text-label-code text-outline uppercase tracking-wider">
                Scholars Online
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="material-symbols-outlined text-primary text-sm">groups</span>
                <p className="font-body-md text-body-md font-semibold text-on-surface">1,420+</p>
              </div>
            </div>
            <div className="p-unit-sm rounded-lg bg-surface-container-low/80 backdrop-blur-sm border border-outline-variant/20">
              <p className="font-label-code text-label-code text-outline uppercase tracking-wider">
                Security Prot.
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="material-symbols-outlined text-tertiary text-sm">lock</span>
                <p className="font-body-md text-body-md font-semibold text-on-surface">TLS 1.3/CAS3</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive CAS Authentication Form */}
        <div className="relative lg:w-[52%] flex flex-col justify-between p-unit-xl lg:p-unit-3xl bg-surface-container-low/90 backdrop-blur-md">
          {/* Top Integrity Bar */}
          <div className="flex items-center justify-between pb-unit-md border-b border-outline-variant/20">
            <div className="flex items-center gap-unit-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-sm text-primary">security</span>
              <span className="font-label-code text-label-code tracking-wider text-outline">
                BJTU CYBER INTEGRITY PROTOCOL
              </span>
            </div>
            <div className="flex items-center gap-unit-sm">
              <button
                type="button"
                onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
                className="font-label-code text-label-code text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">translate</span>
                <span>{language === 'zh' ? 'EN / 中文' : '中文 / EN'}</span>
              </button>
            </div>
          </div>

          {/* Form Card Area */}
          <div className="w-full max-w-md mx-auto my-auto py-unit-sm">
            {/* Tab Switcher: Sign In vs Activate Account */}
            <div className="flex rounded-lg bg-surface-container p-1 mb-unit-md border border-outline-variant/20">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signin');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2 text-center rounded-md font-body-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'signin'
                    ? 'bg-surface-container-high text-on-surface shadow-sm'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                Sign In (CAS 统一认证)
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2 text-center rounded-md font-body-sm transition-all cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-surface-container-high text-on-surface shadow-sm font-semibold'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                Activate Account (新用户激活)
              </button>
            </div>

            {/* Role Affiliation Toggle */}
            <div className="flex items-center justify-between mb-unit-md px-1">
              <span className="font-label-code text-label-code text-outline">SELECT AFFILIATION</span>
              <div className="inline-flex rounded-lg bg-surface-container p-0.5 border border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => handleRoleChange('student')}
                  className={`px-3 py-1 text-xs rounded-md transition-all cursor-pointer ${
                    selectedRole === 'student'
                      ? 'bg-surface-container-highest text-primary font-medium'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  Student / 本科·研究生
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('teacher')}
                  className={`px-3 py-1 text-xs rounded-md transition-all cursor-pointer ${
                    selectedRole === 'teacher'
                      ? 'bg-surface-container-highest text-primary font-medium'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  Faculty / 导师·教工
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-unit-sm p-unit-sm rounded-lg bg-error-container/40 border border-error/40 text-error font-body-sm flex items-center justify-between text-xs animate-in fade-in">
                <span>{errorMessage}</span>
                <button
                  type="button"
                  onClick={() => setErrorMessage('')}
                  className="font-bold ml-2 text-error hover:text-on-error"
                >
                  ✕
                </button>
              </div>
            )}

            {/* TAB 1: SIGN IN VIEW */}
            {activeTab === 'signin' ? (
              <div className="space-y-unit-md">
                {/* QR Mobile Scan Login Button */}
                <div
                  onClick={handleQrClick}
                  className="p-unit-sm rounded-xl bg-surface-container flex items-center justify-between hover:bg-surface-container-high transition-colors cursor-pointer group border border-outline-variant/20"
                >
                  <div className="flex items-center gap-unit-sm">
                    <div className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-xl">
                        {qrScanning ? 'sync' : 'qr_code_scanner'}
                      </span>
                    </div>
                    <div>
                      <p className="font-body-sm text-body-sm font-semibold text-on-surface leading-tight">
                        {qrScanning ? 'Authenticating Mobile App...' : 'BJTU Mobile App One-Click Login'}
                      </p>
                      <p className="font-label-code text-label-code text-outline">
                        北京交通大学 App 快速扫码授权
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:text-primary group-hover:translate-x-0.5 transition-all text-sm">
                    arrow_forward_ios
                  </span>
                </div>

                <div className="flex items-center gap-unit-sm my-unit-xs">
                  <div className="h-px flex-1 bg-surface-container-highest" />
                  <span className="font-label-code text-label-code text-outline">OR CAS CREDENTIALS</span>
                  <div className="h-px flex-1 bg-surface-container-highest" />
                </div>

                {/* Main Auth Form */}
                <form className="space-y-unit-sm" onSubmit={handleSignInSubmit}>
                  {/* UID Field */}
                  <div>
                    <label
                      className="block font-label-code text-label-code text-on-surface-variant uppercase mb-1"
                      htmlFor="uid"
                    >
                      {selectedRole === 'student'
                        ? 'Student ID / 学号'
                        : 'Staff Work No. / 教工号'}
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-outline text-lg">
                        badge
                      </span>
                      <input
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline-variant font-body-md text-body-md focus:outline-none focus:bg-surface-container focus:ring-1 focus:ring-primary shadow-inner border border-outline-variant/30"
                        id="uid"
                        placeholder={
                          selectedRole === 'student'
                            ? 'e.g. 21281034 or 2023010482'
                            : 'e.g. T2018092 or BJTU-T10024'
                        }
                        required
                        type="text"
                        value={uidInput}
                        onChange={(e) => setUidInput(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        className="block font-label-code text-label-code text-on-surface-variant uppercase"
                        htmlFor="pwd"
                      >
                        CAS Password (统一身份密码)
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          alert(
                            language === 'zh'
                              ? '默认密码为 bjtu2026。如需重置，请联系北交大信息化中心 (010-51688888)。'
                              : 'Default password is "bjtu2026". For help, contact BJTU IT center.'
                          )
                        }
                        className="font-label-code text-label-code text-tertiary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-outline text-lg">
                        lock
                      </span>
                      <input
                        className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline-variant font-body-md text-body-md focus:outline-none focus:bg-surface-container focus:ring-1 focus:ring-primary shadow-inner border border-outline-variant/30"
                        id="pwd"
                        placeholder="••••••••••••"
                        required
                        type={showPassword ? 'text' : 'password'}
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute right-3 text-outline hover:text-on-surface p-1 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <span className="material-symbols-outlined text-lg">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Captcha Field */}
                  <div>
                    <label
                      className="block font-label-code text-label-code text-on-surface-variant uppercase mb-1"
                      htmlFor="captcha"
                    >
                      Security Token (安全验证码)
                    </label>
                    <div className="flex items-center gap-unit-sm">
                      <div className="relative flex-1">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-lg">
                          verified
                        </span>
                        <input
                          className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface uppercase font-label-code text-label-code tracking-widest placeholder:text-outline-variant focus:outline-none focus:bg-surface-container focus:ring-1 focus:ring-primary shadow-inner border border-outline-variant/30"
                          id="captcha"
                          maxLength={4}
                          placeholder="Token"
                          required
                          type="text"
                          value={captchaInput}
                          onChange={(e) => setCaptchaInput(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center bg-surface-container px-3 py-1.5 rounded-lg select-none border border-outline-variant/30">
                        <span className="font-label-code text-base font-bold tracking-widest text-primary italic line-through decoration-tertiary">
                          {currentCaptcha}
                        </span>
                        <button
                          className="ml-2 text-outline hover:text-primary transition-colors p-1 cursor-pointer"
                          onClick={refreshCaptcha}
                          title="Refresh code"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-base">refresh</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Checkbox and Eduroam Status */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        checked={rememberSession}
                        onChange={(e) => setRememberSession(e.target.checked)}
                        className="w-4 h-4 rounded bg-surface-container-lowest accent-primary focus:ring-0 cursor-pointer"
                        type="checkbox"
                      />
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Remember campus session
                      </span>
                    </label>
                    <span className="inline-flex items-center gap-1 font-label-code text-label-code text-primary">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Eduroam
                      Direct
                    </span>
                  </div>

                  {/* Big Primary Submit Button */}
                  <button
                    className="w-full py-3 px-unit-md mt-unit-sm rounded-lg bg-gradient-to-r from-primary-container via-primary to-secondary text-surface-container-lowest font-label-code font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/20 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
                    id="submit-btn"
                    type="submit"
                  >
                    <span className="material-symbols-outlined text-lg">lock_open</span>
                    <span>Sign In via Unified CAS (统一登录)</span>
                  </button>
                </form>
              </div>
            ) : (
              /* TAB 2: ACTIVATE ACCOUNT (新用户激活) VIEW */
              <div className="space-y-unit-md" id="register-view">
                <div className="p-unit-md rounded-xl bg-surface-container border border-outline-variant/20">
                  <div className="flex items-center gap-2 text-tertiary mb-2">
                    <span className="material-symbols-outlined text-xl">how_to_reg</span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface leading-tight">
                      {selectedRole === 'student'
                        ? 'Freshmen & Student Master Activation'
                        : 'Faculty & Academic Staff Onboarding'}
                    </h3>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-unit-sm">
                    {selectedRole === 'student'
                      ? 'Newly enrolled undergraduate scholars and postgraduate researchers can initialize their master identity using official admission credentials.'
                      : 'Newly appointed professors, laboratory fellows, and academic advisors can register their unified consultation profiles.'}
                  </p>

                  {/* Form fields */}
                  <form onSubmit={handleRegisterSubmit} className="space-y-unit-sm">
                    <div className="grid grid-cols-2 gap-unit-sm">
                      <div>
                        <label className="block font-label-code text-[11px] text-outline uppercase mb-1">
                          Full Name (英文/拼音)
                        </label>
                        <input
                          type="text"
                          required
                          value={regFullName}
                          onChange={(e) => setRegFullName(e.target.value)}
                          placeholder="e.g. Haoran Wang"
                          className="w-full px-unit-sm py-2 rounded bg-surface-container-lowest text-on-surface border border-outline-variant/30 text-xs focus:ring-1 focus:ring-primary outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-label-code text-[11px] text-outline uppercase mb-1">
                          Chinese Name (中文名)
                        </label>
                        <input
                          type="text"
                          value={regChineseName}
                          onChange={(e) => setRegChineseName(e.target.value)}
                          placeholder="例如: 王浩然"
                          className="w-full px-unit-sm py-2 rounded bg-surface-container-lowest text-on-surface border border-outline-variant/30 text-xs focus:ring-1 focus:ring-primary outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-unit-sm">
                      <div>
                        <label className="block font-label-code text-[11px] text-outline uppercase mb-1">
                          {selectedRole === 'student' ? 'Student ID (学号)' : 'Staff ID (工号)'}
                        </label>
                        <input
                          type="text"
                          required
                          value={regId}
                          onChange={(e) => setRegId(e.target.value)}
                          placeholder={selectedRole === 'student' ? 'e.g. 24281099' : 'e.g. T2026001'}
                          className="w-full px-unit-sm py-2 rounded bg-surface-container-lowest text-on-surface border border-outline-variant/30 text-xs focus:ring-1 focus:ring-primary outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-label-code text-[11px] text-outline uppercase mb-1">
                          School / Faculty (学院)
                        </label>
                        <select
                          value={regFaculty}
                          onChange={(e) => setRegFaculty(e.target.value as FacultyKey)}
                          className="w-full px-unit-sm py-2 rounded bg-surface-container-lowest text-on-surface border border-outline-variant/30 text-xs focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                        >
                          {FACULTIES.filter((f) => f.key !== 'all').map((f) => (
                            <option key={f.key} value={f.key}>
                              {language === 'zh' ? f.nameZh : f.nameEn}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {selectedRole === 'student' ? (
                      <div className="grid grid-cols-2 gap-unit-sm">
                        <div>
                          <label className="block font-label-code text-[11px] text-outline uppercase mb-1">
                            Major (专业)
                          </label>
                          <input
                            type="text"
                            value={regMajor}
                            onChange={(e) => setRegMajor(e.target.value)}
                            className="w-full px-unit-sm py-2 rounded bg-surface-container-lowest text-on-surface border border-outline-variant/30 text-xs focus:ring-1 focus:ring-primary outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-label-code text-[11px] text-outline uppercase mb-1">
                            Class (班级)
                          </label>
                          <input
                            type="text"
                            value={regClass}
                            onChange={(e) => setRegClass(e.target.value)}
                            className="w-full px-unit-sm py-2 rounded bg-surface-container-lowest text-on-surface border border-outline-variant/30 text-xs focus:ring-1 focus:ring-primary outline-none"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-unit-sm">
                        <div>
                          <label className="block font-label-code text-[11px] text-outline uppercase mb-1">
                            Office Location (办公室)
                          </label>
                          <input
                            type="text"
                            value={regTeacherOffice}
                            onChange={(e) => setRegTeacherOffice(e.target.value)}
                            className="w-full px-unit-sm py-2 rounded bg-surface-container-lowest text-on-surface border border-outline-variant/30 text-xs focus:ring-1 focus:ring-primary outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-label-code text-[11px] text-outline uppercase mb-1">
                            Office Hours (答疑时间)
                          </label>
                          <input
                            type="text"
                            value={regTeacherHours}
                            onChange={(e) => setRegTeacherHours(e.target.value)}
                            className="w-full px-unit-sm py-2 rounded bg-surface-container-lowest text-on-surface border border-outline-variant/30 text-xs focus:ring-1 focus:ring-primary outline-none"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block font-label-code text-[11px] text-outline uppercase mb-1">
                        Campus Email (校园邮箱)
                      </label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="username@bjtu.edu.cn"
                        className="w-full px-unit-sm py-2 rounded bg-surface-container-lowest text-on-surface border border-outline-variant/30 text-xs focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>

                    <button
                      className="w-full mt-unit-md py-2.5 px-unit-md rounded-lg bg-surface-container-highest text-primary font-label-code text-sm font-semibold tracking-wider hover:bg-primary hover:text-surface-container-lowest transition-all flex items-center justify-center gap-2 cursor-pointer shadow"
                      type="submit"
                    >
                      <span>Begin Identity Verification (开始实名激活)</span>
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </button>
                  </form>
                </div>

                <div className="p-unit-sm rounded-lg bg-surface-container-high/50 flex items-center justify-between border border-outline-variant/20">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-outline text-sm">help_center</span>
                    <span className="font-body-sm text-body-sm text-outline">
                      Encountering registration disputes?
                    </span>
                  </div>
                  <a
                    className="font-label-code text-label-code text-secondary hover:underline"
                    href="tel:010-51688888"
                  >
                    Contact Center (010-51688888)
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Security Footer */}
          <div className="pt-unit-md border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-unit-xs text-outline text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <p className="font-label-code text-label-code">
                BJTU Academic Affairs Cyber Security Directive 2026
              </p>
            </div>
            <p className="font-label-code text-label-code text-outline-variant">
              SSL 256-bit Certified • Siyuan Campus
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
