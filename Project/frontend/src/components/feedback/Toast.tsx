'use client';
import React from 'react';
import { cn } from '@/utils/cn';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useNotificationStore, type Notification } from '@/store/notification.store';

const iconMap = { success: CheckCircle2, error: AlertCircle, warning: AlertTriangle, info: Info };
const colorMap = { success: 'border-success/30 bg-success/5', error: 'border-emergency/30 bg-emergency/5', warning: 'border-warning/30 bg-warning/5', info: 'border-blue-500/30 bg-blue-500/5' };
const iconColorMap = { success: 'text-success-light', error: 'text-emergency-light', warning: 'text-warning-light', info: 'text-blue-400' };

function ToastItem({ notification }: { notification: Notification }) {
  const remove = useNotificationStore((s) => s.remove);
  const Icon = iconMap[notification.type];
  return (
    <div className={cn('flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-glass animate-slide-up min-w-[320px] max-w-[420px]', colorMap[notification.type])}>
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', iconColorMap[notification.type])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{notification.title}</p>
        {notification.message && <p className="text-xs text-gray-400 mt-0.5">{notification.message}</p>}
        {notification.action && <button onClick={notification.action.onClick} className="text-xs text-teal-400 hover:underline mt-1">{notification.action.label}</button>}
      </div>
      {notification.dismissible && <button onClick={() => remove(notification.id)} className="text-gray-500 hover:text-white p-0.5" aria-label="Dismiss"><X className="w-3.5 h-3.5" /></button>}
    </div>
  );
}

export function ToastContainer() {
  const notifications = useNotificationStore((s) => s.notifications);
  if (notifications.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-toast flex flex-col gap-2 pointer-events-auto">
      {notifications.map((n) => <ToastItem key={n.id} notification={n} />)}
    </div>
  );
}
