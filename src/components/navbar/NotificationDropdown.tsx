'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Trash2, MessageSquare, Calendar, Clock, ExternalLink } from 'lucide-react';
import { PortalNotification } from '../../types/portal';
import {
  getStoredNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
} from '../../lib/storage';
import { subscribeToPortalEvents } from '../../lib/realtime';
import { useLanguage } from '../../context/LanguageContext';
import { formatTimestamp, cn } from '../../lib/utils';
import { Avatar } from '../common/Avatar';

interface NotificationDropdownProps {
  userId: string;
  onNavigateToConversation?: (conversationId: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  userId,
  onNavigateToConversation,
}) => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [browserPerm, setBrowserPerm] = useState<NotificationPermission>('default');
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const loadNotifications = () => {
    if (!userId) return;
    const items = getStoredNotifications(userId);
    setNotifications(items);
  };

  useEffect(() => {
    loadNotifications();

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPerm(Notification.permission);
    }

    const unsubscribe = subscribeToPortalEvents((ev) => {
      if (
        ev.type === 'NOTIFICATION_RECEIVED' ||
        ev.type === 'NEW_MESSAGE' ||
        ev.type === 'BOOKING_STATUS_CHANGED' ||
        ev.type === 'DATA_RESET'
      ) {
        loadNotifications();
      }
    });

    return () => unsubscribe();
  }, [userId]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleToggle = () => {
    setIsOpen(!isOpen);
    loadNotifications();
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead(userId);
    loadNotifications();
  };

  const handleClearAll = () => {
    clearNotifications(userId);
    loadNotifications();
  };

  const handleClickItem = (item: PortalNotification) => {
    markNotificationRead(item.id);
    loadNotifications();
    if (item.linkConversationId && onNavigateToConversation) {
      onNavigateToConversation(item.linkConversationId);
      setIsOpen(false);
    }
  };

  const handleRequestBrowserPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setBrowserPerm(perm);
      } catch (e) {
        console.warn('Notification permission error:', e);
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        title={language === 'zh' ? '通知中心' : 'Notifications'}
        className={cn(
          'relative p-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer',
          isOpen
            ? 'bg-slate-100 border-slate-300 text-slate-900'
            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
        )}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs animate-pulse ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[480px]">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-800">
                {language === 'zh' ? '系统通知' : 'Notifications'}
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-academic-700 text-white text-[10px] font-bold">
                  {unreadCount} {language === 'zh' ? '未读' : 'new'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  title={language === 'zh' ? '全部标为已读' : 'Mark all as read'}
                  className="p-1 text-slate-400 hover:text-academic-700 hover:bg-white rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium hidden sm:inline">
                    {language === 'zh' ? '已读' : 'Read'}
                  </span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  title={language === 'zh' ? '清空通知' : 'Clear all'}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors cursor-pointer text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Browser Push Permission Banner if not enabled */}
          {browserPerm !== 'granted' && typeof window !== 'undefined' && 'Notification' in window && (
            <div className="px-3.5 py-2 bg-emerald-50/80 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-800">
              <span className="text-[11px]">
                {language === 'zh' ? '开启桌面弹窗即时通知？' : 'Enable desktop push alerts?'}
              </span>
              <button
                type="button"
                onClick={handleRequestBrowserPermission}
                className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
              >
                {language === 'zh' ? '开启' : 'Enable'}
              </button>
            </div>
          )}

          {/* Notification Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleClickItem(item)}
                className={cn(
                  'p-3 flex items-start gap-3 transition-colors cursor-pointer text-left relative',
                  item.read ? 'bg-white hover:bg-slate-50' : 'bg-emerald-50/30 hover:bg-emerald-50/60'
                )}
              >
                {item.senderAvatar ? (
                  <Avatar src={item.senderAvatar} name={item.senderName || item.title} size="sm" />
                ) : (
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                      item.type === 'booking'
                        ? 'bg-blue-100 text-blue-600'
                        : item.type === 'office_hours'
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-emerald-100 text-academic-700'
                    )}
                  >
                    {item.type === 'booking' ? (
                      <Calendar className="w-4 h-4" />
                    ) : item.type === 'office_hours' ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <MessageSquare className="w-4 h-4" />
                    )}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="font-semibold text-xs text-slate-800 truncate">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {formatTimestamp(item.timestamp)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed break-words">
                    {item.content}
                  </p>

                  {item.linkConversationId && (
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-academic-700 font-semibold">
                      <span>{language === 'zh' ? '前往咨询对话' : 'View conversation'}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>

                {!item.read && (
                  <div className="w-2 h-2 rounded-full bg-academic-700 shrink-0 mt-1.5 ring-2 ring-white" />
                )}
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="py-12 px-4 text-center text-xs text-slate-400 space-y-2">
                <Bell className="w-7 h-7 text-slate-300 mx-auto" />
                <p>{language === 'zh' ? '暂无新的系统与咨询通知' : 'No notifications yet'}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
