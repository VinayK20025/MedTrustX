'use client';

import React from 'react';
import { cn } from '@/utils/cn';
import { getInitials } from '@/utils/format';

export interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy' | 'away';
  className?: string;
}

const sizeMap = { xs: 'w-6 h-6 text-2xs', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-lg' };
const statusMap = { online: 'bg-success-light', offline: 'bg-gray-500', busy: 'bg-emergency-light', away: 'bg-warning-light' };

const gradients = ['from-teal-400 to-teal-600','from-blue-400 to-blue-600','from-purple-400 to-purple-600','from-pink-400 to-pink-600','from-amber-400 to-amber-600','from-emerald-400 to-emerald-600','from-cyan-400 to-cyan-600'];

function nameColor(n: string) { let h=0; for(let i=0;i<n.length;i++) h=n.charCodeAt(i)+((h<<5)-h); return gradients[Math.abs(h)%gradients.length]; }

export function Avatar({ name, src, size='md', status, className }: AvatarProps) {
  return (
    <div className={cn('relative inline-flex flex-shrink-0', className)}>
      {src ? (
        <img src={src} alt={name} className={cn('rounded-full object-cover ring-2 ring-white/10', sizeMap[size])} />
      ) : (
        <div className={cn('rounded-full flex items-center justify-center font-semibold text-white bg-gradient-to-br', sizeMap[size], nameColor(name))} aria-label={name}>
          {getInitials(name)}
        </div>
      )}
      {status && <span className={cn('absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-surface-dark', statusMap[status])} />}
    </div>
  );
}
