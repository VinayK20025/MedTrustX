'use client';
import { useQuery } from '@tanstack/react-query';
import { studentApi, type StudentFilters } from '../services/student.api';

const KEYS = {
  all: ['student'] as const,
  summary: (f: StudentFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useStudentDashboard(filters: StudentFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => studentApi.getDashboardSummary(filters),
    staleTime: 120_000, // 2 minutes polling (academic role)
    refetchInterval: 120_000,
  });
}
