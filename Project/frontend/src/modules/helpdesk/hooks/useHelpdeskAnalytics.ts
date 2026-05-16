'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { helpdeskApi, type HelpdeskFilters } from '../services/helpdesk.api';

const KEYS = {
  all: ['helpdesk'] as const,
  summary: (f: HelpdeskFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useHelpdeskDashboard(filters: HelpdeskFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => helpdeskApi.getDashboardSummary(filters),
    refetchInterval: 10_000, // Frequent polling for ticket queues
  });
}

export function useUpdateTicket() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, payload }: { id: string, payload: any }) => helpdeskApi.updateTicketStatus(id, payload), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useAssignTicket() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, team }: { id: string, team: string }) => helpdeskApi.assignTicket(id, team), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}

export function useAddTicketNote() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, msg, internal }: { id: string, msg: string, internal: boolean }) => helpdeskApi.addTicketLog(id, msg, internal), onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }) });
}
