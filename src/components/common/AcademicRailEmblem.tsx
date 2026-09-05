'use client';

import React from 'react';
import { cn } from '../../lib/utils';

interface AcademicRailEmblemProps {
  className?: string;
  size?: number;
}

export const AcademicRailEmblem: React.FC<AcademicRailEmblemProps> = ({
  className = 'w-10 h-10',
  size,
}) => {
  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full bg-white p-0.5 ring-1 ring-white/20 shadow-xs overflow-hidden shrink-0 select-none',
        className
      )}
      style={size ? { width: size, height: size } : undefined}
      title="北京交通大学 (Beijing Jiaotong University)"
      aria-label="北京交通大学校徽 (BJTU Official Emblem)"
    >
      <img
        src="/bjtu_emblem.png"
        alt="北京交通大学校徽"
        className="w-full h-full object-contain rounded-full"
      />
    </div>
  );
};

