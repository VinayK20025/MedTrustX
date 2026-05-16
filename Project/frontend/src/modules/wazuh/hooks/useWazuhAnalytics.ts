'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wazuhApi } from '../services/wazuh.api';

const KEYS = {
  all:        ['wazuh'] as const,
  dashboard:  ['wazuh', 'dashboard'] as const,
  alerts:     (f?: any) => ['wazuh', 'alerts', f] as const,
  vulns:      ['wazuh', 'vulnerabilities'] as const,
  fim:        ['wazuh', 'fim'] as const,
  sca:        ['wazuh', 'sca'] as const,
  agents:     ['wazuh', 'agents'] as const,
};

export function useWazuhDashboard() {
  return useQuery({
    queryKey: KEYS.dashboard,
    queryFn: () => wazuhApi.getDashboard(),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useWazuhAlerts(filters?: { severity?: string; acknowledged?: boolean }) {
  return useQuery({
    queryKey: KEYS.alerts(filters),
    queryFn: () => wazuhApi.getAlerts(filters),
    staleTime: 10_000,
    refetchInterval: 20_000,
  });
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => wazuhApi.acknowledgeAlert(alertId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useWazuhVulnerabilities() {
  return useQuery({
    queryKey: KEYS.vulns,
    queryFn: () => wazuhApi.getVulnerabilities(),
    staleTime: 60_000,
  });
}

export function useWazuhFim() {
  return useQuery({
    queryKey: KEYS.fim,
    queryFn: () => wazuhApi.getFimEvents(),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useWazuhSca() {
  return useQuery({
    queryKey: KEYS.sca,
    queryFn: () => wazuhApi.getScaResults(),
    staleTime: 60_000,
  });
}

export function useWazuhAgents() {
  return useQuery({
    queryKey: KEYS.agents,
    queryFn: () => wazuhApi.getAgents(),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useRestartAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (agentId: string) => wazuhApi.restartAgent(agentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.agents }),
  });
}
