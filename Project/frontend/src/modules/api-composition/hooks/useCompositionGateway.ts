'use client';
import { useQuery } from '@tanstack/react-query';
import { compositionApi } from '../services/composition.api';

const KEYS = {
  registry: ['composition', 'registry'] as const,
  analytics: ['composition', 'analytics'] as const,
  circuits: ['composition', 'circuits'] as const,
  patientDashboard: (id: string) => ['composition', 'patient', id] as const,
  clinicalSummary: (id: string) => ['composition', 'clinical', id] as const,
  adminOverview: (id: string) => ['composition', 'admin', id] as const,
};

export const useServiceRegistry = () => useQuery({
  queryKey: KEYS.registry,
  queryFn: () => compositionApi.getServiceRegistry(),
  staleTime: 15_000,
  refetchInterval: 15_000,
});

export const useCompositionAnalytics = () => useQuery({
  queryKey: KEYS.analytics,
  queryFn: () => compositionApi.getCompositionAnalytics(),
  staleTime: 10_000,
  refetchInterval: 10_000,
});

export const useCircuitStates = () => useQuery({
  queryKey: KEYS.circuits,
  queryFn: () => compositionApi.getCircuitStates(),
  staleTime: 5_000,
  refetchInterval: 5_000,
});

export const usePatientDashboard = (patientId: string) => useQuery({
  queryKey: KEYS.patientDashboard(patientId),
  queryFn: () => compositionApi.getPatientDashboard(patientId),
  enabled: !!patientId,
  staleTime: 30_000,
});

export const useAdminOverview = (tenantId: string) => useQuery({
  queryKey: KEYS.adminOverview(tenantId),
  queryFn: () => compositionApi.getAdminOverview(tenantId),
  enabled: !!tenantId,
  staleTime: 30_000,
});
