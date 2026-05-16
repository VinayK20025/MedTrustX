'use client';
import React from 'react';
import { z } from 'zod';
import { Form, FormInput, FormSelect, FormTextarea } from '@/components/forms/Form';
import { Button } from '@/components/ui/Button';
import { SettingsSection } from './SettingsSection';
import { AvatarUpload } from './AvatarUpload';
import { useAuth } from '@/hooks/useAuth';
import { isClinicalStaff, isAdmin } from '@/utils/permissions';
import { User, Stethoscope, Building2, Globe } from 'lucide-react';
import type { UserProfile, UpdateProfilePayload } from '../types/user.types';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().regex(/^(\+\d{1,3})?\d{10,12}$/, 'Invalid phone number').optional().or(z.literal('')),
  department: z.string().optional(),
  designation: z.string().optional(),
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),
  organizationScope: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  profile: UserProfile;
  onSubmit: (data: UpdateProfilePayload) => void;
  onCancel: () => void;
  onAvatarUpload: (file: File) => void;
  onAvatarRemove: () => void;
  saving?: boolean;
  uploadingAvatar?: boolean;
}

export function ProfileForm({ profile, onSubmit, onCancel, onAvatarUpload, onAvatarRemove, saving, uploadingAvatar }: ProfileFormProps) {
  const { user } = useAuth();
  const isClinical = isClinicalStaff(user);
  const isAdminUser = isAdmin(user);

  const defaultValues: ProfileFormData = {
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone ?? '',
    department: profile.department ?? '',
    designation: profile.designation ?? '',
    specialization: profile.specialization ?? '',
    licenseNumber: profile.licenseNumber ?? '',
    organizationScope: profile.organizationScope ?? '',
  };

  const departmentOptions = [
    { label: 'General Medicine', value: 'general_medicine' },
    { label: 'Cardiology', value: 'cardiology' },
    { label: 'Neurology', value: 'neurology' },
    { label: 'Orthopedics', value: 'orthopedics' },
    { label: 'Pediatrics', value: 'pediatrics' },
    { label: 'Oncology', value: 'oncology' },
    { label: 'Surgery', value: 'surgery' },
    { label: 'Emergency', value: 'emergency' },
    { label: 'ICU', value: 'icu' },
    { label: 'Radiology', value: 'radiology' },
    { label: 'Pathology', value: 'pathology' },
    { label: 'Pharmacy', value: 'pharmacy' },
    { label: 'Administration', value: 'administration' },
    { label: 'IT', value: 'it' },
    { label: 'HR', value: 'hr' },
    { label: 'Finance', value: 'finance' },
  ];

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <SettingsSection title="Profile Photo" icon={<User className="w-4 h-4" />}>
        <div className="flex justify-center py-2">
          <AvatarUpload
            name={profile.fullName}
            currentUrl={profile.avatar}
            onUpload={onAvatarUpload}
            onRemove={onAvatarRemove}
            uploading={uploadingAvatar}
          />
        </div>
      </SettingsSection>

      {/* Basic Info */}
      <Form<ProfileFormData> schema={profileSchema} defaultValues={defaultValues} onSubmit={onSubmit}>
        {(methods) => (
          <>
            <SettingsSection title="Basic Information" icon={<User className="w-4 h-4" />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput name="firstName" label="First Name" required />
                <FormInput name="lastName" label="Last Name" required />
                <FormInput name="phone" label="Phone Number" placeholder="+91 98765-43210" />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-300">Email</label>
                  <div className="px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg text-gray-500 text-sm cursor-not-allowed">
                    {profile.email}
                  </div>
                  <p className="text-xs text-gray-600">Email is managed by your organization</p>
                </div>
              </div>
            </SettingsSection>

            {/* Professional Info — Clinical */}
            {isClinical && (
              <SettingsSection title="Clinical Information" icon={<Stethoscope className="w-4 h-4" />}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput name="specialization" label="Specialization" placeholder="e.g. Interventional Cardiology" />
                  <FormInput name="licenseNumber" label="License Number" placeholder="e.g. MCI-12345" />
                  <FormSelect name="department" label="Department" options={departmentOptions} placeholder="Select department" />
                  <FormInput name="designation" label="Designation" placeholder="e.g. Senior Consultant" />
                </div>
              </SettingsSection>
            )}

            {/* Professional Info — Admin/Executive */}
            {isAdminUser && (
              <SettingsSection title="Organizational Context" icon={<Building2 className="w-4 h-4" />}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormSelect name="department" label="Department" options={departmentOptions} placeholder="Select department" />
                  <FormInput name="designation" label="Designation" placeholder="e.g. Hospital Administrator" />
                  <FormInput name="organizationScope" label="Organization Scope" placeholder="e.g. Multi-campus" className="sm:col-span-2" />
                </div>
              </SettingsSection>
            )}

            {/* Non-clinical, non-admin */}
            {!isClinical && !isAdminUser && (
              <SettingsSection title="Professional Information" icon={<Building2 className="w-4 h-4" />}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormSelect name="department" label="Department" options={departmentOptions} placeholder="Select department" />
                  <FormInput name="designation" label="Designation" />
                </div>
              </SettingsSection>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" size="md" onClick={onCancel} type="button">Cancel</Button>
              <Button variant="primary" size="md" type="submit" loading={saving}>Save Changes</Button>
            </div>
          </>
        )}
      </Form>
    </div>
  );
}
