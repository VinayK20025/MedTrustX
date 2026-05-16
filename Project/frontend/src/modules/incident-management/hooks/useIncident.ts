'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incidentApi } from '../services/incident.api';

const KEYS = {
  all: ['incident-management'] as const,
  dashboard: ['incident-management', 'dashboard'] as const,
};

export function useIncidentDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: () => incidentApi.getDashboardData(),
    staleTime: 60000,
    refetchInterval: 300000,
  });
}

export function useReportIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (incident: any) => incidentApi.reportIncident(incident),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.dashboard }),
  });
}
