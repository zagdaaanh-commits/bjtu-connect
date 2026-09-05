'use client';

import React, { useState } from 'react';
import {
  StudentProfile,
  TeacherProfile,
  Course,
  Conversation,
  Message,
} from '../../types/portal';
import { FacultyDirectory } from './FacultyDirectory';
import { EnrolledCourses } from './EnrolledCourses';
import { ChatPane } from '../chat/ChatPane';
import { Avatar } from '../common/Avatar';
import { StatusIndicator } from '../common/StatusIndicator';
import { Badge } from '../common/Badge';
import { createOrGetConversation, markConversationRead } from '../../lib/storage';
import { formatTimestamp, cn } from '../../lib/utils';
import { useLanguage } from '../../context/LanguageContext';
import {
  Users,
  BookOpen,
  MessageSquare,
  Sparkles,
  Inbox,
  Search,
} from 'lucide-react';

interface StudentWorkspaceProps {
  student: StudentProfile;
  teachers: TeacherProfile[];
  courses: Course[];
  conversations: Conversation[];
  messages: Message[];
  onRefresh: () => void;
}

export const StudentWorkspace: React.FC<StudentWorkspaceProps> = ({
  student,
  teachers,
  courses,
  conversations,
  messages,
  onRefresh,
}) => {
  const { language, t, formatTeacher, formatSchool } = useLanguage();
  const [activeTab, setActiveTab] = useState<'directory' | 'courses' | 'chats'>('directory');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [chatSearch, setChatSearch] = useState('');

  // Student's relevant conversations
  const studentConversations = conversations
    .filter((c) => c.studentId === student.id)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const totalUnread = studentConversations.reduce((acc, c) => acc + c.unreadCountStudent, 0);

  // If a conversation is active, find its data
  const activeConversation = studentConversations.find((c) => c.id === selectedConversationId);
  const activeTeacher = activeConversation
    ? teachers.find((t) => t.id === activeConversation.teacherId)
    : null;
  const activeCourse = activeConversation?.courseId
    ? courses.find((c) => c.id === activeConversation.courseId)
    : undefined;
  const activeMessages = activeConversation
    ? messages.filter((m) => m.conversationId === activeConversation.id)
    : [];

  const handleStartChat = (teacherId: string, courseId?: string) => {
    const conv = createOrGetConversation(student.id, teacherId, courseId);
    setSelectedConversationId(conv.id);
    setActiveTab('chats');
    onRefresh();
  };

  const handleSelectConversation = (convId: string) => {
    setSelectedConversationId(convId);
    markConversationRead(convId, 'student');
    onRefresh();
  };

  const filteredConversations = studentConversations.filter((c) => {
    const teacher = teachers.find((t) => t.id === c.teacherId);
    if (!chatSearch) return true;
    const q = chatSearch.toLowerCase();
    return (
      teacher?.fullName.toLowerCase().includes(q) ||
      (teacher?.chineseName && teacher.chineseName.includes(q)) ||
      c.lastMessage?.content.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Workspace Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('directory')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0',
              activeTab === 'directory'
                ? 'bg-academic-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            <Users className="w-4 h-4" />
            <span>{t('tab.directory')}</span>
          </button>

          <button
            onClick={() => setActiveTab('courses')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0',
              activeTab === 'courses'
                ? 'bg-academic-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            <BookOpen className="w-4 h-4" />
            <span>{t('tab.courses')}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('chats');
              if (!selectedConversationId && studentConversations.length > 0) {
                setSelectedConversationId(studentConversations[0].id);
              }
            }}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 relative',
              activeTab === 'chats'
                ? 'bg-academic-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t('tab.chats')}</span>
            {totalUnread > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold animate-pulse">
                {totalUnread}
              </span>
            )}
          </button>
        </div>

        {/* Student Quick Bio Pill */}
        <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>
            {student.fullName} ({student.studentId}) • {student.major}
          </span>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'directory' && (
        <FacultyDirectory
          teachers={teachers}
          courses={courses}
          student={student}
          onStartChat={handleStartChat}
        />
      )}

      {activeTab === 'courses' && (
        <EnrolledCourses
          student={student}
          courses={courses}
          teachers={teachers}
          onStartChat={handleStartChat}
          onRefresh={onRefresh}
        />
      )}

      {activeTab === 'chats' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[calc(100vh-170px)] min-h-[580px] max-h-[820px] flex flex-col md:flex-row">
          {/* Conversation List Sidebar */}
          <div
            className={cn(
              'w-full md:w-80 lg:w-92 shrink-0 border-r border-slate-200 flex flex-col bg-slate-50/50 overflow-hidden',
              selectedConversationId ? 'hidden md:flex' : 'flex'
            )}
          >
            {/* Search Box */}
            <div className="p-3.5 border-b border-slate-200 bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                  placeholder={t('chat.search')}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-academic-700"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredConversations.map((conv) => {
                const teacher = teachers.find((t) => t.id === conv.teacherId);
                const isSelected = conv.id === selectedConversationId;

                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={cn(
                      'p-3.5 flex items-start gap-3 cursor-pointer transition-colors text-left relative',
                      isSelected
                        ? 'bg-white border-l-4 border-l-academic-700 shadow-xs'
                        : 'hover:bg-slate-100/70'
                    )}
                  >
                    <Avatar
                      src={teacher?.avatar}
                      name={teacher ? formatTeacher(teacher) : 'Prof'}
                      size="md"
                      status={teacher?.status}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                          {teacher ? formatTeacher(teacher) : 'Faculty'}
                        </div>
                        {conv.lastMessage && (
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {formatTimestamp(conv.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-500 truncate mb-1">
                        {teacher?.faculty ? formatSchool(teacher.faculty) : ''}
                      </div>

                      {conv.lastMessage && (
                        <p className="text-xs text-slate-600 truncate">
                          {conv.lastMessage.senderId === student.id && (
                            <span className="text-slate-400 font-normal">
                              {language === 'zh' ? '我: ' : 'You: '}
                            </span>
                          )}
                          {conv.lastMessage.content}
                        </p>
                      )}

                      {/* Topic Tag & Unread Badge */}
                      <div className="flex items-center justify-between mt-1.5">
                        {conv.topicTag && (
                          <Badge tag={conv.topicTag} className="text-[10px] py-0 px-1.5" />
                        )}
                        {conv.unreadCountStudent > 0 && (
                          <span className="ml-auto px-1.5 py-0.2 rounded-full bg-academic-700 text-white text-[10px] font-bold">
                            {conv.unreadCountStudent}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredConversations.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                  <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
                  <p>{t('chat.noMessages')}</p>
                  <button
                    onClick={() => setActiveTab('directory')}
                    className="text-academic-700 hover:underline font-semibold"
                  >
                    {language === 'zh' ? '浏览学院师资以发起咨询' : 'Browse Faculty Directory to start a chat'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Active Chat Pane */}
          <div
            className={cn(
              'flex-1 min-w-0 flex flex-col h-full overflow-hidden',
              !selectedConversationId ? 'hidden md:flex' : 'flex'
            )}
          >
            {activeConversation && activeTeacher ? (
              <ChatPane
                conversation={activeConversation}
                messages={activeMessages}
                currentUser={student}
                counterpart={activeTeacher}
                course={activeCourse}
                onBack={() => setSelectedConversationId(null)}
                onRefresh={onRefresh}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
                <div className="w-16 h-16 rounded-2xl bg-academic-100 flex items-center justify-center text-academic-700 mb-4">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-slate-800">
                  {language === 'zh' ? '选择咨询会话' : 'Select a Consultation Thread'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                  {language === 'zh'
                    ? '从左侧列表中选择一个会话，或从学院师资中向导师发起新的咨询。'
                    : 'Choose a conversation from the list or start a new inquiry with any faculty member from the directory.'}
                </p>
                <button
                  onClick={() => setActiveTab('directory')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-academic-700 hover:bg-academic-800 rounded-xl transition-all shadow-xs"
                >
                  {language === 'zh' ? '浏览教授与答疑时间' : 'Browse Professors & Office Hours'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
