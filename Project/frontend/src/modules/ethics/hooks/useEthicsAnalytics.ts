'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ethicsApi, type EthicsFilters } from '../services/ethics.api';

const KEYS = {
  all: ['ethics'] as const,
  summary: (f: EthicsFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useEthicsDashboard(filters: EthicsFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => ethicsApi.getDashboardSummary(filters), refetchInterval: 60_000 });
}

export function useSubmitEthicsDecision() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, decision, notes }: { id: string; decision: any; notes: string }) => ethicsApi.submitDecision(id, decision, notes), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useUpdateProtocolStatus() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => ethicsApi.updateProtocolStatus(id, status), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
