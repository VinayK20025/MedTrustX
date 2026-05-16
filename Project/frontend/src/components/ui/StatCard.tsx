'use client';
import React from 'react';
import { cn } from '@/utils/cn';
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';

export interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
  iconGradient?: string;
  footer?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function StatCard({
  label, value, change, trend = 'neutral', icon: Icon, iconGradient = 'from-teal-500 to-teal-700',
  footer, className, onClick,
}: StatCardProps) {
  return (
    <div
      className={cn('glass-card-hover p-5', onClick && 'cursor-pointer', className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-2xs text-gray-500 uppercase tracking-wide font-medium">{label}</p>
          <p className="text-2xl font-bold mt-1.5 text-white">{value}</p>
          {change && (
            <div className="flex items-center gap-1 mt-1.5">
              {trend === 'up' && <TrendingUp className="w-3 h-3 text-success-light" />}
              {trend === 'down' && <TrendingDown className="w-3 h-3 text-emergency-light" />}
              <p className={cn(
                'text-xs font-medium',
                trend === 'up' ? 'text-success-light' : trend === 'down' ? 'text-emergency-light' : 'text-gray-400',
              )}>{change}</p>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn('p-2.5 rounded-xl bg-gradient-to-br shadow-lg flex-shrink-0', iconGradient)}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
      {footer && <div className="mt-3 pt-3 border-t border-white/[0.06]">{footer}</div>}
    </div>
  );
}
