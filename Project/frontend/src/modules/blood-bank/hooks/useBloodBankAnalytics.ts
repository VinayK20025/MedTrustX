'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bloodBankApi, type BbFilters } from '../services/blood-bank.api';

const KEYS = {
  all: ['blood-bank'] as const,
  summary: (f: BbFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useBloodBankDashboard(filters: BbFilters) {
  return useQuery({ queryKey: KEYS.summary(filters), queryFn: () => bloodBankApi.getDashboardSummary(filters), refetchInterval: 15_000 });
}

export function useIssueUnit() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ unitId, patientId }: { unitId: string; patientId: string }) => bloodBankApi.issueUnit(unitId, patientId), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useDiscardUnit() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ unitId, reason }: { unitId: string; reason: string }) => bloodBankApi.discardUnit(unitId, reason), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useConfirmCrossmatch() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ xmId, result }: { xmId: string; result: string }) => bloodBankApi.confirmCrossmatch(xmId, result), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
