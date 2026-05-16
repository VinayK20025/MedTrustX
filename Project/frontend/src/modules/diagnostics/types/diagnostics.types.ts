export interface DiagnosticResult {
  id: string;
  patientId: string;
  patientName: string;
  type: 'lab' | 'imaging';
  testName: string;
  value?: string;
  unit?: string;
  referenceRange?: string;
  status: 'pending' | 'completed' | 'critical';
  reportUrl?: string;
  orderedBy: string;
  timestamp: string;
}

export interface DiagnosticsFilters {
  patientId?: string;
  type?: string;
  status?: string;
}
