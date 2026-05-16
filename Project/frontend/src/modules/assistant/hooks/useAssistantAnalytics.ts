'use client';
import { useQuery } from '@tanstack/react-query';
import { assistantApi, type AssistantFilters } from '../services/assistant.api';

const KEYS = {
  all: ['nursing-assistant'] as const,
  summary: (f: AssistantFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useAssistantDashboard(filters: AssistantFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => assistantApi.getDashboardSummary(filters),
    staleTime: 10_000, 
    refetchInterval: 10_000,
  });
}
