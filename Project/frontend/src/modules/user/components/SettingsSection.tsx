'use client';
import React from 'react';
import { cn } from '@/utils/cn';
import { Card, CardBody } from '@/components/ui/Card';

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function SettingsSection({ title, description, icon, action, children, className, noPadding }: SettingsSectionProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 flex-shrink-0">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>

      {/* Section Content */}
      <div className={cn(!noPadding && 'px-5 py-4')}>
        {children}
      </div>
    </Card>
  );
}

/** Simple settings row with label + value */
interface SettingsRowProps {
  label: string;
  value?: React.ReactNode;
  hint?: string;
  className?: string;
}

export function SettingsRow({ label, value, hint, className }: SettingsRowProps) {
  return (
    <div className={cn('flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0', className)}>
      <div>
        <p className="text-sm text-gray-300">{label}</p>
        {hint && <p className="text-xs text-gray-600 mt-0.5">{hint}</p>}
      </div>
      <div className="text-sm text-gray-400">{value ?? '—'}</div>
    </div>
  );
}
