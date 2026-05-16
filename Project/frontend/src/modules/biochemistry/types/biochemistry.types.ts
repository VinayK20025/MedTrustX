/**
 * MedTrustX — Biochemist (Lab) Types
 */

export interface BiochemKPI {
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

export interface BiochemSample {
  id: string;
  patientName: string;
  patientId: string;
  panelType: 'Comprehensive Metabolic' | 'Renal' | 'Hepatic' | 'Lipid' | 'Electrolytes';
  collectionDate: string;
  status: 'Pending' | 'Processing' | 'Ready for Validation' | 'Validated';
  priority: 'Routine' | 'Urgent' | 'STAT';
}

export interface BiochemResultParameter {
  id: string;
  parameterName: string;
  value: number;
  unit: string;
  referenceRange: string;
  flag: 'Normal' | 'High' | 'Low' | 'Critical High' | 'Critical Low';
  previousValue?: number;
}

export interface BiochemTestResult {
  sampleId: string;
  analyzerId: string;
  parameters: BiochemResultParameter[];
}

export interface QCDataPoint {
  date: string;
  value: number;
  mean: number;
  sd1: number;
  sd2: number;
  sd3: number;
  status: 'Pass' | 'Warning' | 'Fail';
}

export interface QCChart {
  parameterName: string;
  analyzerId: string;
  dataPoints: QCDataPoint[];
}

export interface AnalyzerInstrument {
  id: string;
  name: string;
  status: 'Operational' | 'Calibrating' | 'Maintenance Required' | 'Offline';
  samplesProcessedToday: number;
  lastCalibration: string;
  reagentLevels: number; // percentage
}

export interface BiochemAlert {
  id: string;
  sampleId?: string;
  analyzerId?: string;
  type: 'Critical Value' | 'QC Failure' | 'Instrument Error';
  severity: 'warning' | 'critical';
  timestamp: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  message: string;
}

export interface BiochemDashboardData {
  kpis: BiochemKPI[];
  samples: BiochemSample[];
  activeSample?: BiochemSample;
  activeResult?: BiochemTestResult;
  qcCharts: QCChart[];
  instruments: AnalyzerInstrument[];
  alerts: BiochemAlert[];
}
