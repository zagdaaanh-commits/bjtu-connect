'use client';

import React from 'react';
import { TeacherStatus } from '../../types/portal';
import { getStatusDetails, cn } from '../../lib/utils';

interface StatusIndicatorProps {
  status: TeacherStatus;
  customMessage?: string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  customMessage,
  size = 'md',
  showLabel = true,
  className,
}) => {
  const details = getStatusDetails(status);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium transition-colors',
        details.bgLight,
        details.textColor,
        size === 'sm' ? 'text-[11px] py-0 px-1.5' : '',
        className
      )}
      title={customMessage || details.label}
    >
      <span className={cn('rounded-full shrink-0', details.color, size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')} />
      {showLabel && (
        <span className="truncate max-w-[140px]">
          {details.shortLabel}
        </span>
      )}
    </div>
  );
};
