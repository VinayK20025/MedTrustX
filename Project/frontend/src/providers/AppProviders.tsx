'use client';
import React from 'react';
import { QueryProvider } from './QueryProvider';
import { AuthProvider } from './AuthProvider';
import { EventProvider } from './EventProvider';
import { ToastContainer } from '@/components/feedback/Toast';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { NotificationBridge } from '@/components/feedback/NotificationBridge';

/**
 * AppProviders — wraps the entire application.
 * Order matters: Query → Auth → Event → NotificationBridge → children
 *
 * The NotificationBridge listens for real-time backend events via WebSocket
 * and surfaces important ones as toast notifications.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <EventProvider>
            <NotificationBridge />
            {children}
            <ToastContainer />
          </EventProvider>
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}
