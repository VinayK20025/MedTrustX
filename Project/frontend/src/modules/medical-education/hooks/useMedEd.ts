'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medEdApi } from '../services/meded.api';

const KEYS = {
  all: ['medEd'] as const,
  dashboard: ['medEd', 'dashboard'] as const,
};

export function useMedEdDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: () => medEdApi.getDashboardData(),
    staleTime: 60000,
    refetchInterval: 300000,
  });
}

export function useEnrollStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, studentId }: { courseId: string; studentId: string }) => 
      medEdApi.enrollStudent(courseId, studentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}
