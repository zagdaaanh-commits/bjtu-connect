'use client';

import React, { useState } from 'react';
import { TeacherProfile, TeacherStatus } from '../../types/portal';
import { updateTeacherStatus } from '../../lib/storage';
import { useLanguage } from '../../context/LanguageContext';
import { cn } from '../../lib/utils';
import { Check, Edit2, Clock, Sparkles } from 'lucide-react';

interface TeacherStatusToggleProps {
  teacher: TeacherProfile;
  onRefresh: () => void;
}

export const TeacherStatusToggle: React.FC<TeacherStatusToggleProps> = ({
  teacher,
  onRefresh,
}) => {
  const { language, formatOfficeHours } = useLanguage();
  const [isEditingNotice, setIsEditingNotice] = useState(false);
  const [noticeText, setNoticeText] = useState(teacher.customStatusMessage || '');

  const statusOptions: {
    status: TeacherStatus;
    label: string;
    desc: string;
    color: string;
    ring: string;
  }[] = [
    {
      status: 'available',
      label: language === 'zh' ? '在线可答疑' : 'Available for Chat',
      desc: language === 'zh' ? '即时回复' : 'Instant replies & quick queries',
      color: 'bg-emerald-500',
      ring: 'border-emerald-300 ring-emerald-500/20 text-emerald-800 bg-emerald-50/70',
    },
    {
      status: 'office_hours',
      label: language === 'zh' ? '答疑时间中' : 'In Office Hours',
      desc: language === 'zh' ? '欢迎来访' : 'Welcomes in-person / online visits',
      color: 'bg-blue-500',
      ring: 'border-blue-300 ring-blue-500/20 text-blue-800 bg-blue-50/70',
    },
    {
      status: 'in_meeting',
      label: language === 'zh' ? '会议 / 上课中' : 'In Class / Meeting',
      desc: language === 'zh' ? '稍后回复' : 'Auto-notice displayed to students',
      color: 'bg-amber-500',
      ring: 'border-amber-300 ring-amber-500/20 text-amber-800 bg-amber-50/70',
    },
    {
      status: 'offline',
      label: language === 'zh' ? '离线 / 暂离' : 'Offline / Away',
      desc: language === 'zh' ? '收件箱排队' : 'Inquiries queued in inbox',
      color: 'bg-slate-400',
      ring: 'border-slate-300 ring-slate-400/20 text-slate-700 bg-slate-50',
    },
  ];

  const handleStatusChange = (newStatus: TeacherStatus) => {
    updateTeacherStatus(teacher.id, newStatus);
    onRefresh();
  };

  const handleSaveNotice = () => {
    updateTeacherStatus(teacher.id, teacher.status, noticeText.trim());
    setIsEditingNotice(false);
    onRefresh();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
      {/* Top row: Status pills */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-academic-700" />
            {language === 'zh' ? '实时答疑状态设置:' : 'Live Consultation Availability:'}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto">
          {statusOptions.map((opt) => {
            const isActive = teacher.status === opt.status;

            return (
              <button
                key={opt.status}
                type="button"
                onClick={() => handleStatusChange(opt.status)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left shadow-2xs',
                  isActive
                    ? `${opt.ring} ring-2`
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                )}
              >
                <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', opt.color, isActive ? 'animate-pulse' : '')} />
                <span className="truncate">{opt.label}</span>
                {isActive && <Check className="w-3.5 h-3.5 ml-auto text-current" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom row: Custom notice & Office hours reminder */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-500 shrink-0">
            {language === 'zh' ? '官方答疑时间:' : 'Official Hours:'}
          </span>
          <span className="font-semibold text-slate-700 shrink-0">
            {formatOfficeHours(teacher.officeHours)}
          </span>
          <span className="text-slate-300 hidden sm:inline">|</span>

          {isEditingNotice ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <input
                type="text"
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                placeholder={
                  language === 'zh'
                    ? '例如: 16:30前在思源东楼402B，欢迎随时来访'
                    : 'e.g. In room 402B until 16:30, feel free to drop in'
                }
                className="flex-1 px-2.5 py-1 text-xs border border-academic-300 rounded-lg outline-none focus:ring-1 focus:ring-academic-600"
              />
              <button
                onClick={handleSaveNotice}
                className="px-2.5 py-1 bg-academic-700 text-white rounded-lg text-xs font-medium hover:bg-academic-800 shrink-0"
              >
                {language === 'zh' ? '保存' : 'Save'}
              </button>
              <button
                onClick={() => setIsEditingNotice(false)}
                className="px-2 py-1 text-slate-400 hover:text-slate-600 text-xs shrink-0"
              >
                {language === 'zh' ? '取消' : 'Cancel'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-600 truncate flex-1 min-w-0">
              <span className="italic truncate">
                "{teacher.customStatusMessage || (language === 'zh' ? '暂无广播通告' : 'No active announcement')}"
              </span>
              <button
                onClick={() => setIsEditingNotice(true)}
                title={language === 'zh' ? '编辑通告' : 'Edit notice'}
                className="p-1 text-slate-400 hover:text-academic-700 rounded transition-colors shrink-0"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <div className="text-[11px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
          {language === 'zh' ? '实时同步至全校学生端' : 'Syncs immediately to all students'}
        </div>
      </div>
    </div>
  );
};
