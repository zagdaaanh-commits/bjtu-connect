'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, StudentProfile, TeacherProfile } from '../../types/portal';
import { switchCurrentUser, resetPortalStorage, logoutUser } from '../../lib/storage';
import { Avatar } from '../common/Avatar';
import { UniversityLogo } from '../common/UniversityLogo';
import { ProfileEditModal } from '../onboarding/ProfileEditModal';
import {
  ChevronDown,
  LogOut,
  Edit3,
  Check,
  Camera,
  Shield,
} from 'lucide-react';
import { cn } from '../../lib/utils';

import { useLanguage } from '../../context/LanguageContext';
import { LanguageToggle } from '../common/LanguageToggle';

interface HeaderNavbarProps {
  currentUser: UserProfile;
  students: StudentProfile[];
  teachers: TeacherProfile[];
  onRefresh: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onGoToLanding?: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  currentUser,
  students,
  teachers,
  onRefresh,
  onGoToLanding,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const { language, t, formatSchool, formatTeacher } = useLanguage();

  const isAdmin =
    currentUser.role === 'admin' ||
    (currentUser as any).is_admin === true ||
    (currentUser as any).is_admin === 'true' ||
    (currentUser as any).isAdmin === true ||
    (currentUser as any).isAdmin === 'true' ||
    (typeof window !== 'undefined' && localStorage.getItem('bjtu_admin_session') === 'true');

  const isTeacher =
    currentUser.role === 'teacher' ||
    Boolean((currentUser as any).coursesTaughtIds) ||
    Boolean((currentUser as any).title);

  const adminUserId =
    typeof window !== 'undefined' ? localStorage.getItem('bjtu_admin_user_id') : null;
  const originalAdminUser = adminUserId
    ? students.find((s) => s.id === adminUserId) || teachers.find((t) => t.id === adminUserId)
    : null;

  const displayName = isTeacher
    ? formatTeacher(currentUser as TeacherProfile)
    : language === 'zh'
    ? currentUser.chineseName || currentUser.fullName
    : currentUser.fullName;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectUser = (id: string, role: 'student' | 'teacher') => {
    switchCurrentUser(id, role);
    setIsDropdownOpen(false);
    onRefresh();
  };

  const handleLogout = () => {
    logoutUser();
    onRefresh();
  };

  const handleResetData = () => {
    const confirmMsg =
      language === 'zh'
        ? '是否重置系统所有咨询对话与状态至北京交通大学初始演示状态？'
        : 'Reset all portal conversations, messages, and status to initial BJTU demo state?';
    if (confirm(confirmMsg)) {
      resetPortalStorage();
      onRefresh();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & BJTU Identity */}
          <div className="flex items-center gap-3">
            <UniversityLogo size="md" />

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                  {language === 'zh' ? '知行' : 'BJTU'}{' '}
                  <span className="text-bjtu-700">{language === 'zh' ? '协同' : 'Connect'}</span>
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md bg-bjtu-50 text-bjtu-900 border border-bjtu-200 text-[11px] font-bold">
                  {t('app.university')}
                </span>
                <span className="hidden md:inline-flex px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
                  {t('app.motto')}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 hidden md:block">
                {t('app.tagline')}
              </div>
            </div>
          </div>

          {/* Center / Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Landing Page Home Button */}
            {onGoToLanding && (
              <button
                type="button"
                onClick={onGoToLanding}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-2xs cursor-pointer"
                title={language === 'zh' ? '查看门户宣传主页' : 'View Portal Landing Page'}
              >
                <span className="material-symbols-outlined text-sm">space_dashboard</span>
                <span className="hidden sm:inline">
                  {language === 'zh' ? '门户主页' : 'Portal Home'}
                </span>
              </button>
            )}

            {/* Language Toggle */}
            <LanguageToggle />

            {/* Sign Out / Exit to Login Interface Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors shadow-2xs cursor-pointer"
              title={t('app.signOut')}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('app.signOut')}</span>
            </button>

            {/* Persona & Role Switcher Dropdown (Admin Only Switcher) */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all bg-white shadow-2xs cursor-pointer"
                title={
                  isAdmin
                    ? language === 'zh'
                      ? '管理员身份中心与身份切换'
                      : 'Admin Center & Persona Switcher'
                    : language === 'zh'
                    ? '个人信息与账户中心'
                    : 'Personal Profile & Account'
                }
              >
                <Avatar
                  src={currentUser.avatar}
                  name={displayName}
                  size="sm"
                  status={isTeacher ? (currentUser as TeacherProfile).status : undefined}
                />

                <div className="text-left hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 leading-none">
                      {displayName}
                    </span>
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide',
                        isAdmin
                          ? 'bg-purple-100 text-purple-900 border border-purple-200'
                          : isTeacher
                          ? 'bg-bjtu-100 text-bjtu-900'
                          : 'bg-emerald-100 text-emerald-800'
                      )}
                    >
                      {isAdmin
                        ? language === 'zh'
                          ? '系统管理员'
                          : 'ADMIN'
                        : isTeacher
                        ? t('app.role.teacher')
                        : t('app.role.student')}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 block truncate max-w-[130px] mt-0.5">
                    {formatSchool(currentUser.facultyKey || currentUser.faculty)}
                  </span>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-84 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Profile Header */}
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsEditModalOpen(true);
                        }}
                        className="relative group cursor-pointer shrink-0"
                        title={language === 'zh' ? '点击更换头像' : 'Click to Change Profile Photo'}
                      >
                        <Avatar
                          src={currentUser.avatar}
                          name={displayName}
                          size="md"
                        />
                        <div className="absolute inset-0 bg-slate-900/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                          <Camera className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {language === 'zh' ? '当前北京交通大学身份' : 'Active BJTU Profile'}
                          </span>
                          {isAdmin && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-purple-100 text-purple-800 border border-purple-200">
                              {language === 'zh' ? '管理员' : 'Admin'}
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-xs text-slate-900 truncate">
                          {displayName}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setIsEditModalOpen(true);
                          }}
                          className="text-[11px] text-academic-700 hover:text-academic-800 font-semibold hover:underline flex items-center gap-1 mt-0.5 cursor-pointer"
                        >
                          <Camera className="w-3 h-3" />
                          <span>{language === 'zh' ? '更换头像 / 编辑资料' : 'Change Photo / Edit Profile'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ADMIN ONLY: Persona Switcher List */}
                  {isAdmin ? (
                    <>
                      {/* If impersonating an account, show return to admin button */}
                      {originalAdminUser && originalAdminUser.id !== currentUser.id && (
                        <div className="p-2 bg-purple-50/80 border-b border-purple-100">
                          <button
                            type="button"
                            onClick={() =>
                              handleSelectUser(
                                originalAdminUser.id,
                                originalAdminUser.role === 'teacher' ? 'teacher' : 'student'
                              )
                            }
                            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs bg-purple-700 hover:bg-purple-800 text-white font-semibold shadow-2xs transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 text-purple-200" />
                              <span>{language === 'zh' ? '返回我的管理员账号' : 'Return to Admin Profile'}</span>
                            </div>
                            <span className="text-[10px] text-purple-200 font-mono">
                              {originalAdminUser.fullName}
                            </span>
                          </button>
                        </div>
                      )}

                      <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-100">
                        {/* Student Options */}
                        <div className="px-3 py-1.5">
                          <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>{language === 'zh' ? '学生演示账号 (管理员切换)' : 'Student Personas (Admin)'}</span>
                            </div>
                            <span className="text-[9px] text-slate-400 font-normal">({students.length})</span>
                          </div>
                          {students.map((s) => {
                            const isSelected = currentUser.id === s.id;
                            const isStudentAdmin = Boolean(s.isAdmin || s.is_admin || s.role === 'admin');
                            return (
                              <button
                                key={s.id}
                                onClick={() => handleSelectUser(s.id, 'student')}
                                className={cn(
                                  'w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors text-left cursor-pointer',
                                  isSelected
                                    ? 'bg-emerald-50 font-bold text-emerald-900'
                                    : 'hover:bg-slate-100 text-slate-700'
                                )}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <Avatar
                                    src={s.avatar}
                                    name={language === 'zh' ? s.chineseName || s.fullName : s.fullName}
                                    size="xs"
                                  />
                                  <div className="truncate">
                                    <div className="font-semibold text-slate-900 truncate flex items-center gap-1">
                                      <span>{language === 'zh' ? s.chineseName || s.fullName : s.fullName}</span>
                                      {isStudentAdmin && (
                                        <span className="px-1 py-0.2 rounded text-[8px] font-bold uppercase bg-purple-100 text-purple-800">
                                          Admin
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-slate-400 truncate">
                                      {s.major} • {s.grade.split('(')[0]}
                                    </div>
                                  </div>
                                </div>
                                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>

                        {/* Teacher Options */}
                        <div className="px-3 py-1.5">
                          <div className="text-[10px] font-bold text-bjtu-800 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-bjtu-700" />
                              <span>{language === 'zh' ? '教师演示账号 (管理员切换)' : 'Faculty Personas (Admin)'}</span>
                            </div>
                            <span className="text-[9px] text-slate-400 font-normal">({teachers.length})</span>
                          </div>
                          {teachers.map((t) => {
                            const isSelected = currentUser.id === t.id;
                            const isTeacherAdmin = Boolean(t.isAdmin || t.is_admin || t.role === 'admin');
                            return (
                              <button
                                key={t.id}
                                onClick={() => handleSelectUser(t.id, 'teacher')}
                                className={cn(
                                  'w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors text-left cursor-pointer',
                                  isSelected
                                    ? 'bg-bjtu-50 font-bold text-bjtu-900'
                                    : 'hover:bg-slate-100 text-slate-700'
                                )}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <Avatar
                                    src={t.avatar}
                                    name={formatTeacher(t)}
                                    size="xs"
                                    status={t.status}
                                  />
                                  <div className="truncate">
                                    <div className="font-semibold text-slate-900 truncate flex items-center gap-1">
                                      <span>{formatTeacher(t)}</span>
                                      {isTeacherAdmin && (
                                        <span className="px-1 py-0.2 rounded text-[8px] font-bold uppercase bg-purple-100 text-purple-800">
                                          Admin
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-slate-400 truncate">
                                      {t.title} • {formatSchool(t.facultyKey || t.faculty)}
                                    </div>
                                  </div>
                                </div>
                                {isSelected && <Check className="w-3.5 h-3.5 text-bjtu-700 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  ) : (
                    /* REGULAR USER DETAILS (Persona Switcher Hidden) */
                    <div className="px-4 py-3 bg-slate-50/50 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-slate-100">
                        <span className="text-slate-400 font-medium">
                          {language === 'zh' ? '校园认证身份' : 'Campus Identity'}
                        </span>
                        <span className="font-semibold text-slate-800 font-mono">
                          {isTeacher
                            ? (currentUser as TeacherProfile).staffId || 'BJTU-FACULTY'
                            : (currentUser as StudentProfile).studentId}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-slate-100">
                        <span className="text-slate-400 font-medium">
                          {language === 'zh' ? '所属学院' : 'School / Faculty'}
                        </span>
                        <span className="font-semibold text-slate-800 truncate max-w-[180px] text-right">
                          {formatSchool(currentUser.facultyKey || currentUser.faculty)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-slate-100">
                        <span className="text-slate-400 font-medium">
                          {isTeacher
                            ? language === 'zh'
                              ? '教研部/系所'
                              : 'Department'
                            : language === 'zh'
                            ? '专业/年级'
                            : 'Major & Grade'}
                        </span>
                        <span className="font-semibold text-slate-800 truncate max-w-[180px] text-right">
                          {isTeacher
                            ? (currentUser as TeacherProfile).department
                            : `${(currentUser as StudentProfile).major} • ${(currentUser as StudentProfile).grade.split('(')[0]}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">
                          {language === 'zh' ? '校园电子邮箱' : 'Email'}
                        </span>
                        <span className="text-slate-600 font-mono truncate max-w-[180px] text-right">
                          {currentUser.email}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Profile Edit Action & Logout */}
                  <div className="p-2 border-t border-slate-100 mt-1 space-y-1">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsEditModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-academic-700" />
                      <span>{t('app.editProfile')}</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('app.signOut')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Edit Profile Modal */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentUser={currentUser}
        onSaved={onRefresh}
      />
    </>
  );
};
