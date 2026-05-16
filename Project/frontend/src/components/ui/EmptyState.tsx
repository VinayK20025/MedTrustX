'use client';
import React from 'react';
import { cn } from '@/utils/cn';
import { SearchX, FileX, ShieldOff, WifiOff, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  variant?: 'default' | 'search' | 'error' | 'permission' | 'offline';
  className?: string;
}

const presetIcons: Record<string, LucideIcon> = {
  default: FileX,
  search: SearchX,
  error: FileX,
  permission: ShieldOff,
  offline: WifiOff,
};

export function EmptyState({ icon, title, description, action, variant = 'default', className }: EmptyStateProps) {
  const Icon = icon ?? presetIcons[variant];
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] mb-5">
        <Icon className="w-10 h-10 text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-400 max-w-sm mb-5">{description}</p>}
      {action && (
        <Button variant="primary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
