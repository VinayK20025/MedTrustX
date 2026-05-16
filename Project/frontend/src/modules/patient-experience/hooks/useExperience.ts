'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { experienceApi } from '../services/experience.api';

const KEYS = {
  all: ['patient-experience'] as const,
  dashboard: ['patient-experience', 'dashboard'] as const,
};

export function useExperienceDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: () => experienceApi.getDashboardData(),
    staleTime: 60000,
    refetchInterval: 300000,
  });
}

export function useUpdateGrievance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ grievanceId, updates }: { grievanceId: string; updates: any }) => 
      experienceApi.updateGrievance(grievanceId, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}
