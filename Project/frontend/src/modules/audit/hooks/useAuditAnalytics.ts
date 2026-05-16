'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auditApi } from '../services/audit.api';
import type { AuditDashboardData, AuditFilters, AuditMutationPayload } from '../types/audit.types';

const KEYS = {
  all: ['audit'] as const,
  dashboard: ['audit', 'dashboard'] as const,
  audits: ['audit', 'audits'] as const,
  controls: ['audit', 'controls'] as const,
  findings: ['audit', 'findings'] as const,
  capas: ['audit', 'capas'] as const,
  mappings: ['audit', 'mappings'] as const,
};

export const useAuditDashboard = (filters?: AuditFilters) => {
  return useQuery({
    queryKey: [...KEYS.dashboard, filters],
    queryFn: () => auditApi.getDashboardData(filters),
    staleTime: 45000, // 45 seconds
    refetchInterval: 60000, // 60 seconds
    select: (response) => response?.data as AuditDashboardData,
  });
};

export const useCreateAudit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AuditMutationPayload) => auditApi.createAudit(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
};

export const useUpdateAudit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AuditMutationPayload }) =>
      auditApi.updateAudit(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
};

export const useReportFinding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AuditMutationPayload) => auditApi.reportFinding(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
};

export const useUpdateFinding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      auditApi.updateFinding(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
};

export const useCreateCapaAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AuditMutationPayload) => auditApi.createCapaAction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
};

export const useCloseCapaAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => auditApi.closeCapaAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
};

export const useExportAuditReport = () => {
  return useMutation({
    mutationFn: (filters?: AuditFilters) => auditApi.exportAuditReport(filters),
  });
};
