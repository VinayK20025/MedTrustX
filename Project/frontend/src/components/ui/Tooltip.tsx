'use client';
import React, { useState, useRef } from 'react';
import { cn } from '@/utils/cn';

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

const positionStyles = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

export function Tooltip({ content, children, side = 'top', delay = 200, className }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const show = () => { timerRef.current = setTimeout(() => setVisible(true), delay); };
  const hide = () => { clearTimeout(timerRef.current); setVisible(false); };

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      {visible && (
        <div className={cn(
          'absolute z-tooltip px-2.5 py-1.5 text-xs font-medium text-white bg-surface-elevated border border-white/10 rounded-lg shadow-glass whitespace-nowrap animate-fade-in pointer-events-none',
          positionStyles[side],
          className,
        )} role="tooltip">
          {content}
        </div>
      )}
    </div>
  );
}
