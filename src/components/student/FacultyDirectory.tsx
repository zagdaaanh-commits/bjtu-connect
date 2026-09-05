'use client';

import React, { useState, useMemo } from 'react';
import { TeacherProfile, Course, StudentProfile } from '../../types/portal';
import { FACULTIES } from '../../data/dummyData';
import { Avatar } from '../common/Avatar';
import { StatusIndicator } from '../common/StatusIndicator';
import { Badge } from '../common/Badge';
import { useLanguage } from '../../context/LanguageContext';
import {
  Search,
  MessageSquare,
  MapPin,
  Clock,
  BookOpen,
  Filter,
  Sparkles,
  CheckCircle2,
  GraduationCap,
  X,
  ChevronRight,
  School,
  Building2,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface FacultyDirectoryProps {
  teachers: TeacherProfile[];
  courses: Course[];
  student: StudentProfile;
  onStartChat: (teacherId: string, courseId?: string) => void;
}

export const FacultyDirectory: React.FC<FacultyDirectoryProps> = ({
  teachers,
  courses,
  student,
  onStartChat,
}) => {
  const {
    language,
    t,
    formatTeacher,
    formatSchool,
    formatLocation,
    formatCourse,
    formatTitle,
    formatOfficeHours,
  } = useLanguage();

  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [schoolSearch, setSchoolSearch] = useState<string>('');

  // Count teachers per faculty
  const facultyCounts = useMemo(() => {
    const counts: Record<string, number> = { all: teachers.length };
    FACULTIES.forEach((fac) => {
      if (fac.key !== 'all') {
        counts[fac.key] = teachers.filter((t) => t.facultyKey === fac.key).length;
      }
    });
    return counts;
  }, [teachers]);

  // Filter faculties in the right vertical sidebar
  const filteredFaculties = useMemo(() => {
    if (!schoolSearch.trim()) return FACULTIES;
    const q = schoolSearch.toLowerCase();
    return FACULTIES.filter(
      (f) =>
        f.nameZh.toLowerCase().includes(q) ||
        f.nameEn.toLowerCase().includes(q) ||
        f.key.toLowerCase().includes(q)
    );
  }, [schoolSearch]);

  const currentFaculty = FACULTIES.find((f) => f.key === selectedFaculty);

  // Filtered teachers list
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      // Faculty match
      if (selectedFaculty !== 'all' && t.facultyKey !== selectedFaculty) {
        return false;
      }
      // Status filter
      if (statusFilter === 'available' && t.status !== 'available') {
        return false;
      }
      if (statusFilter === 'office_hours' && t.status !== 'office_hours') {
        return false;
      }

      // Query match (Name, Chinese name, Title, Research interests, Courses)
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchName =
        t.fullName.toLowerCase().includes(q) || (t.chineseName && t.chineseName.includes(q));
      const matchDept =
        t.department.toLowerCase().includes(q) || t.faculty.toLowerCase().includes(q);
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchResearch = t.researchInterests?.some((r) => r.toLowerCase().includes(q));
      const matchOffice = t.officeLocation.toLowerCase().includes(q);

      // Check courses taught
      const teacherCourses = courses.filter((c) => t.coursesTaughtIds.includes(c.id));
      const matchCourses = teacherCourses.some(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.chineseName && c.chineseName.toLowerCase().includes(q)) ||
          c.code.toLowerCase().includes(q)
      );

      return matchName || matchDept || matchTitle || matchResearch || matchOffice || matchCourses;
    });
  }, [teachers, courses, selectedFaculty, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Directory Title and Introduction */}
      <div className="bg-gradient-to-r from-academic-900 via-academic-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-academic-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-bjtu-100 text-xs font-medium mb-3 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            {language === 'zh' ? '北京交通大学师资咨询平台' : 'BJTU Faculty Consultation Hub'}
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {t('faculty.hub.title')}
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            {t('faculty.hub.desc')}
          </p>
        </div>
      </div>

      {/* Main Content Area: Left Side (Teachers) + Right Side (Vertical School Navigation) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column: Teachers Directory & Search/Filters */}
        <div className="flex-1 min-w-0 w-full space-y-4 order-2 lg:order-1">
          {/* Mobile School Dropdown (Visible on < lg) */}
          <div className="lg:hidden bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <GraduationCap className="w-5 h-5 text-academic-700 shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {language === 'zh' ? '学院选择' : 'BJTU School Selection'}
              </label>
              <select
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="w-full mt-0.5 text-xs font-semibold text-slate-800 bg-transparent outline-none cursor-pointer"
              >
                {FACULTIES.map((fac) => (
                  <option key={fac.key} value={fac.key}>
                    {language === 'zh' ? fac.nameZh : fac.nameEn} ({facultyCounts[fac.key] ?? 0})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Input & Status Filter */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('faculty.searchPlaceholder')}
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-academic-600/20 focus:border-academic-700 outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    title={t('action.clear')}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs sm:text-sm py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-academic-600/20 cursor-pointer"
                >
                  <option value="all">{t('status.all')}</option>
                  <option value="available">
                    {language === 'zh' ? '🟢 在线可答疑' : '🟢 Available Now for Chat'}
                  </option>
                  <option value="office_hours">
                    {language === 'zh' ? '🔵 答疑时间中' : '🔵 In Office Hours'}
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Directory Results Header */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span>
                {language === 'zh' ? (
                  <>共找到 <strong className="text-slate-800">{filteredTeachers.length}</strong> 位教师</>
                ) : (
                  <>Showing <strong className="text-slate-800">{filteredTeachers.length}</strong> faculty members</>
                )}
              </span>
              {selectedFaculty !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-academic-50 border border-academic-200 text-academic-800 font-semibold text-[11px]">
                  <span>{language === 'zh' ? currentFaculty?.nameZh : currentFaculty?.nameEn}</span>
                  <button
                    onClick={() => setSelectedFaculty('all')}
                    className="hover:text-academic-900 ml-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                    title={t('action.clear')}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            {(selectedFaculty !== 'all' || searchQuery || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSelectedFaculty('all');
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="text-[11px] text-academic-700 hover:underline font-medium cursor-pointer"
              >
                {t('faculty.clearFilters')}
              </button>
            )}
          </div>

          {/* Professors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {filteredTeachers.map((teacher) => {
              const teacherCourses = courses.filter((c) => teacher.coursesTaughtIds.includes(c.id));
              const isStudentEnrolledInTheirClass = teacherCourses.some((c) =>
                student.enrolledCourseIds.includes(c.id)
              );

              return (
                <div
                  key={teacher.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all p-5 flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Avatar & Status Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={teacher.avatar}
                          name={formatTeacher(teacher)}
                          size="lg"
                          status={teacher.status}
                        />
                        <div>
                          <h3 className="font-bold text-slate-900 text-base group-hover:text-academic-700 transition-colors">
                            {formatTeacher(teacher)}
                          </h3>
                          <p className="text-xs text-slate-600 mt-0.5">{formatTitle(teacher.title)}</p>
                          <p className="text-[11px] text-academic-800 font-medium">
                            {formatSchool(teacher.faculty)}
                          </p>
                        </div>
                      </div>

                      <StatusIndicator
                        status={teacher.status}
                        customMessage={teacher.customStatusMessage}
                        size="sm"
                      />
                    </div>

                    {/* Enrolled Badge if student is in this teacher's course */}
                    {isStudentEnrolledInTheirClass && (
                      <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t('faculty.yourInstructor')}
                      </div>
                    )}

                    {/* Location & Office Hours */}
                    <div className="mt-4 space-y-2 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{formatLocation(teacher.officeLocation)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{formatOfficeHours(teacher.officeHours)}</span>
                      </div>
                    </div>

                    {/* Courses Taught */}
                    {teacherCourses.length > 0 && (
                      <div className="mt-4">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> {t('faculty.coursesTaught')}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {teacherCourses.map((c) => (
                            <span
                              key={c.id}
                              className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium truncate max-w-[220px]"
                              title={`${c.code}: ${formatCourse(c)}`}
                            >
                              {c.code} {formatCourse(c)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Research tags */}
                    {teacher.researchInterests && teacher.researchInterests.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {teacher.researchInterests.map((r, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 text-slate-500 rounded-full"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Button */}
                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => onStartChat(teacher.id, teacherCourses[0]?.id)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-academic-800 bg-academic-50 hover:bg-academic-700 hover:text-white border border-academic-200 transition-all shadow-2xs cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{language === 'zh' ? '发起一对一学业咨询' : 'Start 1-on-1 Consultation'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTeachers.length === 0 && (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-slate-800">{t('faculty.noResults')}</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {t('faculty.tryAdjusting')}
              </p>
              <button
                onClick={() => {
                  setSelectedFaculty('all');
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="px-4 py-2 text-xs font-semibold text-academic-700 bg-academic-50 rounded-lg hover:bg-academic-100 transition-colors cursor-pointer"
              >
                {t('action.reset')}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Vertical School Navigation */}
        <div className="w-full lg:w-80 xl:w-88 shrink-0 lg:sticky lg:top-20 space-y-3 order-1 lg:order-2">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
            {/* School Header */}
            <div className="p-4 bg-gradient-to-br from-slate-900 via-academic-950 to-academic-900 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-bjtu-100 backdrop-blur-xs">
                    <GraduationCap className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white leading-tight">
                      {language === 'zh' ? '学院目录' : 'BJTU Schools'}
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      {language === 'zh' ? '北京交通大学学院目录' : 'School Directory'}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-white/15 text-[11px] font-semibold text-bjtu-100 border border-white/10">
                  {FACULTIES.filter((f) => f.key !== 'all').length} {language === 'zh' ? '所学院' : 'Schools'}
                </span>
              </div>

              {/* School Search Input */}
              <div className="mt-3 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={schoolSearch}
                  onChange={(e) => setSchoolSearch(e.target.value)}
                  placeholder={language === 'zh' ? '搜索学院...' : 'Filter schools...'}
                  className="w-full pl-9 pr-7 py-1.5 bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 placeholder-slate-400 rounded-xl text-xs outline-none transition-all border border-white/10 focus:border-white"
                />
                {schoolSearch && (
                  <button
                    onClick={() => setSchoolSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Vertical School List */}
            <div className="p-2 max-h-[calc(100vh-270px)] overflow-y-auto space-y-1.5 custom-scrollbar">
              {filteredFaculties.map((fac) => {
                const isSelected = selectedFaculty === fac.key;
                const count = facultyCounts[fac.key] ?? 0;
                const displayName = language === 'zh' ? fac.nameZh : fac.nameEn;

                return (
                  <button
                    key={fac.key}
                    onClick={() => setSelectedFaculty(fac.key)}
                    className={cn(
                      'w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between gap-3 group cursor-pointer border',
                      isSelected
                        ? 'bg-academic-700 text-white shadow-xs border-academic-800'
                        : 'bg-slate-50/70 hover:bg-slate-100 text-slate-700 border-slate-100 hover:border-slate-200'
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            'text-xs font-bold truncate block',
                            isSelected ? 'text-white' : 'text-slate-800 group-hover:text-academic-800'
                          )}
                          title={displayName}
                        >
                          {displayName}
                        </span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                        )}
                      </div>
                    </div>

                    <span
                      className={cn(
                        'text-[11px] px-2 py-0.5 rounded-full shrink-0 font-medium',
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200/70 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-800'
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}

              {filteredFaculties.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400">
                  {language === 'zh'
                    ? `未找到匹配学院 "${schoolSearch}"`
                    : `No schools match "${schoolSearch}"`}
                </div>
              )}
            </div>

            {/* Quick Reset Footer if not all */}
            {selectedFaculty !== 'all' && (
              <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">
                  {language === 'zh' ? '已筛选视图' : 'Filtered view'}
                </span>
                <button
                  onClick={() => setSelectedFaculty('all')}
                  className="text-[11px] font-semibold text-academic-700 hover:text-academic-800 hover:underline cursor-pointer"
                >
                  {language === 'zh' ? '重置为全部学院' : 'Reset to All Schools'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
