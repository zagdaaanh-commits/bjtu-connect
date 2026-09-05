'use client';

import React, { useState } from 'react';
import { Conversation, StudentProfile, TeacherProfile, Course } from '../../types/portal';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { formatTimestamp, cn } from '../../lib/utils';
import { useLanguage } from '../../context/LanguageContext';
import { Search, Inbox, Star, MessageSquare } from 'lucide-react';

interface UnifiedInboxProps {
  conversations: Conversation[];
  students: StudentProfile[];
  courses: Course[];
  activeConversationId: string | null;
  onSelectConversation: (convId: string) => void;
}

export const UnifiedInbox: React.FC<UnifiedInboxProps> = ({
  conversations,
  students,
  courses,
  activeConversationId,
  onSelectConversation,
}) => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'unread' | 'starred'>('all');

  const filteredConversations = conversations
    .filter((c) => {
      const student = students.find((s) => s.id === c.studentId);
      // Filter tab
      if (filterMode === 'unread' && c.unreadCountTeacher === 0) return false;
      if (filterMode === 'starred' && !c.starredByTeacher) return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchName =
        student?.fullName.toLowerCase().includes(q) ||
        (student?.chineseName && student.chineseName.includes(q));
      const matchId = student?.studentId.includes(q);
      const matchMajor = student?.major.toLowerCase().includes(q);
      const matchMsg = c.lastMessage?.content.toLowerCase().includes(q);

      return matchName || matchId || matchMajor || matchMsg;
    })
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCountTeacher, 0);

  return (
    <div className="w-full md:w-80 lg:w-92 border-r border-slate-200 bg-white flex flex-col h-full">
      {/* Inbox Header */}
      <div className="p-3.5 border-b border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800">
              {language === 'zh' ? '学生咨询' : 'Student Inquiries'}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {conversations.length}
            </span>
          </div>

          {totalUnread > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-academic-700 text-white text-[10px] font-bold animate-pulse">
              {totalUnread} {language === 'zh' ? '未读' : 'Unread'}
            </span>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-medium">
          <button
            onClick={() => setFilterMode('all')}
            className={cn(
              'flex-1 py-1 rounded-lg text-center transition-all cursor-pointer',
              filterMode === 'all'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            {language === 'zh' ? '全部' : 'All'}
          </button>
          <button
            onClick={() => setFilterMode('unread')}
            className={cn(
              'flex-1 py-1 rounded-lg text-center transition-all flex items-center justify-center gap-1 cursor-pointer',
              filterMode === 'unread'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            <span>{language === 'zh' ? '未读' : 'Unread'}</span>
            {totalUnread > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-academic-700" />
            )}
          </button>
          <button
            onClick={() => setFilterMode('starred')}
            className={cn(
              'flex-1 py-1 rounded-lg text-center transition-all flex items-center justify-center gap-1 cursor-pointer',
              filterMode === 'starred'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            <Star className="w-3 h-3 text-amber-500" />
            <span>{language === 'zh' ? '特别关注' : 'Priority'}</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'zh'
                ? '搜索学生姓名、学号或消息...'
                : 'Search student, ID, or message...'
            }
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-academic-700 transition-all"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {filteredConversations.map((conv) => {
          const student = students.find((s) => s.id === conv.studentId);
          const isSelected = conv.id === activeConversationId;
          const course = courses.find((c) => c.id === conv.courseId);
          const studentName =
            language === 'zh'
              ? student?.chineseName || student?.fullName || '学生'
              : student?.fullName || 'Student';

          return (
            <div
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={cn(
                'p-3.5 flex items-start gap-3 cursor-pointer transition-colors text-left relative group',
                isSelected
                  ? 'bg-slate-50 border-l-4 border-l-academic-700 shadow-2xs'
                  : 'hover:bg-slate-50/70'
              )}
            >
              <Avatar
                src={student?.avatar}
                name={studentName}
                size="md"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                    {studentName}
                  </div>
                  {conv.lastMessage && (
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {formatTimestamp(conv.lastMessage.timestamp)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate mb-1">
                  <span>{student?.major}</span>
                  {course && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-slate-700 font-semibold">
                        {course.code}
                      </span>
                    </>
                  )}
                </div>

                {conv.lastMessage && (
                  <p className="text-xs text-slate-600 truncate leading-snug">
                    {conv.lastMessage.senderId !== student?.id && (
                      <span className="text-slate-400 font-normal">
                        {language === 'zh' ? '我: ' : 'You: '}
                      </span>
                    )}
                    {conv.lastMessage.content}
                  </p>
                )}

                {/* Tags & Badges */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    {conv.topicTag && (
                      <Badge tag={conv.topicTag} className="text-[10px] py-0 px-1.5" />
                    )}
                    {conv.starredByTeacher && (
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    )}
                  </div>

                  {conv.unreadCountTeacher > 0 && (
                    <span className="ml-auto px-1.5 py-0.2 rounded-full bg-academic-700 text-white text-[10px] font-bold">
                      {conv.unreadCountTeacher}
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
            <p>
              {language === 'zh'
                ? '未找到符合条件的学生咨询。'
                : 'No student inquiries match your filter.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
