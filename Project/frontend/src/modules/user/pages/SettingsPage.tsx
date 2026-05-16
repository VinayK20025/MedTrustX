'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Tabs } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Spinner';
import { PreferencesSettings } from '../components/PreferencesSettings';
import { NotificationSettings } from '../components/NotificationSettings';
import { AppearanceSettingsPanel, AccessibilitySettingsPanel } from '../components/AppearanceSettings';
import { useUserSettings, useUpdatePreferences, useUpdateNotifications, useUpdateAppearance, useUpdateAccessibility } from '../hooks/useUserSettings';
import { Settings, Bell, Palette, Accessibility } from 'lucide-react';

const settingsTabs = [
  { id: 'preferences', label: 'Preferences', icon: <Settings className="w-4 h-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
  { id: 'accessibility', label: 'Accessibility', icon: <Accessibility className="w-4 h-4" /> },
];

export function SettingsPage() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [activeTab, setActiveTab] = useState('preferences');
  const { data, isLoading } = useUserSettings();
  const updatePreferences = useUpdatePreferences();
  const updateNotifications = useUpdateNotifications();
  const updateAppearance = useUpdateAppearance();
  const updateAccessibility = useUpdateAccessibility();

  const settings = data?.data;

  useEffect(() => {
    setPageMeta('Settings', 'Configure your preferences and account settings');
  }, [setPageMeta]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!settings) {
    return <div className="text-center text-gray-400 py-20">Could not load settings</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumbs items={[{ label: 'Settings' }]} />

      <Tabs
        tabs={settingsTabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="pills"
      />

      <div className="max-w-3xl">
        {activeTab === 'preferences' && (
          <PreferencesSettings
            preferences={settings.preferences}
            onUpdate={(data) => updatePreferences.mutate(data)}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationSettings
            preferences={settings.notifications}
            onUpdate={(data) => updateNotifications.mutate(data)}
          />
        )}

        {activeTab === 'appearance' && (
          <AppearanceSettingsPanel
            settings={settings.appearance}
            onUpdate={(data) => updateAppearance.mutate(data)}
          />
        )}

        {activeTab === 'accessibility' && (
          <AccessibilitySettingsPanel
            settings={settings.accessibility}
            onUpdate={(data) => updateAccessibility.mutate(data)}
          />
        )}
      </div>
    </div>
  );
}
