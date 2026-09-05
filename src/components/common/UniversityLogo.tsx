'use client';

import React from 'react';
import { cn } from '../../lib/utils';
import { AcademicRailEmblem } from './AcademicRailEmblem';

interface UniversityLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UniversityLogo: React.FC<UniversityLogoProps> = ({
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  }[size];

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center shrink-0 select-none rounded-full bg-white p-0.5 shadow-xs ring-1 ring-slate-200/80 overflow-hidden',
        sizeClasses,
        className
      )}
      title="北京交通大学 (Beijing Jiaotong University)"
    >
      <img
        src="/bjtu_emblem.png"
        alt="北京交通大学"
        className="w-full h-full object-contain rounded-full"
      />
    </div>
  );
};
