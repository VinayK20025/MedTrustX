'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transcriptionApi, type TranscriptionFilters } from '../services/transcription.api';

const KEYS = {
  all: ['transcription'] as const,
  summary: (f: TranscriptionFilters) => [...KEYS.all, 'summary', f] as const,
};

export function useTranscriptionDashboard(filters: TranscriptionFilters) {
  return useQuery({
    queryKey: KEYS.summary(filters),
    queryFn: () => transcriptionApi.getDashboardSummary(filters),
    staleTime: 30_000,
  });
}

export function useSaveTranscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ transcriptionId, content }: { transcriptionId: string, content: string }) => transcriptionApi.saveTranscription(transcriptionId, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }), // In reality, we might not invalidate on every auto-save to prevent refetching
  });
}

export function useSubmitTranscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (transcriptionId: string) => transcriptionApi.submitForReview(transcriptionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useFlagAudioIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ transcriptionId, timestamp, issue }: { transcriptionId: string, timestamp: string, issue: string }) => transcriptionApi.flagAudioIssue(transcriptionId, timestamp, issue),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
