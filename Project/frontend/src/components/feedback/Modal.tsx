'use client';
import React, { useEffect, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { X } from 'lucide-react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlay?: boolean;
  closeOnEsc?: boolean;
  children: React.ReactNode;
  className?: string;
}

const sizeMap = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-[90vw]' };

export function Modal({ open, onClose, size = 'md', closeOnOverlay = true, closeOnEsc = true, children, className }: ModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => { if (e.key === 'Escape' && closeOnEsc) onClose(); }, [onClose, closeOnEsc]);

  useEffect(() => {
    if (open) { document.addEventListener('keydown', handleKeyDown); document.body.style.overflow = 'hidden'; }
    return () => { document.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = ''; };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={closeOnOverlay ? onClose : undefined} />
      <div className={cn('relative w-full bg-surface-light border border-white/10 rounded-xl shadow-2xl animate-scale-in', sizeMap[size], className)}>
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ title, subtitle, onClose, className }: { title: string; subtitle?: string; onClose?: () => void; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between p-5 border-b border-white/[0.06]', className)}>
      <div><h2 className="text-lg font-semibold text-white">{title}</h2>{subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}</div>
      {onClose && <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors" aria-label="Close"><X className="w-4 h-4" /></button>}
    </div>
  );
}

export function ModalBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('p-5 overflow-y-auto max-h-[70vh]', className)}>{children}</div>;
}

export function ModalFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('flex items-center justify-end gap-2 p-5 border-t border-white/[0.06]', className)}>{children}</div>;
}
