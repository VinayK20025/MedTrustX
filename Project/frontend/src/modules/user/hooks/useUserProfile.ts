/**
 * MedTrustX — User Profile Hooks
 */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../services/user.api';
import { notify } from '@/store/notification.store';
import type { UpdateProfilePayload } from '../types/user.types';

const KEYS = {
  profile: ['user', 'profile'] as const,
};

/** Fetch current user's profile */
export function useUserProfile() {
  return useQuery({
    queryKey: KEYS.profile,
    queryFn: () => userApi.getProfile(),
    staleTime: 60_000,
  });
}

/** Update profile mutation */
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfilePayload) => userApi.updateProfile(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.profile });
      notify.success('Profile Updated', 'Your profile has been saved successfully.');
    },
    onError: () => {
      notify.error('Update Failed', 'Could not save profile changes. Please try again.');
    },
  });
}

/** Upload avatar mutation */
export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => userApi.uploadAvatar(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.profile });
      notify.success('Avatar Updated', 'Your profile photo has been changed.');
    },
    onError: () => {
      notify.error('Upload Failed', 'Could not upload the image. Please try a smaller file.');
    },
  });
}

/** Delete avatar mutation */
export function useDeleteAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => userApi.deleteAvatar(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.profile });
      notify.success('Avatar Removed', 'Your profile photo has been removed.');
    },
  });
}
