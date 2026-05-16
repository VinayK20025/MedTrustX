import type {
  BiochemDashboardData, BiochemKPI, BiochemSample, BiochemTestResult,
  QCChart, AnalyzerInstrument, BiochemAlert
} from '../types/biochemistry.types';

export interface BiochemFilters {
  panelType?: string;
}

const mockKpis: BiochemKPI[] = [
  { id: '1', title: 'Samples Processed', value: 342, format: 'number', status: 'normal' },
  { id: '2', title: 'Pending Validation', value: 24, format: 'number', status: 'warning' },
  { id: '3', title: 'QC Pass Rate', value: '98.5%', format: 'percentage', status: 'success' },
  { id: '4', title: 'QC Failures', value: 1, format: 'number', status: 'critical', actionLabel: 'Review Levey-Jennings', actionUrl: '/dashboard/biochemistry/qc' },
];

const mockSamples: BiochemSample[] = [
  { id: 'BC-2034', patientName: 'Alice Green', patientId: 'MRN-3341', panelType: 'Comprehensive Metabolic', collectionDate: new Date(Date.now() - 3600000).toISOString(), status: 'Ready for Validation', priority: 'STAT' },
  { id: 'BC-2035', patientName: 'Bob White', patientId: 'MRN-3342', panelType: 'Renal', collectionDate: new Date(Date.now() - 7200000).toISOString(), status: 'Processing', priority: 'Routine' },
];

const mockTestResult: BiochemTestResult = {
  sampleId: 'BC-2034',
  analyzerId: 'Roche-Cobas-1',
  parameters: [
    { id: 'P-1', parameterName: 'Glucose', value: 110, unit: 'mg/dL', referenceRange: '70-99', flag: 'High', previousValue: 105 },
    { id: 'P-2', parameterName: 'Sodium', value: 136, unit: 'mEq/L', referenceRange: '135-145', flag: 'Normal', previousValue: 138 },
    { id: 'P-3', parameterName: 'Potassium', value: 6.2, unit: 'mEq/L', referenceRange: '3.5-5.0', flag: 'Critical High', previousValue: 4.8 },
  ]
};

const mockQcCharts: QCChart[] = [
  {
    parameterName: 'Potassium Control Level 1',
    analyzerId: 'Roche-Cobas-1',
    dataPoints: [
      { date: 'Day 1', value: 4.0, mean: 4.0, sd1: 4.2, sd2: 4.4, sd3: 4.6, status: 'Pass' },
      { date: 'Day 2', value: 4.1, mean: 4.0, sd1: 4.2, sd2: 4.4, sd3: 4.6, status: 'Pass' },
      { date: 'Day 3', value: 4.3, mean: 4.0, sd1: 4.2, sd2: 4.4, sd3: 4.6, status: 'Warning' },
      { date: 'Day 4', value: 4.7, mean: 4.0, sd1: 4.2, sd2: 4.4, sd3: 4.6, status: 'Fail' },
    ]
  }
];

const mockInstruments: AnalyzerInstrument[] = [
  { id: 'Roche-Cobas-1', name: 'Cobas c501 (Main Line)', status: 'Operational', samplesProcessedToday: 450, lastCalibration: new Date(Date.now() - 86400000).toISOString(), reagentLevels: 45 },
  { id: 'Beckman-AU', name: 'Beckman AU680 (Stat)', status: 'Maintenance Required', samplesProcessedToday: 120, lastCalibration: new Date(Date.now() - 432000000).toISOString(), reagentLevels: 12 },
];

const mockAlerts: BiochemAlert[] = [
  { id: 'ALT-BC-1', sampleId: 'BC-2034', type: 'Critical Value', severity: 'critical', timestamp: new Date(Date.now() - 1000).toISOString(), status: 'Active', message: 'Potassium critically high (6.2 mEq/L).' },
  { id: 'ALT-BC-2', analyzerId: 'Roche-Cobas-1', type: 'QC Failure', severity: 'critical', timestamp: new Date(Date.now() - 1800000).toISOString(), status: 'Active', message: 'Potassium Control L1 exceeded +3SD. Recalibration required.' },
];

export const biochemistryApi = {
  getDashboardSummary: async (filters: BiochemFilters) => ({
    data: {
      kpis: mockKpis,
      samples: mockSamples,
      activeSample: mockSamples[0],
      activeResult: mockTestResult,
      qcCharts: mockQcCharts,
      instruments: mockInstruments,
      alerts: mockAlerts,
    } as BiochemDashboardData,
    message: 'Success', status: 200,
  }),

  validateResult: async (sampleId: string) => ({ data: { success: true }, message: `Results validated for ${sampleId}`, status: 200 }),
  calibrateInstrument: async (analyzerId: string) => ({ data: { success: true }, message: `Calibration sequence initiated for ${analyzerId}`, status: 200 }),
  acknowledgeAlert: async (alertId: string) => ({ data: { success: true }, message: 'Alert acknowledged', status: 200 }),
};
