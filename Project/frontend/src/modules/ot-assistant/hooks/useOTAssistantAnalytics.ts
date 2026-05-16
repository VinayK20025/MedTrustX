'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { otAssistantApi, type OTAssistantFilters } from '../services/otAssistant.api';

const KEYS = {
  all: ['otAssistant'] as const,
  summary: (f: OTAssistantFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useOTAssistantDashboard(filters: OTAssistantFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => otAssistantApi.getDashboardSummary(filters),
    staleTime: 10_000,
    refetchInterval: 10_000, // Poll every 10 seconds to catch urgent instrument requests
  });
}

export function useCompleteChecklistTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => otAssistantApi.completeChecklistTask(taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useSupplyInstrument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => otAssistantApi.supplyInstrument(requestId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useReportInventoryIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, issue }: { itemId: string; issue: string }) => otAssistantApi.reportInventoryIssue(itemId, issue),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
