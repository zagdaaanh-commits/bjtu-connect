'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LanguageToggleProps {
  className?: string;
  variant?: 'light' | 'dark' | 'header';
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  className,
  variant = 'header',
}) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={cn(
        'inline-flex items-center p-0.5 rounded-xl border transition-all select-none',
        variant === 'header' && 'bg-slate-100/90 border-slate-200/90 shadow-2xs',
        variant === 'light' && 'bg-white/90 border-slate-200 shadow-2xs',
        variant === 'dark' && 'bg-white/10 border-white/20 text-white backdrop-blur-xs',
        className
      )}
      role="group"
      aria-label="Language selector"
    >
      <div className="flex items-center pl-2 pr-1 text-slate-400">
        <Globe className="w-3.5 h-3.5" />
      </div>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={cn(
          'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
          language === 'en'
            ? 'bg-academic-700 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
        )}
        title="Switch to Pure English"
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => setLanguage('zh')}
        className={cn(
          'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
          language === 'zh'
            ? 'bg-academic-700 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
        )}
        title="切换为全中文界面"
      >
        中文
      </button>
    </div>
  );
};
