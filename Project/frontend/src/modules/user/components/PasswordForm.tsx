'use client';
import React from 'react';
import { z } from 'zod';
import { Form, FormInput } from '@/components/forms/Form';
import { Button } from '@/components/ui/Button';
import { SettingsSection } from './SettingsSection';
import { Lock, Eye, EyeOff } from 'lucide-react';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

interface PasswordFormProps {
  onSubmit: (data: PasswordFormData) => void;
  saving?: boolean;
}

export function PasswordForm({ onSubmit, saving }: PasswordFormProps) {
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);

  return (
    <SettingsSection
      title="Change Password"
      description="Update your account password. You'll need to enter your current password."
      icon={<Lock className="w-4 h-4" />}
    >
      <Form<PasswordFormData>
        schema={passwordSchema}
        defaultValues={{ currentPassword: '', newPassword: '', confirmPassword: '' }}
        onSubmit={onSubmit}
        className="max-w-md space-y-4"
      >
        <FormInput
          name="currentPassword"
          label="Current Password"
          type={showCurrent ? 'text' : 'password'}
          autoComplete="current-password"
          rightIcon={
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="text-gray-500 hover:text-gray-300">
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />
        <FormInput
          name="newPassword"
          label="New Password"
          type={showNew ? 'text' : 'password'}
          autoComplete="new-password"
          hint="Min 8 chars, uppercase, lowercase, number, special character"
          rightIcon={
            <button type="button" onClick={() => setShowNew(!showNew)} className="text-gray-500 hover:text-gray-300">
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />
        <FormInput
          name="confirmPassword"
          label="Confirm New Password"
          type="password"
          autoComplete="new-password"
        />

        {/* Password requirements */}
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
          <p className="text-xs text-gray-500 font-medium mb-2">Password Requirements:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• At least 8 characters long</li>
            <li>• One uppercase letter (A-Z)</li>
            <li>• One lowercase letter (a-z)</li>
            <li>• One number (0-9)</li>
            <li>• One special character (!@#$%...)</li>
          </ul>
        </div>

        <div className="pt-2">
          <Button variant="primary" size="md" type="submit" loading={saving}>
            Update Password
          </Button>
        </div>
      </Form>
    </SettingsSection>
  );
}
