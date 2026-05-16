'use client';
import React from 'react';
import { cn } from '@/utils/cn';

export interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode; count?: number; disabled?: boolean }[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'underline' | 'pills';
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, variant = 'underline', className }: TabsProps) {
  return (
    <div className={cn('flex gap-1', variant === 'underline' && 'border-b border-white/[0.06]', className)} role="tablist">
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active}
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              variant === 'underline' && [
                '-mb-px border-b-2',
                active ? 'border-teal-500 text-teal-400' : 'border-transparent text-gray-400 hover:text-white hover:border-white/20',
              ],
              variant === 'pills' && [
                'rounded-lg',
                active ? 'bg-teal-500/15 text-teal-400' : 'text-gray-400 hover:text-white hover:bg-white/5',
              ],
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn('text-2xs px-1.5 py-0.5 rounded-full', active ? 'bg-teal-500/20 text-teal-300' : 'bg-white/10 text-gray-500')}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
