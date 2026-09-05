'use client';

import React, { useState } from 'react';
import { Course, TeacherProfile, StudentProfile, FacultyKey } from '../../types/portal';
import { FACULTIES } from '../../data/dummyData';
import { createCustomCourse } from '../../lib/storage';
import { useLanguage } from '../../context/LanguageContext';
import {
  X,
  Plus,
  BookOpen,
  Calendar,
  MapPin,
  Clock,
  GraduationCap,
  Sparkles,
  Layers,
  Check,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface AddCustomCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  teachers: TeacherProfile[];
  onCourseAdded: (course: Course) => void;
}

export const AddCustomCourseModal: React.FC<AddCustomCourseModalProps> = ({
  isOpen,
  onClose,
  student,
  teachers,
  onCourseAdded,
}) => {
  const { language, t, formatTeacher, formatTitle } = useLanguage();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [chineseName, setChineseName] = useState('');
  const [facultyKey, setFacultyKey] = useState<FacultyKey>(student.facultyKey || 'cs');
  const [teacherId, setTeacherId] = useState<string>('auto');
  const [credits, setCredits] = useState<number>(3);
  const [category, setCategory] = useState<'required' | 'elective' | 'general'>('elective');
  const [classroom, setClassroom] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([1]);
  const [periodSlot, setPeriodSlot] = useState<number>(1);
  const [autoEnroll, setAutoEnroll] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentFaculty = FACULTIES.find((f) => f.key === facultyKey);
  const facultyTeachers = teachers.filter((t) => t.facultyKey === facultyKey);

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length === 1) return; // Keep at least one day
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day].sort());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim()) {
      setError(language === 'zh' ? '请输入课程代码。' : 'Please enter a course code.');
      return;
    }
    if (!name.trim()) {
      setError(language === 'zh' ? '请输入课程名称。' : 'Please enter a course name.');
      return;
    }

    const assignedTeacher =
      teacherId === 'auto'
        ? facultyTeachers[0]?.id || teachers[0]?.id || 'teacher_1'
        : teacherId;

    const newCourse = createCustomCourse(
      {
        code: code.trim(),
        name: name.trim(),
        chineseName: chineseName.trim() || name.trim(),
        faculty: currentFaculty?.nameZh ? `${currentFaculty.nameEn} (${currentFaculty.nameZh})` : student.faculty,
        facultyKey: facultyKey,
        teacherId: assignedTeacher,
        classroom: classroom.trim() || 'Siyuan Building (思源楼)',
        credits: Number(credits) || 3,
        category,
        capacity: 60,
        dayOfWeek: selectedDays,
        periodSlot,
      },
      autoEnroll ? student.id : undefined
    );

    onCourseAdded(newCourse);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-academic-950 to-academic-900 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {language === 'zh' ? '自主添加课程' : 'Add Custom Course'}
                </h3>
                <p className="text-xs text-slate-300">
                  {language === 'zh'
                    ? '北京交通大学教务系统 • 自主录入并选修新课程'
                    : 'BJTU Academic Affairs • Register your custom course'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[calc(85vh-120px)] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Row 1: Code and Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {language === 'zh' ? '课程代码' : 'Course Code'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CS305"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono uppercase focus:bg-white focus:ring-2 focus:ring-academic-600/20 focus:border-academic-700 outline-none"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {language === 'zh' ? '课程英文名称' : 'Course Title (English)'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={language === 'zh' ? '例如: Mobile App Engineering' : 'e.g. Mobile App Engineering'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-academic-600/20 focus:border-academic-700 outline-none"
                required
              />
            </div>
          </div>

          {/* Row 2: Chinese Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {language === 'zh' ? '课程中文名称' : 'Course Title (Chinese)'}{' '}
              <span className="text-slate-400 font-normal">
                ({language === 'zh' ? '可选' : 'Optional'})
              </span>
            </label>
            <input
              type="text"
              value={chineseName}
              onChange={(e) => setChineseName(e.target.value)}
              placeholder={language === 'zh' ? '例如: 移动应用工程与跨平台开发' : 'e.g. 移动应用工程'}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-academic-600/20 focus:border-academic-700 outline-none"
            />
          </div>

          {/* Row 3: School / College */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {language === 'zh' ? '开课学院' : 'School / College'}
            </label>
            <select
              value={facultyKey}
              onChange={(e) => {
                setFacultyKey(e.target.value as any);
                setTeacherId('auto');
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-academic-600/20 focus:border-academic-700 outline-none cursor-pointer"
            >
              {FACULTIES.filter((f) => f.key !== 'all').map((f) => (
                <option key={f.key} value={f.key}>
                  {language === 'zh' ? f.nameZh : f.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Row 4: Instructor & Credits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {language === 'zh' ? '主讲教师' : 'Lead Instructor'}
              </label>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-academic-600/20 focus:border-academic-700 outline-none cursor-pointer"
              >
                <option value="auto">
                  {language === 'zh' ? '学院默认教授' : 'Default College Faculty'}
                </option>
                {facultyTeachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {formatTeacher(t)} - {formatTitle(t.title)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {language === 'zh' ? '学分' : 'Credits'}
              </label>
              <select
                value={credits}
                onChange={(e) => setCredits(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-academic-600/20 focus:border-academic-700 outline-none cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} {language === 'zh' ? '学分' : num === 1 ? 'Credit' : 'Credits'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 5: Course Category & Classroom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {language === 'zh' ? '课程属性' : 'Course Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-academic-600/20 focus:border-academic-700 outline-none cursor-pointer"
              >
                <option value="required">{language === 'zh' ? '必修课' : 'Major Required'}</option>
                <option value="elective">{language === 'zh' ? '专业选修' : 'Major Elective'}</option>
                <option value="general">{language === 'zh' ? '通识选修' : 'General Education'}</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {language === 'zh' ? '上课教室' : 'Classroom Location'}
              </label>
              <input
                type="text"
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                placeholder={language === 'zh' ? '例如: 思源东楼302' : 'e.g. Siyuan East Building 302'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-academic-600/20 focus:border-academic-700 outline-none"
              />
            </div>
          </div>

          {/* Row 6: Timetable Days & Period Slot */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                {language === 'zh' ? '上课星期' : 'Class Days'}
              </label>
              <div className="flex items-center gap-2">
                {[
                  { day: 1, label: language === 'zh' ? '周一' : 'Mon' },
                  { day: 2, label: language === 'zh' ? '周二' : 'Tue' },
                  { day: 3, label: language === 'zh' ? '周三' : 'Wed' },
                  { day: 4, label: language === 'zh' ? '周四' : 'Thu' },
                  { day: 5, label: language === 'zh' ? '周五' : 'Fri' },
                ].map((d) => {
                  const isSelected = selectedDays.includes(d.day);
                  return (
                    <button
                      type="button"
                      key={d.day}
                      onClick={() => toggleDay(d.day)}
                      className={cn(
                        'flex-1 py-2 px-1 text-xs font-semibold rounded-xl border transition-all cursor-pointer text-center',
                        isSelected
                          ? 'bg-academic-700 text-white border-academic-800 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      )}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {language === 'zh' ? '上课节次' : 'Class Period Slot'}
              </label>
              <select
                value={periodSlot}
                onChange={(e) => setPeriodSlot(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-academic-600/20 focus:border-academic-700 outline-none cursor-pointer"
              >
                <option value={1}>
                  {language === 'zh' ? '第 1-2 节 (08:00 - 09:35 上午)' : 'Period 1-2 (08:00 - 09:35 Morning)'}
                </option>
                <option value={2}>
                  {language === 'zh' ? '第 3-4 节 (10:00 - 11:35 上午)' : 'Period 3-4 (10:00 - 11:35 Morning)'}
                </option>
                <option value={3}>
                  {language === 'zh' ? '第 5-6 节 (14:00 - 15:35 下午)' : 'Period 5-6 (14:00 - 15:35 Afternoon)'}
                </option>
                <option value={4}>
                  {language === 'zh' ? '第 7-8 节 (16:00 - 17:35 下午)' : 'Period 7-8 (16:00 - 17:35 Late Afternoon)'}
                </option>
                <option value={5}>
                  {language === 'zh' ? '第 9-10 节 (19:00 - 20:35 晚间)' : 'Period 9-10 (19:00 - 20:35 Evening)'}
                </option>
              </select>
            </div>
          </div>

          {/* Row 7: Auto-enroll checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="autoEnrollCheckbox"
              checked={autoEnroll}
              onChange={(e) => setAutoEnroll(e.target.checked)}
              className="w-4 h-4 rounded text-academic-700 focus:ring-academic-600/20 cursor-pointer"
            />
            <label
              htmlFor="autoEnrollCheckbox"
              className="text-xs font-medium text-slate-700 cursor-pointer select-none"
            >
              {language === 'zh' ? '直接加入我的已选课程' : 'Directly enroll in this course immediately'}
            </label>
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
            >
              {t('action.cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-academic-700 hover:bg-academic-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'zh' ? '保存并选课' : 'Save & Add Course'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
