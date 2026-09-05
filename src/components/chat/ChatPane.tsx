'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Conversation,
  Message,
  UserProfile,
  TeacherProfile,
  StudentProfile,
  Course,
  Attachment,
  InquiryTag,
} from '../../types/portal';
import { Avatar } from '../common/Avatar';
import { StatusIndicator } from '../common/StatusIndicator';
import { Badge } from '../common/Badge';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { AttachmentPreviewModal } from '../common/AttachmentPreviewModal';
import {
  sendPortalMessage,
  markConversationRead,
} from '../../lib/storage';
import { subscribeToPortalEvents } from '../../lib/realtime';
import { useLanguage } from '../../context/LanguageContext';
import { BookOpen, MapPin, Clock, ArrowLeft, MoreVertical, ShieldCheck } from 'lucide-react';

interface ChatPaneProps {
  conversation: Conversation;
  messages: Message[];
  currentUser: UserProfile;
  counterpart: TeacherProfile | StudentProfile;
  course?: Course;
  onBack?: () => void;
  onRefresh: () => void;
}

export const ChatPane: React.FC<ChatPaneProps> = ({
  conversation,
  messages,
  currentUser,
  counterpart,
  course,
  onBack,
  onRefresh,
}) => {
  const {
    language,
    formatTeacher,
    formatSchool,
    formatLocation,
    formatTitle,
    formatCourse,
    formatOfficeHours,
  } = useLanguage();

  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [isCounterpartTyping, setIsCounterpartTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const isCounterpartTeacher = counterpart.role === 'teacher';
  const teacherProfile = isCounterpartTeacher ? (counterpart as TeacherProfile) : null;
  const studentProfile = !isCounterpartTeacher ? (counterpart as StudentProfile) : null;

  const counterpartDisplayName = teacherProfile
    ? formatTeacher(teacherProfile)
    : language === 'zh'
    ? studentProfile?.chineseName || studentProfile?.fullName || '学生'
    : studentProfile?.fullName || 'Student';

  // Auto-scroll to bottom safely without scrolling ancestor layout containers
  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  useEffect(() => {
    scrollToBottom(false);
    // Mark as read when conversation is opened
    markConversationRead(conversation.id, currentUser.role);
  }, [conversation.id, currentUser.role]);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages.length]);

  // Listen to typing status and realtime events
  useEffect(() => {
    const unsubscribe = subscribeToPortalEvents((ev) => {
      if (
        ev.type === 'TYPING_STATUS' &&
        ev.payload?.conversationId === conversation.id
      ) {
        setIsCounterpartTyping(ev.payload.isTyping);
      }
      if (ev.type === 'NEW_MESSAGE' && ev.payload?.conversationId === conversation.id) {
        // Mark conversation as read if sender is counterpart
        if (ev.payload.senderId !== currentUser.id) {
          markConversationRead(conversation.id, currentUser.role);
        }
        onRefresh();
      }
    });
    return () => unsubscribe();
  }, [conversation.id, currentUser.id, currentUser.role, onRefresh]);

  const handleSendMessage = (data: {
    content: string;
    tag?: InquiryTag;
    attachments?: Attachment[];
    bookingProposal?: Message['bookingProposal'];
  }) => {
    sendPortalMessage({
      conversationId: conversation.id,
      senderId: currentUser.id,
      senderRole: currentUser.role,
      senderName:
        currentUser.role === 'teacher'
          ? formatTeacher(currentUser as any)
          : language === 'zh'
          ? (currentUser as StudentProfile).chineseName || currentUser.fullName
          : currentUser.fullName,
      senderAvatar: currentUser.avatar,
      content: data.content,
      tag: data.tag,
      attachments: data.attachments,
      bookingProposal: data.bookingProposal,
    });
    onRefresh();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white border-b border-slate-200 z-10 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="lg:hidden p-1.5 -ml-2 text-slate-500 hover:text-slate-800 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <Avatar
            src={counterpart.avatar}
            name={counterpartDisplayName}
            size="md"
            status={teacherProfile?.status}
          />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                {counterpartDisplayName}
              </h3>
              {teacherProfile && (
                <StatusIndicator
                  status={teacherProfile.status}
                  size="sm"
                  customMessage={teacherProfile.customStatusMessage}
                />
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 truncate mt-0.5">
              <span>
                {teacherProfile
                  ? `${formatTitle(teacherProfile.title)} • ${formatSchool(teacherProfile.faculty)}`
                  : `${studentProfile?.major} • ${studentProfile?.grade}`}
              </span>
              {teacherProfile?.officeLocation && (
                <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
                  • <MapPin className="w-3 h-3" /> {formatLocation(teacherProfile.officeLocation)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {course && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-700 border border-slate-200">
              <BookOpen className="w-3.5 h-3.5 text-academic-700" />
              <span>{course.code}</span>
              <span className="text-slate-400">|</span>
              <span className="truncate max-w-[120px]">{formatCourse(course)}</span>
            </div>
          )}
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            {language === 'zh' ? '直连咨询通道' : 'Direct Consultation'}
          </span>
        </div>
      </div>

      {/* Course context bar on mobile */}
      {course && (
        <div className="md:hidden px-4 py-1.5 bg-slate-100 border-b border-slate-200 text-xs text-slate-600 flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-academic-700 shrink-0" />
          <span className="font-semibold text-slate-800">{course.code}:</span>
          <span className="truncate">{formatCourse(course)}</span>
        </div>
      )}

      {/* Teacher office hours notice if in office hours or has custom message */}
      {teacherProfile && teacherProfile.customStatusMessage && (
        <div className="px-4 py-2 bg-blue-50/70 border-b border-blue-100 text-xs text-blue-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>
              <strong className="font-semibold">
                {language === 'zh' ? '教师通告:' : 'Notice:'}
              </strong>{' '}
              {teacherProfile.customStatusMessage}
            </span>
          </div>
          {teacherProfile.officeHours && (
            <span className="text-[11px] text-blue-600 hidden sm:inline">
              {language === 'zh' ? '官方答疑:' : 'Regular Hours:'}{' '}
              {formatOfficeHours(teacherProfile.officeHours)}
            </span>
          )}
        </div>
      )}

      {/* Message Feed Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-3"
      >
        {/* Welcome message bubble */}
        <div className="text-center my-4">
          <div className="inline-block px-3 py-1 rounded-full bg-slate-200/70 text-slate-600 text-xs font-medium">
            {language === 'zh' ? '师生学业咨询会话已建立' : 'Academic Consultation Session Started'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {language === 'zh'
              ? '本会话仅在任课教师与学生之间保密传输。'
              : 'Messages are private between faculty member and enrolled student.'}
          </p>
        </div>

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            currentUserId={currentUser.id}
            currentRole={currentUser.role}
            onPreviewAttachment={(att) => setPreviewAttachment(att)}
            onRefresh={onRefresh}
          />
        ))}

        {/* Counterpart Typing Indicator */}
        {isCounterpartTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-500 italic py-2 px-3 animate-pulse">
            <Avatar src={counterpart.avatar} name={counterpartDisplayName} size="xs" />
            <span>
              {counterpartDisplayName} {language === 'zh' ? '正在输入回复...' : 'is typing a response...'}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <ChatInput
        conversationId={conversation.id}
        senderRole={currentUser.role}
        onSendMessage={handleSendMessage}
      />

      {/* Document / File Preview Lightbox */}
      <AttachmentPreviewModal
        attachment={previewAttachment}
        onClose={() => setPreviewAttachment(null)}
      />
    </div>
  );
};
