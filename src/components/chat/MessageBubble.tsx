'use client';

import React from 'react';
import { Message, Role, Attachment } from '../../types/portal';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { OfficeHourBookingCard } from './OfficeHourBookingCard';
import { formatTimestamp, cn } from '../../lib/utils';
import { Check, CheckCheck, FileText, Image as ImageIcon, ExternalLink, Trash2 } from 'lucide-react';
import { deletePortalMessage } from '../../lib/storage';
import { useLanguage } from '../../context/LanguageContext';

interface MessageBubbleProps {
  message: Message;
  currentUserId: string;
  currentRole: Role;
  onPreviewAttachment?: (attachment: Attachment) => void;
  onRefresh?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  currentUserId,
  currentRole,
  onPreviewAttachment,
  onRefresh,
}) => {
  const { language } = useLanguage();
  const isMine = message.senderId === currentUserId;
  const isAdmin =
    currentRole === 'admin' ||
    (typeof window !== 'undefined' && localStorage.getItem('bjtu_admin_session') === 'true');
  const canDelete = isMine || isAdmin;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmText =
      language === 'zh'
        ? '确定撤回/删除此条咨询消息吗？双方界面将即时同步清除。'
        : 'Delete/recall this message for all participants?';
    if (window.confirm(confirmText)) {
      deletePortalMessage(message.conversationId, message.id, currentUserId);
      if (onRefresh) onRefresh();
    }
  };

  return (
    <div
      className={cn(
        'flex gap-3 my-3.5 max-w-[85%] sm:max-w-[75%] group/msg',
        isMine ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
    >
      <Avatar
        src={message.senderAvatar}
        name={message.senderName}
        size="sm"
        className="mt-1 shrink-0"
      />

      <div className={cn('flex flex-col', isMine ? 'items-end' : 'items-start')}>
        {/* Sender Name & Meta */}
        <div className="flex items-center gap-2 mb-1 px-1 text-xs text-slate-400">
          <span className="font-medium text-slate-600">{message.senderName}</span>
          <span>•</span>
          <span>{formatTimestamp(message.timestamp)}</span>
          {message.tag && (
            <Badge tag={message.tag} className="text-[10px] py-0 px-1.5 ml-1">
              {message.tag}
            </Badge>
          )}
        </div>

        {/* Bubble container */}
        <div
          className={cn(
            'relative rounded-2xl px-4 py-3 text-sm shadow-xs border transition-all',
            isMine
              ? 'bg-slate-900 text-white border-slate-800 rounded-tr-xs'
              : 'bg-white text-slate-800 border-slate-200/90 rounded-tl-xs'
          )}
        >
          {/* Main content */}
          <p className="whitespace-pre-wrap leading-relaxed break-words">{message.content}</p>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-3 space-y-2 pt-2 border-t border-slate-700/40 divide-y divide-slate-700/20">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  onClick={() => onPreviewAttachment && onPreviewAttachment(att)}
                  className={cn(
                    'flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all cursor-pointer group',
                    isMine
                      ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-100'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div
                      className={cn(
                        'p-2 rounded-lg',
                        att.type === 'pdf'
                          ? 'bg-rose-500/20 text-rose-400'
                          : att.type === 'image'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      )}
                    >
                      {att.type === 'image' ? (
                        <ImageIcon className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>
                    <div className="truncate text-left">
                      <div className="text-xs font-semibold truncate group-hover:underline">
                        {att.name}
                      </div>
                      <div className="text-[10px] opacity-70">{att.size}</div>
                    </div>
                  </div>

                  <div className="text-xs opacity-80 group-hover:opacity-100 shrink-0">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Office Hour Booking Proposal Card */}
          {message.bookingProposal && (
            <OfficeHourBookingCard
              message={message}
              currentRole={currentRole}
              onStatusChange={onRefresh}
            />
          )}

          {/* Status receipt & delete button */}
          <div className="flex items-center justify-end gap-1.5 mt-1 text-[11px] text-slate-400">
            {canDelete && (
              <button
                type="button"
                onClick={handleDelete}
                title={language === 'zh' ? '撤回 / 删除此条消息' : 'Delete/Recall Message'}
                className="opacity-0 group-hover/msg:opacity-100 p-0.5 text-slate-400 hover:text-rose-400 transition-opacity cursor-pointer mr-0.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            {isMine && (
              <>
                {message.status === 'sent' && (
                  <span
                    title={language === 'zh' ? '已发送至服务器' : 'Sent'}
                    className="flex items-center text-slate-400"
                  >
                    <Check className="w-3 h-3" />
                    <span className="text-[10px] ml-0.5">{language === 'zh' ? '已发送' : 'Sent'}</span>
                  </span>
                )}
                {message.status === 'delivered' && (
                  <span
                    title={language === 'zh' ? '已送达对方 (未读)' : 'Delivered (Unread)'}
                    className="flex items-center text-slate-400"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span className="text-[10px] ml-0.5">{language === 'zh' ? '未读' : 'Delivered'}</span>
                  </span>
                )}
                {message.status === 'read' && (
                  <span
                    title={language === 'zh' ? '对方已阅读' : 'Read by counterpart'}
                    className="flex items-center text-emerald-400 font-medium"
                  >
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] ml-0.5">{language === 'zh' ? '已读' : 'Read'}</span>
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
