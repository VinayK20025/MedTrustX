'use client';
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { ChevronDown } from 'lucide-react';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  divider?: boolean;
  disabled?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, items, align = 'right', className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={cn('relative inline-flex', className)}>
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger}
      </div>
      {open && (
        <div className={cn(
          'absolute top-full mt-1 min-w-[180px] bg-surface-light border border-white/10 rounded-xl shadow-glass py-1.5 z-dropdown animate-scale-in',
          align === 'right' ? 'right-0' : 'left-0',
        )}>
          {items.map((item) =>
            item.divider ? (
              <div key={item.id} className="border-t border-white/[0.06] my-1" />
            ) : (
              <button
                key={item.id}
                disabled={item.disabled}
                onClick={() => { item.onClick?.(); setOpen(false); }}
                className={cn(
                  'flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors text-left',
                  'disabled:opacity-40 disabled:cursor-not-allowed',
                  item.danger
                    ? 'text-emergency-light hover:bg-emergency/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/[0.04]',
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
