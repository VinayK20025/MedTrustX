'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, Settings, LogOut, User as UserIcon, Command, Shield } from 'lucide-react';
import { ROUTES } from '@/utils/constants';
import { cn } from '@/utils/cn';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/store/ui.store';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useConnectionState } from '@/hooks/useEvents';

export default function TopBar() {
  const { user, tenant, availableTenants, switchTenant, logout } = useAuth();
  const pageTitle = useUIStore((s) => s.pageTitle);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const setSidebarMobileOpen = useUIStore((s) => s.setSidebarMobileOpen);
  const toggleCommandPalette = useUIStore((s) => s.toggleCommandPalette);
  const connectionState = useConnectionState();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="h-16 border-b border-white/[0.06] bg-surface-dark/80 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6 z-topbar flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button onClick={() => setSidebarMobileOpen(true)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 lg:hidden" aria-label="Open menu">
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-white hidden sm:block">{pageTitle}</h2>

        {/* Global search */}
        <button onClick={toggleCommandPalette} className="hidden sm:flex items-center gap-2 ml-4 px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-gray-500 hover:text-gray-300 hover:border-white/[0.14] transition-all w-64">
          <Search className="w-3.5 h-3.5" />
          <span className="flex-1 text-left">Search patients, services...</span>
          <kbd className="text-2xs px-1.5 py-0.5 rounded bg-white/[0.06] text-gray-600 font-mono">⌘K</kbd>
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Connection status */}
        <Badge variant={connectionState === 'connected' ? 'success' : connectionState === 'reconnecting' ? 'warning' : 'danger'} size="sm" dot pulse={connectionState !== 'connected'}>
          {connectionState === 'connected' ? 'Live' : connectionState === 'reconnecting' ? 'Reconnecting' : 'Offline'}
        </Badge>

        {/* Tenant selector */}
        {availableTenants.length > 1 && (
          <select value={tenant?.id ?? ''} onChange={(e) => switchTenant(e.target.value)}
            className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500/40 max-w-[160px]">
            {availableTenants.map((t) => <option key={t.id} value={t.id} className="bg-surface-dark">{t.name}</option>)}
          </select>
        )}

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors" aria-label="Notifications">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emergency rounded-full animate-pulse-slow" />
        </button>

        {/* Profile dropdown */}
        <div ref={profileRef} className="relative">
          <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <Avatar name={user?.fullName ?? 'User'} size="sm" status="online" />
            <span className="text-sm font-medium text-gray-300 hidden md:block max-w-[120px] truncate">{user?.fullName ?? 'User'}</span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 w-56 bg-surface-light border border-white/10 rounded-xl shadow-glass py-2 animate-scale-in">
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <p className="text-sm font-medium text-white">{user?.fullName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                <Badge variant="info" size="sm" className="mt-1.5">{user?.roles[0]?.replace(/_/g, ' ')}</Badge>
              </div>
              <a href={ROUTES.PROFILE} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors">
                <UserIcon className="w-4 h-4" /> My Profile
              </a>
              <a href={ROUTES.SETTINGS} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors">
                <Settings className="w-4 h-4" /> Settings
              </a>
              <a href={`${ROUTES.SETTINGS}/security`} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors">
                <Shield className="w-4 h-4" /> Security
              </a>
              <div className="border-t border-white/[0.06] mt-1 pt-1">
                <button onClick={logout} className="flex items-center gap-2 px-4 py-2.5 text-sm text-emergency-light hover:bg-white/[0.04] w-full text-left transition-colors">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
