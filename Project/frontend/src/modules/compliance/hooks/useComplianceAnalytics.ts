'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { complianceApi } from '../services/compliance.api';
import type { ComplianceFilters, CompliancePolicy, ComplianceViolation, ConsentRecord, ComplianceMutationPayload } from '../types/compliance.types';

const KEYS = {
  all: ['compliance'] as const,
  dashboard: ['compliance', 'dashboard'] as const,
  policies: ['compliance', 'policies'] as const,
  violations: ['compliance', 'violations'] as const,
  documents: ['compliance', 'documents'] as const,
  consents: ['compliance', 'consents'] as const,
  checks: ['compliance', 'checks'] as const,
};

export const useComplianceDashboard = (filters: ComplianceFilters = {}) => {
  return useQuery({
    queryKey: [...KEYS.dashboard, filters],
    queryFn: () => complianceApi.getDashboardData(filters),
    staleTime: 45_000,
    refetchInterval: 60_000,
  });
};

export const useCreatePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CompliancePolicy>) => complianceApi.createPolicy(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.all }),
  });
};

export const useUpdatePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ policyId, data }: { policyId: string; data: Partial<CompliancePolicy> }) =>
      complianceApi.updatePolicy(policyId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.all }),
  });
};

export const useReportViolation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ComplianceViolation>) => complianceApi.reportViolation(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.all }),
  });
};

export const useUpdateViolation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ violationId, payload }: { violationId: string; payload: ComplianceMutationPayload }) =>
      complianceApi.updateViolation(violationId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.all }),
  });
};

export const useCreateConsentRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ConsentRecord>) => complianceApi.createConsentRecord(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.all }),
  });
};

export const useUpdateConsentRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ consentId, payload }: { consentId: string; payload: ComplianceMutationPayload }) =>
      complianceApi.updateConsentRecord(consentId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.all }),
  });
};

export const useCompleteCheck = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ checkId, payload }: { checkId: string; payload: ComplianceMutationPayload }) =>
      complianceApi.completeCheck(checkId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.all }),
  });
};

export const useExportComplianceReport = () => {
  return useMutation({
    mutationFn: () => complianceApi.exportComplianceReport(),
  });
};
