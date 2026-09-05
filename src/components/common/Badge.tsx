'use client';

import React from 'react';
import { cn } from '../../lib/utils';
import { InquiryTag } from '../../types/portal';
import { getTagStyle } from '../../lib/utils';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'tag' | 'course' | 'faculty' | 'outline';
  tag?: InquiryTag;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  tag,
  className,
  icon,
}) => {
  if (tag || variant === 'tag') {
    const style = getTagStyle(tag);
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border shadow-xs transition-all',
          style.bg,
          style.text,
          style.border,
          className
        )}
      >
        {icon}
        {children || tag}
      </span>
    );
  }

  if (variant === 'course') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-mono font-semibold border border-slate-200',
          className
        )}
      >
        {icon}
        {children}
      </span>
    );
  }

  if (variant === 'faculty') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-academic-50 text-academic-700 text-xs font-medium border border-academic-200',
          className
        )}
      >
        {icon}
        {children}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200',
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
};
