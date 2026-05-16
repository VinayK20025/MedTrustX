/**
 * MedTrustX — Radiology Technician Types
 */

export interface RadiologyTechKPI {
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

export interface ImagingPatientQueue {
  id: string;
  patientName: string;
  mrn: string;
  modality: 'X-Ray' | 'CT' | 'MRI' | 'Ultrasound' | 'PET';
  bodyPart: string;
  status: 'Waiting' | 'In Setup' | 'Scanning' | 'Image Review' | 'Completed';
  priority: 'Routine' | 'Urgent' | 'STAT';
  appointmentTime: string;
}

export interface ImagingProtocol {
  id: string;
  name: string;
  modality: string;
  description: string;
  parameters: {
    kVp?: number;
    mA?: number;
    sliceThickness?: string;
    contrast?: boolean;
    durationMinutes?: number;
  };
}

export interface ImagingDeviceStatus {
  id: string;
  name: string;
  modality: string;
  status: 'Ready' | 'Scanning' | 'Cooling' | 'Error' | 'Maintenance';
  temperature?: number;
  tubeHeatPercentage?: number;
  activePatientId?: string;
}

export interface CapturedImage {
  id: string;
  patientId: string;
  seriesNumber: number;
  imageCount: number;
  quality: 'Excellent' | 'Acceptable' | 'Poor - Retake Required';
  isTransferredToPACS: boolean;
}

export interface RadiologyTechAlert {
  id: string;
  deviceId?: string;
  patientId?: string;
  type: 'Device Error' | 'Tube Overheat' | 'Protocol Mismatch' | 'STAT Delay';
  severity: 'warning' | 'critical';
  timestamp: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  message: string;
}

export interface RadiologyTechDashboardData {
  kpis: RadiologyTechKPI[];
  queue: ImagingPatientQueue[];
  activePatient?: ImagingPatientQueue;
  protocols: ImagingProtocol[];
  devices: ImagingDeviceStatus[];
  recentImages: CapturedImage[];
  alerts: RadiologyTechAlert[];
}
