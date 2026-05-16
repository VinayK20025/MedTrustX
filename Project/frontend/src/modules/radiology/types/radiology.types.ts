/**
 * MedTrustX — Imaging Radiologist Types
 */

export interface RadiologyKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text' | 'time';
  status: 'normal' | 'warning' | 'critical' | 'success';
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  actionLabel?: string;
  actionUrl?: string;
}

export interface ImagingStudy {
  id: string;
  patientName: string;
  patientId: string;
  modality: 'X-Ray' | 'CT' | 'MRI' | 'Ultrasound' | 'PET';
  bodyPart: string;
  status: 'Pending Review' | 'In Progress' | 'Dictation Pending' | 'Finalized';
  priority: 'Routine' | 'Urgent' | 'STAT';
  imageCount: number;
  studyDate: string;
}

export interface ViewerState {
  zoom: number;
  pan: { x: number; y: number };
  windowWidth: number; // WW
  windowLevel: number; // WL
  currentSlice: number;
  totalSlices: number;
  activeTool: 'Pan' | 'Zoom' | 'Window/Level' | 'Distance' | 'Angle' | 'ROI';
}

export interface Annotation {
  id: string;
  studyId: string;
  type: 'Measurement' | 'ROI' | 'Angle' | 'Text';
  label: string;
  value: string;
  coordinates: { x: number; y: number }[];
}

export interface DiagnosticReport {
  studyId: string;
  findings: string;
  impression: string;
  isCritical: boolean;
  status: 'Draft' | 'Final';
}

export interface RadiologyAlert {
  id: string;
  studyId?: string;
  type: 'STAT Pending' | 'Critical Finding' | 'AI Anomaly Detected';
  severity: 'warning' | 'critical';
  timestamp: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  message: string;
}

export interface RadiologyDashboardData {
  kpis: RadiologyKPI[];
  studies: ImagingStudy[];
  activeStudy?: ImagingStudy;
  annotations: Annotation[];
  reportDraft?: DiagnosticReport;
  alerts: RadiologyAlert[];
}
