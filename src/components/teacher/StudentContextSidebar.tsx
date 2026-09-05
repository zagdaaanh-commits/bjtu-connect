'use client';

import React, { useState, useEffect } from 'react';
import {
  StudentProfile,
  Conversation,
  Course,
} from '../../types/portal';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { updateTeacherNotes } from '../../lib/storage';
import { useLanguage } from '../../context/LanguageContext';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Mail,
  Phone,
  FileEdit,
  Check,
  Building,
  UserCheck,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface StudentContextSidebarProps {
  student: StudentProfile;
  conversation: Conversation;
  currentCourse?: Course;
  allCourses: Course[];
  onRefresh: () => void;
  onProposeMeeting?: () => void;
}

export const StudentContextSidebar: React.FC<StudentContextSidebarProps> = ({
  student,
  conversation,
  currentCourse,
  allCourses,
  onRefresh,
  onProposeMeeting,
}) => {
  const { language, formatSchool, formatCourse, formatOfficeHours } = useLanguage();
  const [notes, setNotes] = useState(conversation.teacherNotes || '');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setNotes(conversation.teacherNotes || '');
  }, [conversation.id, conversation.teacherNotes]);

  const handleSaveNotes = () => {
    updateTeacherNotes(conversation.id, notes);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    onRefresh();
  };

  const studentEnrolledCourses = allCourses.filter((c) =>
    student.enrolledCourseIds.includes(c.id)
  );

  const studentDisplayName =
    language === 'zh'
      ? student.chineseName || student.fullName
      : student.fullName;

  return (
    <div className="w-80 lg:w-88 border-l border-slate-200 bg-white flex flex-col h-full overflow-y-auto">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-academic-700" />
          {language === 'zh' ? '学生学业档案与选课背景' : 'Student Academic Context'}
        </div>
      </div>

      <div className="p-5 space-y-6 flex-1">
        {/* Profile Card */}
        <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100">
          <Avatar
            src={student.avatar}
            name={studentDisplayName}
            size="xl"
            className="mb-3 ring-4 ring-slate-100"
          />

          <h3 className="text-base font-bold text-slate-900">
            {studentDisplayName}
          </h3>

          <div className="text-xs text-slate-500 mt-0.5">
            {language === 'zh' ? '学号: ' : 'Student ID: '}
            <span className="font-mono font-semibold text-slate-700">{student.studentId}</span>
          </div>

          <div className="mt-2.5 flex flex-wrap justify-center gap-1.5">
            <Badge variant="faculty" className="text-[11px]">
              {formatSchool(student.faculty)}
            </Badge>
            {student.gpa && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                GPA: {student.gpa}
              </span>
            )}
          </div>
        </div>

        {/* Academic Details List */}
        <div className="space-y-3 text-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {language === 'zh' ? '学业信息' : 'Academic Information'}
          </div>

          <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">{language === 'zh' ? '专业:' : 'Major:'}</span>
              <span className="font-medium text-slate-800 text-right">{student.major}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">{language === 'zh' ? '年级:' : 'Grade / Year:'}</span>
              <span className="font-medium text-slate-800">{student.grade}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">{language === 'zh' ? '班级:' : 'Class Group:'}</span>
              <span className="font-mono font-medium text-slate-800">{student.classGroup}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">{language === 'zh' ? '邮箱:' : 'Email:'}</span>
              <a
                href={`mailto:${student.email}`}
                className="font-medium text-academic-700 hover:underline truncate max-w-[150px]"
              >
                {student.email}
              </a>
            </div>
            {student.phone && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{language === 'zh' ? '电话:' : 'Phone:'}</span>
                <span className="font-medium text-slate-800">{student.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Inquired Course Context */}
        <div className="space-y-2.5 text-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>{language === 'zh' ? '咨询关联课程' : 'Inquiry Course Context'}</span>
            {conversation.topicTag && (
              <Badge tag={conversation.topicTag} className="text-[10px] py-0 px-1.5" />
            )}
          </div>

          {currentCourse ? (
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-blue-900">{currentCourse.code}</span>
                <span className="text-[10px] bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded">
                  {currentCourse.credits} {language === 'zh' ? '学分' : 'Credits'}
                </span>
              </div>
              <div className="font-semibold text-slate-900">{formatCourse(currentCourse)}</div>
              <div className="text-[11px] text-slate-600 pt-1 border-t border-blue-100/60 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-blue-500" />
                <span>{formatOfficeHours(currentCourse.schedule)}</span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-center text-xs">
              {language === 'zh'
                ? '综合学业咨询 (未关联特定课程)'
                : 'General Academic Inquiry (No specific course tied)'}
            </div>
          )}
        </div>

        {/* Other Enrolled Courses of this student */}
        <div className="space-y-2 text-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {language === 'zh' ? '学生本学期完整课表' : "Student's Full Semester Schedule"}
          </div>
          <div className="space-y-1.5">
            {studentEnrolledCourses.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-[11px] border border-slate-100"
              >
                <div className="truncate">
                  <span className="font-mono font-semibold text-slate-700 mr-1.5">{c.code}</span>
                  <span className="text-slate-600 truncate">{formatCourse(c)}</span>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {c.credits} {language === 'zh' ? '分' : 'cr'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Private Teacher Notes Memo */}
        <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <FileEdit className="w-3 h-3 text-academic-700" />
              {language === 'zh' ? '教师私密备注 (自动保存)' : 'Private Faculty Notes (Auto-saved)'}
            </div>
            {isSaved && (
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                <Check className="w-3 h-3" /> {language === 'zh' ? '已保存' : 'Saved'}
              </span>
            )}
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleSaveNotes}
            placeholder={
              language === 'zh'
                ? '记录对该学生的咨询辅导要点、科研探讨建议或作业反馈...'
                : "Write private notes on this student's consultation progress, research interest, or homework advice..."
            }
            rows={3}
            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-academic-600/20 focus:border-academic-700 outline-none transition-all leading-relaxed"
          />
          <p className="text-[10px] text-slate-400">
            {language === 'zh'
              ? '仅您本人可见，点击输入框外部时自动保存。'
              : 'Visible only to you. Saves automatically when you click outside.'}
          </p>
        </div>
      </div>
    </div>
  );
};
