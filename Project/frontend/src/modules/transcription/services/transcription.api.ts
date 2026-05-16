import type {
  TranscriptionDashboardData, TranscriptionKPI, DictationQueueItem,
  ActiveTranscription, TranscriptionTemplate, TranscriptionSnippet
} from '../types/transcription.types';

export interface TranscriptionFilters {
  priority?: string;
}

const mockKpis: TranscriptionKPI[] = [
  { id: '1', title: 'Dictations Completed', value: 28, format: 'number', status: 'normal' },
  { id: '2', title: 'Average Turnaround', value: '4.5 hrs', format: 'time', status: 'success' },
  { id: '3', title: 'QA Error Rate', value: '0.8%', format: 'text', status: 'success' },
  { id: '4', title: 'Pending Urgent', value: 2, format: 'number', status: 'critical', actionLabel: 'View Queue', actionUrl: '/dashboard/transcription/dictations' },
];

const mockQueue: DictationQueueItem[] = [
  { id: 'DICT-101', doctorName: 'Dr. Sarah Evans', department: 'Cardiology', documentType: 'Discharge Summary', durationSeconds: 315, priority: 'High', status: 'In Progress', dateDictated: new Date(Date.now() - 3600000).toISOString() },
  { id: 'DICT-102', doctorName: 'Dr. James Wilson', department: 'Surgery', documentType: 'Operative Report', durationSeconds: 840, priority: 'Urgent', status: 'Pending', dateDictated: new Date(Date.now() - 1800000).toISOString() },
  { id: 'DICT-103', doctorName: 'Dr. Emily Chen', department: 'Neurology', documentType: 'Consultation Note', durationSeconds: 420, priority: 'Medium', status: 'QA Review', dateDictated: new Date(Date.now() - 7200000).toISOString() },
];

const mockEditor: ActiveTranscription = {
  id: 'TRANS-101',
  dictationId: 'DICT-101',
  content: 'PATIENT NAME: [Name]\nMRN: [MRN]\n\nCHIEF COMPLAINT:\nChest pain radiating to the left arm.\n\nHISTORY OF PRESENT ILLNESS:\nThe patient is a 55-year-old male who presents with acute onset retrosternal chest pain...',
  qaFlags: ['Unclear audio at 02:14 - please verify medication dosage.'],
  audioUrl: '/mock-audio.mp3', // Note: Placeholder, audio won't actually play
};

const mockTemplates: TranscriptionTemplate[] = [
  { id: 'TPL-1', name: 'Standard Discharge Summary', type: 'Discharge Summary', content: 'ADMISSION DATE:\nDISCHARGE DATE:\n\nDISCHARGE DIAGNOSES:\n1.\n2.\n\nHOSPITAL COURSE:\n\nDISCHARGE MEDICATIONS:\n\nFOLLOW-UP:' },
  { id: 'TPL-2', name: 'General Surgery Op Note', type: 'Operative Report', content: 'PREOPERATIVE DIAGNOSIS:\nPOSTOPERATIVE DIAGNOSIS:\nPROCEDURE:\nSURGEON:\nANESTHESIA:\nESTIMATED BLOOD LOSS:\n\nDESCRIPTION OF PROCEDURE:\n' },
];

const mockSnippets: TranscriptionSnippet[] = [
  { id: 'SNIP-1', shortcut: 'bp', expansion: 'blood pressure' },
  { id: 'SNIP-2', shortcut: 'hr', expansion: 'heart rate' },
  { id: 'SNIP-3', shortcut: 'wnl', expansion: 'within normal limits' },
  { id: 'SNIP-4', shortcut: 'hx', expansion: 'history' },
];

export const transcriptionApi = {
  getDashboardSummary: async (filters: TranscriptionFilters) => ({
    data: {
      kpis: mockKpis,
      queue: mockQueue,
      activeEditor: mockEditor,
      templates: mockTemplates,
      snippets: mockSnippets,
    } as TranscriptionDashboardData,
    message: 'Success', status: 200,
  }),

  saveTranscription: async (transcriptionId: string, content: string) => ({ data: { success: true }, message: `Transcription auto-saved`, status: 200 }),
  submitForReview: async (transcriptionId: string) => ({ data: { success: true }, message: `Transcription submitted to MRO`, status: 200 }),
  flagAudioIssue: async (transcriptionId: string, timestamp: string, issue: string) => ({ data: { success: true }, message: `QA flag added at ${timestamp}`, status: 200 }),
};
