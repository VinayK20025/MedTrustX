'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Tabs } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Spinner';
import { ProfileCard } from '../components/ProfileCard';
import { ProfileForm } from '../components/ProfileForm';
import { useUserProfile, useUpdateProfile, useUploadAvatar, useDeleteAvatar } from '../hooks/useUserProfile';
import { User, Shield, Settings } from 'lucide-react';

export function ProfilePage() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [editing, setEditing] = useState(false);
  const { data, isLoading } = useUserProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();

  const profile = data?.data;

  useEffect(() => {
    setPageMeta('My Profile', 'View and manage your profile information');
  }, [setPageMeta]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center text-gray-400 py-20">Could not load profile</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumbs items={[{ label: 'Profile' }]} />

      {editing ? (
        <ProfileForm
          profile={profile}
          onSubmit={(data) => {
            updateProfile.mutate(data, { onSuccess: () => setEditing(false) });
          }}
          onCancel={() => setEditing(false)}
          onAvatarUpload={(file) => uploadAvatar.mutate(file)}
          onAvatarRemove={() => deleteAvatar.mutate()}
          saving={updateProfile.isPending}
          uploadingAvatar={uploadAvatar.isPending}
        />
      ) : (
        <ProfileCard
          profile={profile}
          onEdit={() => setEditing(true)}
        />
      )}
    </div>
  );
}
