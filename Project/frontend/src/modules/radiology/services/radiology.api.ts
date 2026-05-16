import type {
  RadiologyDashboardData, RadiologyKPI, ImagingStudy, Annotation,
  DiagnosticReport, RadiologyAlert
} from '../types/radiology.types';

export interface RadiologyFilters {
  modality?: string;
}

const mockKpis: RadiologyKPI[] = [
  { id: '1', title: 'Pending Studies', value: 14, format: 'number', status: 'warning' },
  { id: '2', title: 'STAT TAT', value: '18m', format: 'time', status: 'normal' },
  { id: '3', title: 'Critical Findings', value: 3, format: 'number', status: 'critical', actionLabel: 'Review Cases', actionUrl: '/dashboard/radiology/alerts' },
  { id: '4', title: 'Reports Finalized', value: 42, format: 'number', status: 'success' },
];

const mockStudies: ImagingStudy[] = [
  { id: 'IMG-9011', patientName: 'Robert Smith', patientId: 'MRN-4491', modality: 'CT', bodyPart: 'Head w/o Contrast', status: 'In Progress', priority: 'STAT', imageCount: 256, studyDate: new Date(Date.now() - 3600000).toISOString() },
  { id: 'IMG-9012', patientName: 'Emma Watson', patientId: 'MRN-5520', modality: 'MRI', bodyPart: 'Lumbar Spine', status: 'Pending Review', priority: 'Routine', imageCount: 512, studyDate: new Date(Date.now() - 7200000).toISOString() },
];

const mockAnnotations: Annotation[] = [
  { id: 'ANN-1', studyId: 'IMG-9011', type: 'Measurement', label: 'Hyperdense Mass', value: '2.4 cm', coordinates: [{x: 100, y: 150}, {x: 140, y: 190}] },
];

const mockDraft: DiagnosticReport = {
  studyId: 'IMG-9011',
  findings: 'There is a 2.4 cm hyperdense acute hemorrhage in the right basal ganglia with surrounding edema and mild mass effect on the right lateral ventricle.',
  impression: '1. Acute right basal ganglia hemorrhage.\n2. No midline shift.',
  isCritical: true,
  status: 'Draft',
};

const mockAlerts: RadiologyAlert[] = [
  { id: 'ALT-RAD-1', studyId: 'IMG-9011', type: 'AI Anomaly Detected', severity: 'warning', timestamp: new Date(Date.now() - 1000).toISOString(), status: 'Active', message: 'AI triaging detects possible acute intracranial hemorrhage. Prioritize review.' },
  { id: 'ALT-RAD-2', studyId: 'IMG-9011', type: 'STAT Pending', severity: 'critical', timestamp: new Date(Date.now() - 1800000).toISOString(), status: 'Active', message: 'STAT Head CT approaching 30-minute SLA.' },
];

export const radiologyApi = {
  getDashboardSummary: async (filters: RadiologyFilters) => ({
    data: {
      kpis: mockKpis,
      studies: mockStudies,
      activeStudy: mockStudies[0],
      annotations: mockAnnotations,
      reportDraft: mockDraft,
      alerts: mockAlerts,
    } as RadiologyDashboardData,
    message: 'Success', status: 200,
  }),

  finalizeReport: async (studyId: string, report: DiagnosticReport) => ({ data: { success: true }, message: `Diagnostic report finalized`, status: 200 }),
  saveAnnotation: async (annotation: Annotation) => ({ data: { success: true }, message: `Annotation saved`, status: 200 }),
  acknowledgeAlert: async (alertId: string) => ({ data: { success: true }, message: 'Alert acknowledged', status: 200 }),
};
