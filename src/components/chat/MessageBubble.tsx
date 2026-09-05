'use client';

import React from 'react';
import { Message, Role, Attachment } from '../../types/portal';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { OfficeHourBookingCard } from './OfficeHourBookingCard';
import { formatTimestamp, cn } from '../../lib/utils';
import { Check, CheckCheck, FileText, Image as ImageIcon, Download, ExternalLink } from 'lucide-react';

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
  const isMine = message.senderId === currentUserId;

  return (
    <div
      className={cn(
        'flex gap-3 my-3.5 max-w-[85%] sm:max-w-[75%]',
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

          {/* Status receipt for sender's messages */}
          {isMine && (
            <div className="flex items-center justify-end gap-1 mt-1 text-[11px] text-slate-400">
              {message.status === 'sent' && (
                <span title="Sent" className="flex items-center">
                  <Check className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] ml-0.5">Sent</span>
                </span>
              )}
              {message.status === 'delivered' && (
                <span title="Delivered" className="flex items-center">
                  <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] ml-0.5">Delivered</span>
                </span>
              )}
              {message.status === 'read' && (
                <span title="Read" className="flex items-center text-blue-400">
                  <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[10px] ml-0.5 font-medium">Read</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
