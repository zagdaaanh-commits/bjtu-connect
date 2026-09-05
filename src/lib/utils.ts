import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TeacherStatus, InquiryTag, MessageStatus } from "../types/portal";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(timestamp: number): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  } else if (diffDays === 1) {
    return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`;
  } else if (diffDays < 7) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${days[date.getDay()]} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`;
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

export function getStatusDetails(status: TeacherStatus) {
  switch (status) {
    case 'available':
      return {
        label: 'Available for Quick Chat',
        shortLabel: 'Available',
        color: 'bg-emerald-500',
        textColor: 'text-emerald-700',
        bgLight: 'bg-emerald-50 border-emerald-200',
        dotClass: 'bg-emerald-500 animate-pulse',
      };
    case 'office_hours':
      return {
        label: 'In Office Hours (Drop-in)',
        shortLabel: 'Office Hours',
        color: 'bg-blue-500',
        textColor: 'text-blue-700',
        bgLight: 'bg-blue-50 border-blue-200',
        dotClass: 'bg-blue-500',
      };
    case 'in_meeting':
      return {
        label: 'In Class / Meeting',
        shortLabel: 'In Meeting',
        color: 'bg-amber-500',
        textColor: 'text-amber-700',
        bgLight: 'bg-amber-50 border-amber-200',
        dotClass: 'bg-amber-500',
      };
    case 'offline':
    default:
      return {
        label: 'Offline / Away',
        shortLabel: 'Offline',
        color: 'bg-slate-400',
        textColor: 'text-slate-600',
        bgLight: 'bg-slate-100 border-slate-200',
        dotClass: 'bg-slate-400',
      };
  }
}

export function getTagStyle(tag?: InquiryTag) {
  if (!tag) return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
  switch (tag) {
    case 'Assignment Question':
      return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
    case 'Office Hour Request':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'Grade Inquiry':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'Exam Review':
      return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
    case 'Research Guidance':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'Recommendation Letter':
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
  }
}
