'use client';

import React, { useState } from 'react';
import {
  TeacherProfile,
  StudentProfile,
  Course,
  Conversation,
  Message,
} from '../../types/portal';
import { TeacherStatusToggle } from './TeacherStatusToggle';
import { UnifiedInbox } from './UnifiedInbox';
import { StudentContextSidebar } from './StudentContextSidebar';
import { ChatPane } from '../chat/ChatPane';
import { markConversationRead } from '../../lib/storage';
import { useLanguage } from '../../context/LanguageContext';
import { MessageSquare, UserCheck, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TeacherWorkspaceProps {
  teacher: TeacherProfile;
  students: StudentProfile[];
  courses: Course[];
  conversations: Conversation[];
  messages: Message[];
  onRefresh: () => void;
}

export const TeacherWorkspace: React.FC<TeacherWorkspaceProps> = ({
  teacher,
  students,
  courses,
  conversations,
  messages,
  onRefresh,
}) => {
  const { language } = useLanguage();
  // Teacher's conversations
  const teacherConversations = conversations.filter((c) => c.teacherId === teacher.id);

  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    teacherConversations.length > 0 ? teacherConversations[0].id : null
  );
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const activeConversation = teacherConversations.find(
    (c) => c.id === activeConversationId
  );
  const activeStudent = activeConversation
    ? students.find((s) => s.id === activeConversation.studentId)
    : null;
  const activeCourse = activeConversation?.courseId
    ? courses.find((c) => c.id === activeConversation.courseId)
    : undefined;
  const activeMessages = activeConversation
    ? messages.filter((m) => m.conversationId === activeConversation.id)
    : [];

  const handleSelectConversation = (convId: string) => {
    setActiveConversationId(convId);
    markConversationRead(convId, 'teacher');
    onRefresh();
  };

  return (
    <div className="space-y-4">
      {/* Availability & Office Hours Control Banner */}
      <TeacherStatusToggle teacher={teacher} onRefresh={onRefresh} />

      {/* Main 3-Column Unified Dashboard */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[calc(100vh-175px)] min-h-[580px] max-h-[820px] flex">
        {/* Column 1: Unified Left Inbox */}
        <div
          className={cn(
            'w-full md:w-80 lg:w-92 shrink-0 flex flex-col',
            activeConversationId ? 'hidden md:flex' : 'flex'
          )}
        >
          <UnifiedInbox
            conversations={teacherConversations}
            students={students}
            courses={courses}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
          />
        </div>

        {/* Column 2: Active Chat Feed */}
        <div
          className={cn(
            'flex-1 min-w-0 flex flex-col h-full overflow-hidden',
            !activeConversationId ? 'hidden md:flex' : 'flex'
          )}
        >
          {activeConversation && activeStudent ? (
            <div className="relative flex-1 min-w-0 flex flex-col h-full overflow-hidden">
              {/* Mobile button to toggle student context sidebar */}
              <div className="xl:hidden bg-slate-100 px-4 py-1.5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span>
                  {language === 'zh' ? '学生咨询: ' : 'Inquiry from: '}
                  <strong>{language === 'zh' ? (activeStudent.chineseName || activeStudent.fullName) : activeStudent.fullName}</strong> ({activeStudent.major})
                </span>
                <button
                  onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                  className="text-academic-700 font-semibold flex items-center gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  {showMobileSidebar
                    ? (language === 'zh' ? '隐藏学生档案' : 'Hide Student Profile')
                    : (language === 'zh' ? '查看学生档案' : 'View Student Profile')}
                </button>
              </div>

              <ChatPane
                conversation={activeConversation}
                messages={activeMessages}
                currentUser={teacher}
                counterpart={activeStudent}
                course={activeCourse}
                onBack={() => setActiveConversationId(null)}
                onRefresh={onRefresh}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
              <div className="w-16 h-16 rounded-2xl bg-academic-100 flex items-center justify-center text-academic-700 mb-4">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">
                {language === 'zh' ? '请选择学生咨询会话' : 'Select a Student Consultation'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                {language === 'zh'
                  ? '从左侧收件箱中选择一条咨询，以查看学生的学业背景、所选课程及往来记录。'
                  : 'Choose an inquiry from the left inbox to review student academic background, course context, and exchange messages.'}
              </p>
            </div>
          )}
        </div>

        {/* Column 3: Dedicated Student Context Sidebar */}
        {activeConversation && activeStudent && (
          <div
            className={cn(
              'shrink-0',
              showMobileSidebar
                ? 'fixed inset-y-0 right-0 z-40 bg-white shadow-2xl flex md:relative md:shadow-none'
                : 'hidden xl:flex'
            )}
          >
            {showMobileSidebar && (
              <button
                onClick={() => setShowMobileSidebar(false)}
                className="xl:hidden absolute top-3 right-3 p-1.5 bg-slate-200 rounded-lg text-slate-700 text-xs z-50 font-bold"
              >
                {language === 'zh' ? '✕ 关闭' : '✕ Close'}
              </button>
            )}

            <StudentContextSidebar
              student={activeStudent}
              conversation={activeConversation}
              currentCourse={activeCourse}
              allCourses={courses}
              onRefresh={onRefresh}
            />
          </div>
        )}
      </div>
    </div>
  );
};
