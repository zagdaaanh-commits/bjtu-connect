'use client';

import React from 'react';
import { Calendar, Clock, MapPin, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Message, Role } from '../../types/portal';
import { cn } from '../../lib/utils';
import { updateBookingProposalStatus } from '../../lib/storage';
import { useLanguage } from '../../context/LanguageContext';

interface OfficeHourBookingCardProps {
  message: Message;
  currentRole: Role;
  onStatusChange?: () => void;
}

export const OfficeHourBookingCard: React.FC<OfficeHourBookingCardProps> = ({
  message,
  currentRole,
  onStatusChange,
}) => {
  const { language } = useLanguage();
  const proposal = message.bookingProposal;
  if (!proposal) return null;

  const isTeacherSender = message.senderRole === 'teacher';
  const canRespond =
    proposal.status === 'pending' &&
    ((isTeacherSender && currentRole === 'student') ||
      (!isTeacherSender && currentRole === 'teacher'));

  const handleAction = (status: 'accepted' | 'declined') => {
    updateBookingProposalStatus(message.conversationId, message.id, status);
    if (onStatusChange) onStatusChange();
  };

  return (
    <div className="mt-3 p-4 bg-white rounded-xl border border-blue-100 shadow-sm text-slate-800 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2 text-blue-800 font-semibold text-sm">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>
            {language === 'zh' ? '答疑咨询预约邀请' : 'Office Hour Consultation Invitation'}
          </span>
        </div>
        <div className="text-xs">
          {proposal.status === 'pending' && (
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {language === 'zh' ? '待确认' : 'Pending Confirmation'}
            </span>
          )}
          {proposal.status === 'accepted' && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {language === 'zh' ? '已确认' : 'Confirmed'}
            </span>
          )}
          {proposal.status === 'declined' && (
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-medium flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              {language === 'zh' ? '已谢绝' : 'Declined'}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            <strong className="text-slate-700">{proposal.date}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{proposal.location}</span>
        </div>
      </div>

      {proposal.notes && (
        <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
          <span className="text-slate-400 font-medium mr-1">
            {language === 'zh' ? '备注:' : 'Note:'}
          </span>
          {proposal.notes}
        </div>
      )}

      {canRespond && (
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
          <button
            onClick={() => handleAction('declined')}
            className="px-3 py-1.5 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-colors cursor-pointer"
          >
            {language === 'zh' ? '谢绝' : 'Decline'}
          </button>
          <button
            onClick={() => handleAction('accepted')}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {language === 'zh' ? '接受并加入日程' : 'Accept & Add to Calendar'}
          </button>
        </div>
      )}
    </div>
  );
};
