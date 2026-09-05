'use client';

import React, { useState, useMemo } from 'react';
import { Course, TeacherProfile, StudentProfile } from '../../types/portal';
import { FACULTIES } from '../../data/dummyData';
import { Avatar } from '../common/Avatar';
import { StatusIndicator } from '../common/StatusIndicator';
import { enrollStudentCourse, dropStudentCourse } from '../../lib/storage';
import { useLanguage } from '../../context/LanguageContext';
import {
  BookOpen,
  Calendar,
  MapPin,
  MessageSquare,
  Clock,
  GraduationCap,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Plus,
  Trash2,
  Search,
  Filter,
  AlertCircle,
  Table,
  Layers,
  Globe,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { AddCustomCourseModal } from './AddCustomCourseModal';

interface EnrolledCoursesProps {
  student: StudentProfile;
  courses: Course[];
  teachers: TeacherProfile[];
  onStartChat: (teacherId: string, courseId: string) => void;
  onRefresh?: () => void;
}

const PERIOD_SLOTS = [
  { slot: 1, nameZh: '第 1-2 节', nameEn: 'Period 1-2', time: '08:00 - 09:35' },
  { slot: 2, nameZh: '第 3-4 节', nameEn: 'Period 3-4', time: '10:00 - 11:35' },
  { slot: 3, nameZh: '第 5-6 节', nameEn: 'Period 5-6', time: '14:00 - 15:35' },
  { slot: 4, nameZh: '第 7-8 节', nameEn: 'Period 7-8', time: '16:00 - 17:35' },
  { slot: 5, nameZh: '第 9-10 节', nameEn: 'Period 9-10', time: '19:00 - 20:35' },
];

const DAYS_OF_WEEK = [
  { day: 1, nameZh: '星期一', nameEn: 'Monday' },
  { day: 2, nameZh: '星期二', nameEn: 'Tuesday' },
  { day: 3, nameZh: '星期三', nameEn: 'Wednesday' },
  { day: 4, nameZh: '星期四', nameEn: 'Thursday' },
  { day: 5, nameZh: '星期五', nameEn: 'Friday' },
];

const COURSE_COLORS = [
  'bg-sky-50 border-sky-200 text-sky-900',
  'bg-emerald-50 border-emerald-200 text-emerald-900',
  'bg-violet-50 border-violet-200 text-violet-900',
  'bg-amber-50 border-amber-200 text-amber-900',
  'bg-rose-50 border-rose-200 text-rose-900',
  'bg-indigo-50 border-indigo-200 text-indigo-900',
  'bg-teal-50 border-teal-200 text-teal-900',
];

export const EnrolledCourses: React.FC<EnrolledCoursesProps> = ({
  student,
  courses,
  teachers,
  onStartChat,
  onRefresh,
}) => {
  const {
    language,
    t,
    formatTeacher,
    formatSchool,
    formatCourse,
    formatLocation,
    formatTitle,
    formatOfficeHours,
  } = useLanguage();

  const [subTab, setSubTab] = useState<'enrolled' | 'selection' | 'timetable'>('enrolled');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'required' | 'elective' | 'general'>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Courses currently enrolled by the student
  const studentCourses = useMemo(() => {
    return courses.filter((c) => student.enrolledCourseIds.includes(c.id));
  }, [courses, student.enrolledCourseIds]);

  const totalCredits = useMemo(() => {
    return studentCourses.reduce((acc, c) => acc + c.credits, 0);
  }, [studentCourses]);

  const maxCredits = 28;

  // Filter available courses for Course Selection Center
  const availableCourses = useMemo(() => {
    return courses.filter((course) => {
      // Faculty filter
      if (selectedFaculty !== 'all' && course.facultyKey !== selectedFaculty) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && course.category !== selectedCategory) {
        return false;
      }
      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const teacher = teachers.find((t) => t.id === course.teacherId);
      return (
        course.name.toLowerCase().includes(q) ||
        course.chineseName.toLowerCase().includes(q) ||
        course.code.toLowerCase().includes(q) ||
        course.classroom.toLowerCase().includes(q) ||
        teacher?.fullName.toLowerCase().includes(q) ||
        (teacher?.chineseName && teacher.chineseName.includes(q))
      );
    });
  }, [courses, teachers, selectedFaculty, selectedCategory, searchQuery]);

  const handleEnroll = (course: Course) => {
    const res = enrollStudentCourse(student.id, course.id);
    const msg =
      language === 'zh'
        ? res.success
          ? `已成功选修: ${course.chineseName || course.name}`
          : res.message
        : res.message;

    setNotification({
      type: res.success ? 'success' : 'error',
      message: msg,
    });
    if (res.success) {
      onRefresh?.();
    }
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleDrop = (course: Course) => {
    const promptText =
      language === 'zh'
        ? `您确定要退选课程 "${course.chineseName || course.name}" (${course.code}) 吗？`
        : `Are you sure you want to drop "${course.name}" (${course.code})?`;

    if (!confirm(promptText)) {
      return;
    }
    const res = dropStudentCourse(student.id, course.id);
    const msg =
      language === 'zh'
        ? res.success
          ? `已成功退选课程: ${course.chineseName || course.name}`
          : res.message
        : res.message;

    setNotification({
      type: res.success ? 'success' : 'error',
      message: msg,
    });
    if (res.success) {
      onRefresh?.();
    }
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Official BJTU Academic Affairs & MIS Gateway Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-academic-950 to-academic-900 rounded-2xl p-5 text-white shadow-md border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-academic-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-academic-500/20 text-bjtu-100 border border-academic-400/30 text-xs font-semibold backdrop-blur-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {language === 'zh' ? '北京交通大学教务与MIS综合网关' : 'BJTU AA & MIS Educational Gateway'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {language === 'zh' ? '校园内网认证已直连' : 'Campus SSO Authenticated & Connected'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              {language === 'zh'
                ? '本科生选课与个人日程管理系统'
                : 'Academic Affairs Administration System'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {language === 'zh'
                ? '已直连北京交通大学教务系统 (aa.bjtu.edu.cn) 及综合信息服务系统 (MIS)。支持实时选课、退课与查看个人周课表日程。'
                : 'Synchronized with Beijing Jiaotong University Academic Affairs (aa.bjtu.edu.cn) & Campus MIS Portal. Select, drop, and review your semester timetable in real time.'}
            </p>
          </div>

          {/* Direct Portal Link Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto shrink-0">
            <a
              href="https://aa.bjtu.edu.cn/course_selection/courseselecttask/schedule/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold transition-all backdrop-blur-xs hover:border-white/40 shadow-xs"
              title="Open BJTU Academic Affairs Schedule directly"
            >
              <Globe className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === 'zh' ? 'aa.bjtu.edu.cn (选课课表)' : 'aa.bjtu.edu.cn (Course Schedule)'}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>

            <a
              href="https://mis.bjtu.edu.cn"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-academic-700 hover:bg-academic-600 text-white text-xs font-semibold transition-all shadow-xs border border-academic-600"
              title="Open BJTU MIS Portal"
            >
              <GraduationCap className="w-3.5 h-3.5 text-bjtu-100" />
              <span>{language === 'zh' ? 'mis.bjtu.edu.cn (MIS 32.教务)' : 'mis.bjtu.edu.cn (MIS Academic Affairs)'}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        </div>

        {/* Live Semester & Credit Meter Summary */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-semibold text-white">
              {language === 'zh' ? '2026秋季学期选课轮次:' : 'Fall 2026 Selection Phase:'}
            </span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-amber-300 font-medium">
              {language === 'zh' ? '退补选阶段' : 'Add / Drop Selection Phase'}
            </span>
            <span className="text-slate-400">|</span>
            <span>{language === 'zh' ? '本研一体化选课开放中' : 'Undergraduate & Graduate Enrollment Active'}</span>
          </div>

          <div className="flex items-center gap-2 font-medium">
            <span>{language === 'zh' ? '学分统计:' : 'Credits Registered:'}</span>
            <strong className="text-white font-bold">{totalCredits}</strong>
            <span className="text-slate-400">
              / {maxCredits} {language === 'zh' ? '学分上限' : 'Max Limit'}
            </span>
            <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden ml-1">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((totalCredits / maxCredits) * 100))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast Alert */}
      {notification && (
        <div
          className={cn(
            'p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-200 shadow-xs',
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          )}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Sub-View Tabs: Registered Courses | Course Selection Center | Weekly Timetable */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSubTab('enrolled')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer',
              subTab === 'enrolled'
                ? 'bg-academic-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            <BookOpen className="w-4 h-4" />
            <span>{language === 'zh' ? '我的已选课程' : 'My Enrolled Courses'}</span>
            <span
              className={cn(
                'px-1.5 py-0.5 rounded-full text-[10.5px] font-bold ml-1',
                subTab === 'enrolled' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              )}
            >
              {studentCourses.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('selection')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer',
              subTab === 'selection'
                ? 'bg-academic-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            <Plus className="w-4 h-4 text-emerald-500" />
            <span>{language === 'zh' ? '自主选课大厅' : 'Course Selection Center'}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-100 text-emerald-800 ml-1">
              {language === 'zh' ? '开放中' : 'Open'}
            </span>
          </button>

          <button
            onClick={() => setSubTab('timetable')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer',
              subTab === 'timetable'
                ? 'bg-academic-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            <Table className="w-4 h-4" />
            <span>{language === 'zh' ? '个人周课表' : 'Weekly Timetable'}</span>
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-xs text-slate-500 pr-2 hidden lg:block">
            {language === 'zh' ? (
              <span>
                已选课程: <strong className="text-slate-800">{studentCourses.length}</strong> 门 (
                <strong className="text-academic-700">{totalCredits}</strong> 学分)
              </span>
            ) : (
              <span>
                Current Enrolled: <strong className="text-slate-800">{studentCourses.length}</strong> courses (
                <strong className="text-academic-700">{totalCredits}</strong> credits)
              </span>
            )}
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-xs cursor-pointer ml-auto"
            title="Create and register a custom course"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'zh' ? '自主添加课程' : 'Add Custom Course'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: MY ENROLLED COURSES */}
      {/* ========================================================================= */}
      {subTab === 'enrolled' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              {language === 'zh' ? (
                <>
                  当前已选 <strong>{studentCourses.length}</strong> 门课程 ({student.fullName})
                </>
              ) : (
                <>
                  Showing <strong>{studentCourses.length}</strong> enrolled courses for {student.fullName}
                </>
              )}
            </span>
            <span className="text-slate-600 font-medium">
              {language === 'zh'
                ? `已选学分: ${totalCredits} 学分 (剩余额度: ${maxCredits - totalCredits} 学分)`
                : `Registered Total: ${totalCredits} Credits (Remaining Limit: ${maxCredits - totalCredits} Credits)`}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {studentCourses.map((course) => {
              const instructor = teachers.find((t) => t.id === course.teacherId);

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-md transition-all p-6 flex flex-col justify-between group"
                >
                  <div>
                    {/* Course Header & Badges */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-xs font-bold border border-slate-200">
                            {course.code}
                          </span>
                          <span className="text-xs font-semibold text-academic-700 bg-academic-50 px-2 py-0.5 rounded-full border border-academic-100">
                            {course.credits} {language === 'zh' ? '学分' : 'Credits'}
                          </span>
                          {course.category && (
                            <span
                              className={cn(
                                'text-[11px] font-medium px-2 py-0.5 rounded-full border',
                                course.category === 'required'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : course.category === 'elective'
                                  ? 'bg-sky-50 text-sky-700 border-sky-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              )}
                            >
                              {course.category === 'required'
                                ? (language === 'zh' ? '必修课' : 'Major Required')
                                : course.category === 'elective'
                                ? (language === 'zh' ? '专业选修' : 'Major Elective')
                                : (language === 'zh' ? '通识选修' : 'General Elective')}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mt-2 leading-snug group-hover:text-academic-700 transition-colors">
                          {formatCourse(course)}
                        </h3>
                        <p className="text-xs text-academic-800 font-medium mt-1">
                          {formatSchool(course.faculty)}
                        </p>
                      </div>
                    </div>

                    {/* Course Schedule & Classroom */}
                    <div className="space-y-2 py-3 border-y border-slate-100 my-4 text-xs text-slate-600 bg-slate-50/50 p-3 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {language === 'zh' ? '时间安排: ' : 'Schedule: '}
                          <strong className="text-slate-800">{formatOfficeHours(course.schedule)}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {language === 'zh' ? '上课教室: ' : 'Classroom: '}
                          <strong className="text-slate-800">{formatLocation(course.classroom)}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Assigned Instructor Card */}
                    {instructor && (
                      <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                          <span>{language === 'zh' ? '主讲教师' : 'Course Lead Instructor'}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={instructor.avatar}
                              name={formatTeacher(instructor)}
                              size="md"
                              status={instructor.status}
                            />
                            <div>
                              <div className="font-semibold text-slate-900 text-sm">
                                {formatTeacher(instructor)}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {formatTitle(instructor.title)}
                              </div>
                            </div>
                          </div>

                          <StatusIndicator
                            status={instructor.status}
                            size="sm"
                            customMessage={instructor.customStatusMessage}
                          />
                        </div>

                        <div className="mt-3 text-xs text-slate-500 flex items-center gap-2 pt-2 border-t border-slate-200/50">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {language === 'zh' ? '答疑时间: ' : 'Office Hours: '}
                            {formatOfficeHours(instructor.officeHours)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions: Inquire + Drop Course */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                    {instructor && (
                      <button
                        onClick={() => onStartChat(instructor.id, course.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-academic-700 hover:bg-academic-800 transition-all shadow-xs cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>
                          {language === 'zh'
                            ? `向 ${formatTeacher(instructor)} 咨询`
                            : `Inquire with ${instructor.fullName.split(' ')[1] || 'Professor'}`}
                        </span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDrop(course)}
                      className="px-3.5 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                      title={language === 'zh' ? '退选此课程' : 'Drop Course'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{language === 'zh' ? '退选' : 'Drop'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {studentCourses.length === 0 && (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-base font-semibold text-slate-800">
                {language === 'zh' ? '暂未选修任何课程' : 'No registered courses yet'}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {language === 'zh'
                  ? '您当前选课总数为 0。请前往自主选课大厅浏览开课目录并完成选课。'
                  : 'You currently have 0 enrolled courses. Go to the Course Selection Center to browse and enroll in courses.'}
              </p>
              <button
                onClick={() => setSubTab('selection')}
                className="px-4 py-2 text-xs font-semibold text-white bg-academic-700 hover:bg-academic-800 rounded-xl transition-all cursor-pointer"
              >
                {language === 'zh' ? '前往自主选课大厅' : 'Go to Course Selection Center'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: COURSE SELECTION CENTER */}
      {/* ========================================================================= */}
      {subTab === 'selection' && (
        <div className="space-y-5">
          {/* Search and Filters Card */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('courses.selection.search')}
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-academic-600/20 focus:border-academic-700 outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* School Dropdown */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
                <select
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                  className="text-xs sm:text-sm py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-academic-600/20 cursor-pointer max-w-[200px]"
                >
                  {FACULTIES.map((f) => (
                    <option key={f.key} value={f.key}>
                      {language === 'zh' ? f.nameZh : f.nameEn}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                  title="Add a custom course of your choice"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'zh' ? '自主添加课程' : 'Add Custom Course'}</span>
                </button>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto pb-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                {language === 'zh' ? '课程类型:' : 'Course Type:'}
              </span>
              {[
                { key: 'all', label: language === 'zh' ? '全部课程' : 'All Courses' },
                { key: 'required', label: language === 'zh' ? '必修课' : 'Major Required' },
                { key: 'elective', label: language === 'zh' ? '专业选修' : 'Major Electives' },
                { key: 'general', label: language === 'zh' ? '通识选修' : 'General Education' },
              ].map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key as any)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer',
                    selectedCategory === cat.key
                      ? 'bg-academic-700 text-white shadow-2xs font-semibold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              {language === 'zh' ? (
                <>
                  可选课程总数: <strong className="text-slate-800">{availableCourses.length}</strong> 门
                </>
              ) : (
                <>
                  Available Courses: <strong className="text-slate-800">{availableCourses.length}</strong> offerings
                </>
              )}
            </span>
            {(selectedFaculty !== 'all' || selectedCategory !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedFaculty('all');
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="text-academic-700 hover:underline font-medium cursor-pointer"
              >
                {t('action.clear')}
              </button>
            )}
          </div>

          {/* Courses Selection List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {availableCourses.map((course) => {
              const isEnrolled = student.enrolledCourseIds.includes(course.id);
              const instructor = teachers.find((t) => t.id === course.teacherId);
              const isFull = course.capacity && course.enrolledCount ? course.enrolledCount >= course.capacity : false;

              return (
                <div
                  key={course.id}
                  className={cn(
                    'bg-white rounded-2xl border p-5 flex flex-col justify-between transition-all',
                    isEnrolled
                      ? 'border-emerald-300 ring-1 ring-emerald-400/30 bg-emerald-50/10'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                  )}
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {course.code}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-academic-700 bg-academic-50 px-2 py-0.5 rounded-full border border-academic-100">
                          {course.credits} {language === 'zh' ? '学分' : 'Credits'}
                        </span>
                        {course.category && (
                          <span
                            className={cn(
                              'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                              course.category === 'required'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : course.category === 'elective'
                                ? 'bg-sky-50 text-sky-700 border-sky-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            )}
                          >
                            {course.category === 'required'
                              ? (language === 'zh' ? '必修' : 'Required')
                              : course.category === 'elective'
                              ? (language === 'zh' ? '选修' : 'Elective')
                              : (language === 'zh' ? '通识' : 'General')}
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base leading-snug mt-1.5">
                      {formatCourse(course)}
                    </h4>
                    <p className="text-[11px] text-academic-800 font-medium mt-1 truncate">
                      {formatSchool(course.faculty)}
                    </p>

                    {/* Schedule & Location */}
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 text-xs text-slate-600 space-y-1.5 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{formatOfficeHours(course.schedule)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{formatLocation(course.classroom)}</span>
                      </div>
                    </div>

                    {/* Capacity and Enrolled ratio */}
                    {course.capacity && course.enrolledCount !== undefined && (
                      <div className="mt-3 text-[11px] text-slate-500 space-y-1">
                        <div className="flex justify-between font-medium">
                          <span>{language === 'zh' ? '容量:' : 'Seats Taken / Capacity:'}</span>
                          <span className={cn(isFull ? 'text-rose-600 font-bold' : 'text-slate-700')}>
                            {course.enrolledCount} / {course.capacity}
                            {isFull && (language === 'zh' ? ' (已满)' : ' (Full)')}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              isFull ? 'bg-rose-500' : 'bg-academic-600'
                            )}
                            style={{ width: `${Math.min(100, (course.enrolledCount / course.capacity) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Instructor mini info */}
                    {instructor && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                        <Avatar
                          src={instructor.avatar}
                          name={formatTeacher(instructor)}
                          size="xs"
                        />
                        <span className="truncate font-medium">
                          {formatTeacher(instructor)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Enroll / Drop Action Button */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    {isEnrolled ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                          <Check className="w-3.5 h-3.5" />
                          <span>{language === 'zh' ? '已选修' : 'Enrolled'}</span>
                        </div>
                        <button
                          onClick={() => handleDrop(course)}
                          className="py-2 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                          title={language === 'zh' ? '退选此课程' : 'Drop Course'}
                        >
                          {language === 'zh' ? '退选' : 'Drop'}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course)}
                        disabled={isFull}
                        className={cn(
                          'w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer',
                          isFull
                            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                            : 'bg-academic-700 hover:bg-academic-800 text-white'
                        )}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>
                          {isFull
                            ? (language === 'zh' ? '名额已满' : 'Class Full')
                            : (language === 'zh' ? '选择此课' : 'Select Course')}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: WEEKLY SCHEDULE TIMETABLE */}
      {/* ========================================================================= */}
      {subTab === 'timetable' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-academic-50 text-academic-700 text-xs font-semibold mb-1">
                <Calendar className="w-3.5 h-3.5" />
                {language === 'zh' ? '北京交通大学本科生个人周课表' : 'BJTU Weekly Course Timetable'}
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {language === 'zh' ? '个人学期周课表 — 2026秋季' : 'Weekly Class Schedule — Fall 2026'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'zh'
                  ? `基于您已选修的 ${studentCourses.length} 门课程及上课节次自动生成。`
                  : `Visual timetable based on your ${studentCourses.length} registered courses and BJTU teaching building assignments.`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://aa.bjtu.edu.cn/course_selection/courseselecttask/schedule/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                <span>{language === 'zh' ? '在教务系统查看' : 'View on BJTU AA'}</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Timetable Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto p-4">
            <div className="min-w-[760px]">
              {/* Header Row: Days of Week */}
              <div className="grid grid-cols-6 gap-2 pb-3 border-b border-slate-100 text-center text-xs font-bold text-slate-700">
                <div className="py-2 bg-slate-50 rounded-xl text-slate-400 font-semibold text-[11px] flex items-center justify-center">
                  {language === 'zh' ? '节次 / 时间' : 'Period / Time'}
                </div>
                {DAYS_OF_WEEK.map((d) => (
                  <div key={d.day} className="py-2 bg-slate-50 rounded-xl">
                    <span className="text-slate-900 font-bold">
                      {language === 'zh' ? d.nameZh : d.nameEn}
                    </span>
                  </div>
                ))}
              </div>

              {/* Rows: Periods 1-5 */}
              <div className="space-y-2 mt-2">
                {PERIOD_SLOTS.map((slot) => {
                  return (
                    <div key={slot.slot} className="grid grid-cols-6 gap-2 min-h-[110px]">
                      {/* Left Header Column: Period Name & Time */}
                      <div className="bg-slate-50/80 rounded-xl p-2.5 flex flex-col justify-center items-center text-center border border-slate-100">
                        <span className="font-bold text-slate-800 text-xs">
                          {language === 'zh' ? slot.nameZh : slot.nameEn}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5">{slot.time}</span>
                      </div>

                      {/* 5 Day Cells */}
                      {DAYS_OF_WEEK.map((day) => {
                        // Find courses that occupy this day and periodSlot
                        const matchingCourses = studentCourses.filter(
                          (c) =>
                            c.dayOfWeek?.includes(day.day) &&
                            (c.periodSlot === slot.slot ||
                              (!c.periodSlot && slot.slot === 1))
                        );

                        return (
                          <div
                            key={day.day}
                            className={cn(
                              'rounded-xl p-2 border transition-all flex flex-col justify-between text-left',
                              matchingCourses.length > 0
                                ? 'bg-academic-50/40 border-academic-200/80 shadow-2xs'
                                : 'bg-slate-50/30 border-slate-100/80 hover:bg-slate-50/60'
                            )}
                          >
                            {matchingCourses.length > 0 ? (
                              matchingCourses.map((c, idx) => {
                                const instructor = teachers.find((t) => t.id === c.teacherId);
                                const colorClass = COURSE_COLORS[idx % COURSE_COLORS.length];
                                return (
                                  <div
                                    key={c.id}
                                    className={cn(
                                      'p-2 rounded-lg border text-xs flex flex-col justify-between h-full group',
                                      colorClass
                                    )}
                                  >
                                    <div>
                                      <div className="flex items-center justify-between">
                                        <span className="font-mono font-bold text-[11px]">
                                          {c.code}
                                        </span>
                                        <span className="text-[10px] opacity-75 font-semibold">
                                          {c.credits}{language === 'zh' ? '学分' : 'cr'}
                                        </span>
                                      </div>
                                      <h5 className="font-bold text-[11.5px] leading-tight mt-1 line-clamp-2" title={formatCourse(c)}>
                                        {formatCourse(c)}
                                      </h5>
                                    </div>

                                    <div className="mt-2 pt-1.5 border-t border-black/5 space-y-0.5 text-[10.5px] opacity-90">
                                      <div className="flex items-center gap-1 truncate" title={formatLocation(c.classroom)}>
                                        <MapPin className="w-3 h-3 shrink-0" />
                                        <span className="truncate">{formatLocation(c.classroom)}</span>
                                      </div>
                                      {instructor && (
                                        <div className="truncate font-medium">
                                          {formatTeacher(instructor)}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="h-full flex items-center justify-center text-slate-300 text-[11px] font-mono">
                                —
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Course Modal */}
      <AddCustomCourseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        student={student}
        teachers={teachers}
        onCourseAdded={(newCourse) => {
          setNotification({
            type: 'success',
            message:
              language === 'zh'
                ? `已成功创建并选修课程: ${newCourse.chineseName || newCourse.name} (${newCourse.code})！`
                : `Successfully created and enrolled in ${newCourse.code} (${newCourse.name})!`,
          });
          onRefresh?.();
        }}
      />
    </div>
  );
};
