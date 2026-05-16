'use client';
import React from 'react';
import { SettingsSection } from './SettingsSection';
import { ToggleSwitch } from './ToggleSwitch';
import { Select } from '@/components/ui/Select';
import { Settings, Clock, Globe, LayoutDashboard, Stethoscope, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { isClinicalStaff, isAdmin } from '@/utils/permissions';
import type { UserPreferences } from '../types/user.types';

interface PreferencesSettingsProps {
  preferences: UserPreferences;
  onUpdate: (data: Partial<UserPreferences>) => void;
}

export function PreferencesSettings({ preferences, onUpdate }: PreferencesSettingsProps) {
  const { user } = useAuth();
  const isClinical = isClinicalStaff(user);
  const isExec = isAdmin(user);

  return (
    <div className="space-y-6">
      {/* General Preferences */}
      <SettingsSection title="General Preferences" icon={<Settings className="w-4 h-4" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          <Select
            label="Default Landing Page"
            options={[
              { label: 'Dashboard', value: '/dashboard' },
              { label: 'Patients', value: '/dashboard/patients' },
              { label: 'Appointments', value: '/dashboard/appointments' },
              { label: 'Analytics', value: '/dashboard/analytics' },
            ]}
            value={preferences.defaultLandingPage}
            onChange={(e) => onUpdate({ defaultLandingPage: e.target.value })}
          />
          <Select
            label="Time Format"
            options={[
              { label: '12-hour (1:30 PM)', value: '12h' },
              { label: '24-hour (13:30)', value: '24h' },
            ]}
            value={preferences.timeFormat}
            onChange={(e) => onUpdate({ timeFormat: e.target.value as '12h' | '24h' })}
          />
          <Select
            label="Date Format"
            options={[
              { label: 'DD/MM/YYYY', value: 'dd/MM/yyyy' },
              { label: 'MM/DD/YYYY', value: 'MM/dd/yyyy' },
              { label: 'YYYY-MM-DD', value: 'yyyy-MM-dd' },
            ]}
            value={preferences.dateFormat}
            onChange={(e) => onUpdate({ dateFormat: e.target.value as any })}
          />
          <Select
            label="Language"
            options={[
              { label: 'English', value: 'en' },
              { label: 'Hindi (हिन्दी)', value: 'hi' },
              { label: 'Tamil (தமிழ்)', value: 'ta' },
              { label: 'Telugu (తెలుగు)', value: 'te' },
              { label: 'Bengali (বাংলা)', value: 'bn' },
            ]}
            value={preferences.language}
            onChange={(e) => onUpdate({ language: e.target.value })}
          />
        </div>
      </SettingsSection>

      {/* Clinical-specific */}
      {isClinical && (
        <SettingsSection title="Clinical Preferences" icon={<Stethoscope className="w-4 h-4" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <Select
              label="Default Patient View"
              options={[
                { label: 'Card View', value: 'card' },
                { label: 'Table View', value: 'table' },
                { label: 'Timeline View', value: 'timeline' },
              ]}
              value={preferences.defaultPatientView ?? 'table'}
              onChange={(e) => onUpdate({ defaultPatientView: e.target.value as any })}
            />
            <Select
              label="Auto-Refresh Interval"
              options={[
                { label: 'Disabled', value: '0' },
                { label: '15 seconds', value: '15' },
                { label: '30 seconds', value: '30' },
                { label: '1 minute', value: '60' },
                { label: '5 minutes', value: '300' },
              ]}
              value={String(preferences.autoRefreshInterval ?? 30)}
              onChange={(e) => onUpdate({ autoRefreshInterval: parseInt(e.target.value) })}
            />
          </div>
        </SettingsSection>
      )}

      {/* Executive-specific */}
      {isExec && (
        <SettingsSection title="Executive Preferences" icon={<BarChart3 className="w-4 h-4" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <Select
              label="Dashboard Layout"
              options={[
                { label: 'Compact (More data)', value: 'compact' },
                { label: 'Expanded (More visuals)', value: 'expanded' },
              ]}
              value={preferences.dashboardLayout ?? 'expanded'}
              onChange={(e) => onUpdate({ dashboardLayout: e.target.value as any })}
            />
          </div>
        </SettingsSection>
      )}
    </div>
  );
}
