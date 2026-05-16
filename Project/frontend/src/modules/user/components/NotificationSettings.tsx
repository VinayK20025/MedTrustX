'use client';
import React from 'react';
import { SettingsSection } from './SettingsSection';
import { ToggleSwitch } from './ToggleSwitch';
import { Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { isClinicalStaff, isAdmin } from '@/utils/permissions';
import type { NotificationPreferences, NotificationCategory } from '../types/user.types';

/** All notification categories — filtered by role at render time */
const ALL_CATEGORIES: NotificationCategory[] = [
  // Clinical
  { id: 'lab_results', label: 'Lab Results', description: 'Notifications when lab results are ready', defaultEnabled: true, roles: ['doctor','nurse','nurse_manager','lab_technician','department_head','chief_medical_officer'], group: 'clinical' },
  { id: 'medication_alerts', label: 'Medication Alerts', description: 'Drug interaction and allergy warnings', defaultEnabled: true, roles: ['doctor','nurse','pharmacist','nurse_manager'], group: 'clinical' },
  { id: 'icu_alerts', label: 'ICU Alerts', description: 'Critical ICU patient status changes', defaultEnabled: true, roles: ['doctor','nurse','icu_specialist','nurse_manager','department_head'], group: 'clinical' },
  { id: 'patient_admission', label: 'Patient Admission', description: 'New patient admissions and transfers', defaultEnabled: true, roles: ['doctor','nurse','receptionist','nurse_manager'], group: 'clinical' },
  { id: 'vital_anomaly', label: 'Vital Sign Anomalies', description: 'Abnormal vital sign readings from IoMT devices', defaultEnabled: true, roles: ['doctor','nurse','icu_specialist'], group: 'clinical' },
  { id: 'discharge_ready', label: 'Discharge Ready', description: 'Patients cleared for discharge', defaultEnabled: false, roles: ['doctor','nurse','billing_officer'], group: 'clinical' },
  // Administrative
  { id: 'billing_alerts', label: 'Billing Alerts', description: 'Payment due and billing updates', defaultEnabled: true, roles: ['billing_officer','insurance_officer','hospital_admin','tenant_admin'], group: 'administrative' },
  { id: 'inventory_alerts', label: 'Inventory Alerts', description: 'Low stock and expiry warnings', defaultEnabled: true, roles: ['pharmacist','hospital_admin','vendor_manager'], group: 'administrative' },
  { id: 'hr_notifications', label: 'HR Notifications', description: 'Leave approvals, shift changes', defaultEnabled: true, roles: ['hr_manager','hr_staff','hospital_admin'], group: 'administrative' },
  { id: 'system_alerts', label: 'System Alerts', description: 'Service health and maintenance notifications', defaultEnabled: true, roles: ['hospital_admin','tenant_admin','super_admin'], group: 'administrative' },
  // Executive
  { id: 'kpi_anomalies', label: 'KPI Anomalies', description: 'Key performance indicators outside thresholds', defaultEnabled: true, roles: ['chief_medical_officer','hospital_admin','tenant_admin','super_admin'], group: 'executive' },
  { id: 'compliance_alerts', label: 'Compliance Alerts', description: 'Regulatory compliance warnings', defaultEnabled: true, roles: ['compliance_officer','legal_counsel','hospital_admin','tenant_admin'], group: 'executive' },
  // System
  { id: 'security_alerts', label: 'Security Alerts', description: 'Suspicious login attempts and ZTA violations', defaultEnabled: true, roles: '*', group: 'system' },
  { id: 'session_alerts', label: 'Session Alerts', description: 'Login from new device or location', defaultEnabled: true, roles: '*', group: 'system' },
];

const GROUP_LABELS: Record<string, string> = {
  clinical: 'Clinical',
  administrative: 'Administrative',
  executive: 'Executive',
  system: 'System',
};

interface NotificationSettingsProps {
  preferences: NotificationPreferences;
  onUpdate: (data: Partial<NotificationPreferences>) => void;
  saving?: boolean;
}

export function NotificationSettings({ preferences, onUpdate, saving }: NotificationSettingsProps) {
  const { user } = useAuth();
  const userRoles = user?.roles ?? [];

  // Filter categories by user's roles
  const visibleCategories = ALL_CATEGORIES.filter((cat) =>
    cat.roles === '*' || cat.roles.some((r) => userRoles.includes(r as any)),
  );

  const groups = [...new Set(visibleCategories.map((c) => c.group))];

  const handleChannelToggle = (channel: 'inApp' | 'email' | 'sms', enabled: boolean) => {
    onUpdate({
      channels: { ...preferences.channels, [channel]: enabled },
    });
  };

  const handleCategoryToggle = (categoryId: string, enabled: boolean) => {
    onUpdate({
      categories: {
        ...preferences.categories,
        [categoryId]: {
          ...preferences.categories[categoryId],
          enabled,
          channels: preferences.categories[categoryId]?.channels ?? ['inApp'],
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Channels */}
      <SettingsSection
        title="Notification Channels"
        description="Choose how you receive notifications"
        icon={<Bell className="w-4 h-4" />}
      >
        <div className="divide-y divide-white/[0.04]">
          <ToggleSwitch
            label="In-App Notifications"
            description="Show notifications within the application"
            checked={preferences.channels.inApp}
            onChange={(v) => handleChannelToggle('inApp', v)}
          />
          <ToggleSwitch
            label="Email Notifications"
            description="Send notifications to your registered email"
            checked={preferences.channels.email}
            onChange={(v) => handleChannelToggle('email', v)}
          />
          <ToggleSwitch
            label="SMS Notifications"
            description="Send critical alerts via SMS"
            checked={preferences.channels.sms}
            onChange={(v) => handleChannelToggle('sms', v)}
          />
        </div>
      </SettingsSection>

      {/* Per-category toggles, grouped */}
      {groups.map((group) => (
        <SettingsSection
          key={group}
          title={`${GROUP_LABELS[group]} Notifications`}
          description={`Manage ${GROUP_LABELS[group].toLowerCase()} notification preferences`}
        >
          <div className="divide-y divide-white/[0.04]">
            {visibleCategories
              .filter((c) => c.group === group)
              .map((cat) => (
                <ToggleSwitch
                  key={cat.id}
                  label={cat.label}
                  description={cat.description}
                  checked={preferences.categories[cat.id]?.enabled ?? cat.defaultEnabled}
                  onChange={(v) => handleCategoryToggle(cat.id, v)}
                />
              ))}
          </div>
        </SettingsSection>
      ))}
    </div>
  );
}
