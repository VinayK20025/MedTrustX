'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { managementApi, type ManagementFilters } from '../services/management.api';

const KEYS = {
  all: ['management'] as const,
  dashboard: (filters: ManagementFilters) => [...KEYS.all, 'dashboard', filters] as const,
};

export function useManagementDashboard(filters: ManagementFilters = {}) {
  return useQuery({
    queryKey: KEYS.dashboard(filters),
    queryFn: () => managementApi.getDashboardData(filters),
    staleTime: 15_000,
    refetchInterval: 20_000,
  });
}

export function useCreateManagementTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof managementApi.createTask>[0]) => managementApi.createTask(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateManagementTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof managementApi.updateTask>[1] }) => managementApi.updateTask(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useDeleteManagementTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => managementApi.deleteTask(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
