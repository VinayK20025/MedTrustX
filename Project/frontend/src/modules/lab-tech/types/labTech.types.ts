/**
 * MedTrustX — Laboratory Technician Types
 */

export interface LabTechKPI {
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

export interface LabSample {
  id: string;
  barcode: string;
  patientName: string;
  patientId: string;
  testPanel: string;
  sampleType: 'Blood' | 'Urine' | 'Plasma' | 'Serum' | 'Swab';
  status: 'Awaiting Collection' | 'Collected' | 'In Centrifuge' | 'Loading Device' | 'Processing' | 'Completed';
  priority: 'Routine' | 'Urgent' | 'STAT';
  collectedAt?: string;
}

export interface ProcessingStep {
  id: string;
  sampleId: string;
  stepName: string;
  instructions: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Error';
  isAutomated: boolean;
}

export interface LabDeviceStatus {
  id: string;
  name: string;
  status: 'Idle' | 'Running' | 'Error' | 'Maintenance Required';
  currentBatchSize: number;
  maxBatchSize: number;
  timeRemainingMinutes?: number;
}

export interface QCProtocol {
  id: string;
  taskName: string;
  instrumentId: string;
  status: 'Pending' | 'Passed' | 'Failed';
  dueDate: string;
}

export interface LabTechAlert {
  id: string;
  type: 'Device Error' | 'Sample Mismatch' | 'QC Failed' | 'STAT Pending';
  severity: 'warning' | 'critical';
  timestamp: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  message: string;
}

export interface LabTechDashboardData {
  kpis: LabTechKPI[];
  samples: LabSample[];
  activeSample?: LabSample;
  processingSteps: ProcessingStep[];
  devices: LabDeviceStatus[];
  qcTasks: QCProtocol[];
  alerts: LabTechAlert[];
}
