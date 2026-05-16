/**
 * MedTrustX — Board Hooks
 */
'use client';
import { useQuery } from '@tanstack/react-query';
import { boardApi, type DashboardFilters } from '../services/board.api';

const KEYS = {
  all: ['board'] as const,
  summary: (filters: DashboardFilters) => [...KEYS.all, 'summary', filters] as const,
  financial: (filters: DashboardFilters) => [...KEYS.all, 'financial', filters] as const,
  clinical: (filters: DashboardFilters) => [...KEYS.all, 'clinical', filters] as const,
  operations: (filters: DashboardFilters) => [...KEYS.all, 'operations', filters] as const,
  risk: (filters: DashboardFilters) => [...KEYS.all, 'risk', filters] as const,
  comparison: (filters: DashboardFilters) => [...KEYS.all, 'comparison', filters] as const,
};

export function useBoardSummary(filters: DashboardFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => boardApi.getDashboardSummary(filters),
    staleTime: 5 * 60_000, // 5 minutes, since it's aggregated data
  });
}

export function useFinancialIntelligence(filters: DashboardFilters) {
  return useQuery({
    queryKey: KEYS.financial(filters),
    queryFn: () => boardApi.getFinancialIntelligence(filters),
    staleTime: 5 * 60_000,
  });
}

export function useClinicalQuality(filters: DashboardFilters) {
  return useQuery({
    queryKey: KEYS.clinical(filters),
    queryFn: () => boardApi.getClinicalQuality(filters),
    staleTime: 5 * 60_000,
  });
}

export function useOperationsSummary(filters: DashboardFilters) {
  return useQuery({
    queryKey: KEYS.operations(filters),
    queryFn: () => boardApi.getOperationsSummary(filters),
    staleTime: 5 * 60_000,
  });
}

export function useRiskAlerts(filters: DashboardFilters) {
  return useQuery({
    queryKey: KEYS.risk(filters),
    queryFn: () => boardApi.getRiskAlerts(filters),
    staleTime: 1 * 60_000, // Alerts update more frequently
  });
}

export function useHospitalComparison(filters: DashboardFilters) {
  return useQuery({
    queryKey: KEYS.comparison(filters),
    queryFn: () => boardApi.getHospitalComparison(filters),
    staleTime: 5 * 60_000,
  });
}
