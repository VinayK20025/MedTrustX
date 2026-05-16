/**
 * MedTrustX — Notification Store (Zustand)
 * Global toast/notification system backed by Zustand.
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { TOAST_DURATION } from '@/utils/constants';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration: number;
  dismissible: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: number;
}

interface NotificationStore {
  notifications: Notification[];
  add: (notification: Omit<Notification, 'id' | 'timestamp'>) => string;
  remove: (id: string) => void;
  clear: () => void;
}

let notifIdCounter = 0;

export const useNotificationStore = create<NotificationStore>()(
  devtools(
    (set) => ({
      notifications: [],

      add: (notification) => {
        const id = `notif_${++notifIdCounter}_${Date.now()}`;
        const entry: Notification = {
          ...notification,
          id,
          timestamp: Date.now(),
        };
        set(
          (state) => ({ notifications: [...state.notifications, entry] }),
          false,
          'notification/add',
        );

        // Auto-dismiss
        if (notification.duration > 0) {
          setTimeout(() => {
            set(
              (state) => ({
                notifications: state.notifications.filter((n) => n.id !== id),
              }),
              false,
              'notification/auto-remove',
            );
          }, notification.duration);
        }

        return id;
      },

      remove: (id) =>
        set(
          (state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }),
          false,
          'notification/remove',
        ),

      clear: () => set({ notifications: [] }, false, 'notification/clear'),
    }),
    { name: 'NotificationStore' },
  ),
);

/* ── Convenience API ──────────────────────────────────── */
export const notify = {
  success: (title: string, message?: string) =>
    useNotificationStore.getState().add({
      type: 'success',
      title,
      message,
      duration: TOAST_DURATION.SUCCESS,
      dismissible: true,
    }),

  error: (title: string, message?: string) =>
    useNotificationStore.getState().add({
      type: 'error',
      title,
      message,
      duration: TOAST_DURATION.ERROR,
      dismissible: true,
    }),

  warning: (title: string, message?: string) =>
    useNotificationStore.getState().add({
      type: 'warning',
      title,
      message,
      duration: TOAST_DURATION.WARNING,
      dismissible: true,
    }),

  info: (title: string, message?: string) =>
    useNotificationStore.getState().add({
      type: 'info',
      title,
      message,
      duration: TOAST_DURATION.INFO,
      dismissible: true,
    }),
};
