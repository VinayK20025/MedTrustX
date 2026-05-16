/**
 * MedTrustX — Ultrasound Technician Types
 */

export interface UltrasoundKPI {
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

export interface UltrasoundQueue {
  id: string;
  patientName: string;
  mrn: string;
  examType: 'Abdominal' | 'Obstetric' | 'Cardiac' | 'Vascular' | 'Pelvic';
  status: 'Waiting' | 'In Setup' | 'Scanning' | 'Image Review' | 'Completed';
  priority: 'Routine' | 'Urgent' | 'STAT';
  appointmentTime: string;
}

export interface UltrasoundPreset {
  id: string;
  name: string;
  examType: string;
  description: string;
  parameters: {
    probeHz: string;
    depthCm: number;
    gain: number;
    mode: 'B-Mode' | 'M-Mode' | 'Color Doppler' | 'Spectral Doppler';
  };
}

export interface LiveScanState {
  isScanning: boolean;
  currentMode: string;
  depthCm: number;
  gainPercent: number;
  cineLoopBufferSec: number;
  capturedFrames: number;
}

export interface UltrasoundMeasurement {
  id: string;
  patientId: string;
  type: 'Distance' | 'Circumference' | 'Volume' | 'Fetal Heart Rate' | 'Velocity';
  label: string;
  value: string;
  timestamp: string;
}

export interface UltrasoundAlert {
  id: string;
  patientId?: string;
  type: 'Device Error' | 'Probe Disconnected' | 'STAT Delay';
  severity: 'warning' | 'critical';
  timestamp: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  message: string;
}

export interface UltrasoundDashboardData {
  kpis: UltrasoundKPI[];
  queue: UltrasoundQueue[];
  activePatient?: UltrasoundQueue;
  presets: UltrasoundPreset[];
  liveState: LiveScanState;
  measurements: UltrasoundMeasurement[];
  alerts: UltrasoundAlert[];
}
