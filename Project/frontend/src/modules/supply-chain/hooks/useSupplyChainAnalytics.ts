'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supplyChainApi, type ScFilters } from '../services/supply-chain.api';

const KEYS = {
  all: ['supply-chain'] as const,
  summary: (f: ScFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useSupplyChainDashboard(filters: ScFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => supplyChainApi.getDashboardSummary(filters), refetchInterval: 30_000 });
}

export function useEscalateIssue() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => supplyChainApi.escalateIssue(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useContactVendor() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => supplyChainApi.contactVendor(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
