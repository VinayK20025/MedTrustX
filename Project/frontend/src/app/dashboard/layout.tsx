'use client';
import React from 'react';
import { AppProviders } from '@/providers/AppProviders';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { AuthGuard } from '@/components/guards/AuthGuard';

/**
 * Dashboard Layout — wraps all authenticated pages.
 * AuthGuard enforces login before any dashboard page is accessible.
 * Provides: AppProviders → AuthGuard → Sidebar + TopBar + CommandPalette + Content area
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      <AuthGuard>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <TopBar />
            <main className="flex-1 overflow-y-auto p-4 lg:p-6">
              {children}
            </main>
          </div>
        </div>
        <CommandPalette />
      </AuthGuard>
    </AppProviders>
  );
}
