'use client';

import React from 'react';
import { cn } from '../../lib/utils';
import { TeacherStatus } from '../../types/portal';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: TeacherStatus;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  status,
  className,
}) => {
  const [hasError, setHasError] = React.useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base font-semibold',
    xl: 'w-20 h-20 text-xl font-bold',
  }[size];

  const statusSize = {
    xs: 'w-2 h-2 border',
    sm: 'w-2.5 h-2.5 border',
    md: 'w-3 h-3 border-2',
    lg: 'w-4 h-4 border-2',
    xl: 'w-5 h-5 border-2',
  }[size];

  const statusColor = {
    available: 'bg-emerald-500',
    office_hours: 'bg-blue-500',
    in_meeting: 'bg-amber-500',
    offline: 'bg-slate-400',
  }[status || 'offline'];

  const getInitials = (str: string) => {
    if (!str) return 'U';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  return (
    <div className={cn('relative inline-flex flex-shrink-0', className)}>
      <div
        className={cn(
          'rounded-full overflow-hidden flex items-center justify-center bg-slate-200 text-slate-700 select-none shadow-sm border border-slate-200/80',
          sizeClasses
        )}
      >
        {src && !hasError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={name}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>

      {status && (
        <span
          title={`Status: ${status}`}
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-white shadow-sm ring-1 ring-black/5',
            statusSize,
            statusColor
          )}
        />
      )}
    </div>
  );
};
