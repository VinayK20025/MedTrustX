/**
 * MedTrustX — Medical Transcriptionist (Role 71) Types
 */

export interface TranscriptionKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text' | 'time';
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface DictationQueueItem {
  id: string;
  doctorName: string;
  department: string;
  documentType: 'Discharge Summary' | 'Operative Report' | 'Consultation Note';
  durationSeconds: number;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'QA Review';
  dateDictated: string;
}

export interface ActiveTranscription {
  id: string;
  dictationId: string;
  content: string;
  qaFlags: string[];
  audioUrl: string; // Mock URL for the player
}

export interface TranscriptionTemplate {
  id: string;
  name: string;
  type: string;
  content: string; // HTML or Markdown format for the editor
}

export interface TranscriptionSnippet {
  id: string;
  shortcut: string;
  expansion: string;
}

export interface TranscriptionDashboardData {
  kpis: TranscriptionKPI[];
  queue: DictationQueueItem[];
  activeEditor?: ActiveTranscription;
  templates: TranscriptionTemplate[];
  snippets: TranscriptionSnippet[];
}
