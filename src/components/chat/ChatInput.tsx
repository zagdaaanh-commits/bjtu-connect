'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Calendar,
  X,
  FileText,
  Image as ImageIcon,
  Tag as TagIcon,
  Sparkles,
} from 'lucide-react';
import { InquiryTag, Attachment, Role, Message } from '../../types/portal';
import { broadcastEvent } from '../../lib/realtime';
import { cn } from '../../lib/utils';
import { Modal } from '../common/Modal';
import { useLanguage } from '../../context/LanguageContext';

const PRESET_FILES: Attachment[] = [
  {
    id: 'sim_pdf_1',
    name: 'CS201_Lab3_Optimization_Draft.pdf',
    size: '1.4 MB',
    type: 'pdf',
  },
  {
    id: 'sim_img_1',
    name: 'Tree_Rebalance_Benchmark_Chart.png',
    size: '620 KB',
    type: 'image',
    previewUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'sim_pdf_2',
    name: 'Academic_Transcript_Spring2026.pdf',
    size: '950 KB',
    type: 'pdf',
  },
];

interface ChatInputProps {
  conversationId: string;
  senderRole: Role;
  onSendMessage: (data: {
    content: string;
    tag?: InquiryTag;
    attachments?: Attachment[];
    bookingProposal?: Message['bookingProposal'];
  }) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  conversationId,
  senderRole,
  onSendMessage,
  disabled = false,
}) => {
  const { language, t } = useLanguage();
  const [content, setContent] = useState('');
  const [selectedTag, setSelectedTag] = useState<InquiryTag | undefined>(undefined);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Booking modal state
  const [bookingDate, setBookingDate] = useState(
    language === 'zh' ? '本周四 14:30 - 15:00' : 'This Thursday, 14:30 - 15:00'
  );
  const [bookingLocation, setBookingLocation] = useState(
    language === 'zh' ? '思源东楼 402B' : 'Siyuan East Building Room 402B'
  );
  const [bookingNotes, setBookingNotes] = useState(
    language === 'zh'
      ? '研讨动态规划算法优化与代码性能基准。'
      : 'Review dynamic programming recurrence & code benchmark.'
  );

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const templateTags: { tag: InquiryTag; label: string; icon: string }[] = [
    {
      tag: 'Assignment Question',
      label: language === 'zh' ? '作业答疑' : 'Assignment Question',
      icon: '📝',
    },
    {
      tag: 'Office Hour Request',
      label: language === 'zh' ? '预约答疑' : 'Office Hour Request',
      icon: '📅',
    },
    {
      tag: 'Grade Inquiry',
      label: language === 'zh' ? '成绩咨询' : 'Grade Inquiry',
      icon: '📊',
    },
    {
      tag: 'Exam Review',
      label: language === 'zh' ? '考前复习' : 'Exam Review',
      icon: '🔍',
    },
    {
      tag: 'Recommendation Letter',
      label: language === 'zh' ? '推荐信事宜' : 'Recommendation Letter',
      icon: '🎓',
    },
    {
      tag: 'Research Guidance',
      label: language === 'zh' ? '科研辅导' : 'Research Guidance',
      icon: '🔬',
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);

    // Broadcast typing event
    broadcastEvent({
      type: 'TYPING_STATUS',
      payload: { conversationId, isTyping: true },
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      broadcastEvent({
        type: 'TYPING_STATUS',
        payload: { conversationId, isTyping: false },
      });
    }, 1500);
  };

  const handleSend = () => {
    const trimmed = content.trim();
    if (!trimmed && attachments.length === 0) return;

    onSendMessage({
      content:
        trimmed ||
        (attachments.length > 0
          ? language === 'zh'
            ? `分享了 ${attachments.length} 个附件`
            : `Shared ${attachments.length} attachment(s)`
          : ''),
      tag: selectedTag,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    setContent('');
    setAttachments([]);
    setSelectedTag(undefined);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addSimulatedFile = (file: Attachment) => {
    if (!attachments.some((a) => a.name === file.name)) {
      setAttachments([...attachments, file]);
    }
    setShowFilePicker(false);
  };

  const handleNativeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isPdf = file.type.includes('pdf') || file.name.endsWith('.pdf');
      const isImg = file.type.includes('image');
      const newAtt: Attachment = {
        id: `att_${Date.now()}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: isPdf ? 'pdf' : isImg ? 'image' : 'doc',
        previewUrl: isImg ? URL.createObjectURL(file) : undefined,
      };
      setAttachments([...attachments, newAtt]);
    }
    setShowFilePicker(false);
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  const handleProposeBooking = () => {
    const inviteContent =
      language === 'zh'
        ? `我发起了一对一答疑预约邀请：\n📅 ${bookingDate}\n📍 ${bookingLocation}`
        : `I would like to propose a 1-on-1 consultation appointment:\n📅 ${bookingDate}\n📍 ${bookingLocation}`;

    onSendMessage({
      content: inviteContent,
      tag: 'Office Hour Request',
      bookingProposal: {
        date: bookingDate,
        time: language === 'zh' ? '预定答疑时段' : 'Scheduled Consultation',
        location: bookingLocation,
        status: 'pending',
        notes: bookingNotes,
      },
    });
    setShowBookingModal(false);
  };

  return (
    <div className="p-3 sm:p-4 bg-white border-t border-slate-200 w-full min-w-0">
      {/* Quick Template Tag Pills */}
      <div className="flex items-center gap-1.5 pb-2.5 overflow-x-auto no-scrollbar text-xs w-full min-w-0">
        <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
          <TagIcon className="w-3.5 h-3.5" />
          {language === 'zh' ? '咨询主题:' : 'Topic:'}
        </span>
        {templateTags.map((t) => {
          const isSelected = selectedTag === t.tag;
          return (
            <button
              key={t.tag}
              type="button"
              onClick={() => setSelectedTag(isSelected ? undefined : t.tag)}
              className={cn(
                'px-2.5 py-1 rounded-full border text-xs font-medium shrink-0 transition-all flex items-center gap-1 cursor-pointer',
                isSelected
                  ? 'bg-academic-700 text-white border-academic-800 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
              )}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {isSelected && <X className="w-3 h-3 ml-0.5" />}
            </button>
          );
        })}
      </div>

      {/* Attachment Badges before sending */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="inline-flex items-center gap-2 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs shadow-xs text-slate-700"
            >
              {att.type === 'image' ? (
                <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-rose-500" />
              )}
              <span className="font-medium max-w-[180px] truncate">{att.name}</span>
              <span className="text-slate-400 text-[10px]">({att.size})</span>
              <button
                type="button"
                onClick={() => removeAttachment(att.id)}
                className="p-0.5 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Input Box */}
      <div className="flex items-end gap-2 bg-slate-50 border border-slate-300 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-academic-600/30 focus-within:border-academic-700 transition-all shadow-inner">
        {/* Attachment & Action Buttons */}
        <div className="flex items-center gap-1 pb-1">
          <button
            type="button"
            onClick={() => setShowFilePicker(true)}
            title={language === 'zh' ? '上传学业文档或草稿' : 'Attach Document or Draft'}
            className="p-2 text-slate-500 hover:text-academic-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowBookingModal(true)}
            title={language === 'zh' ? '发起 1对1 答疑预约' : 'Propose Office Hour Consultation'}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={
            language === 'zh'
              ? '输入学业咨询消息... (按 Enter 发送，Shift+Enter 换行)'
              : 'Type your inquiry or message... (Enter to send, Shift+Enter for new line)'
          }
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-slate-800 placeholder-slate-400 max-h-32 py-1.5 leading-relaxed"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || (!content.trim() && attachments.length === 0)}
          className={cn(
            'p-2.5 rounded-xl flex items-center justify-center transition-all shadow-xs',
            content.trim() || attachments.length > 0
              ? 'bg-academic-700 hover:bg-academic-800 text-white cursor-pointer scale-100'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          )}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* File Picker Modal */}
      <Modal
        isOpen={showFilePicker}
        onClose={() => setShowFilePicker(false)}
        maxWidth="md"
        title={
          language === 'zh'
            ? '上传学业附件或作业草稿'
            : 'Attach Academic File or Assignment Draft'
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            {language === 'zh'
              ? '上传作业草稿、算法测试基准图表或选择预置样例:'
              : 'Upload assignment drafts, research code benchmarks, or choose from preset academic samples:'}
          </p>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              {language === 'zh' ? '常用学业样本' : 'Quick Academic Samples'}
            </div>
            {PRESET_FILES.map((f) => (
              <div
                key={f.id}
                onClick={() => addSimulatedFile(f)}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-academic-300 hover:bg-academic-50/50 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-academic-100 group-hover:text-academic-700">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-800 group-hover:text-academic-800">
                      {f.name}
                    </div>
                    <div className="text-xs text-slate-400">{f.size}</div>
                  </div>
                </div>
                <span className="text-xs text-academic-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  {language === 'zh' ? '+ 选择此文件' : '+ Select'}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              {language === 'zh' ? '或选择本地文件' : 'Or Choose Local File'}
            </label>
            <input
              type="file"
              onChange={handleNativeFileUpload}
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
            />
          </div>
        </div>
      </Modal>

      {/* Propose Booking Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        maxWidth="md"
        title={
          language === 'zh'
            ? '发起 1对1 答疑预约'
            : 'Propose Office Hour Consultation'
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            {language === 'zh'
              ? '发送交互式预约卡片，与对方确认答疑时段。'
              : 'Send an interactive appointment card to coordinate a 1-on-1 meeting slot.'}
          </p>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {language === 'zh' ? '答疑日期与时间段' : 'Date & Time Window'}
            </label>
            <input
              type="text"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
              placeholder={language === 'zh' ? '例如: 本周四 14:30 - 15:00' : 'e.g. This Thursday, 14:30 - 15:00'}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {language === 'zh' ? '答疑地点 / 教室' : 'Meeting Location / Room'}
            </label>
            <input
              type="text"
              value={bookingLocation}
              onChange={(e) => setBookingLocation(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
              placeholder={language === 'zh' ? '例如: 思源东楼 402B' : 'e.g. Information Building Room 402B'}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {language === 'zh' ? '咨询事项与准备' : 'Consultation Notes / Preparation'}
            </label>
            <textarea
              value={bookingNotes}
              onChange={(e) => setBookingNotes(e.target.value)}
              rows={2}
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
              placeholder={language === 'zh' ? '例如: 请携带笔记本电脑和期中大作业草稿' : 'e.g. Bring your laptop and midterm draft paper'}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setShowBookingModal(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              {language === 'zh' ? '取消' : 'Cancel'}
            </button>
            <button
              onClick={handleProposeBooking}
              className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {language === 'zh' ? '发送答疑预约' : 'Send Consultation Invite'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
