import type { InformaticistData } from '../types/informaticist.types';

const t = (sec: number) => new Date(Date.now() + sec * 1000).toISOString();

const mockData: InformaticistData = {
  metrics: {
    dataCompleteness: 96.4,
    alertAccuracy: 98.2,
    clinicianSatisfaction: 85,
    activeWorkflows: 42,
    standardizationRate: 94.8,
    cdssFiredToday: 1450,
  },
  workflows: [
    { id: 'WF-001', name: 'Emergency Admission', department: 'ER', steps: ['Triage', 'Initial Assessment', 'Order Labs', 'Bed Allocation'], status: 'Active', adoptionRate: 98, avgTimeSavedMins: 12, lastUpdated: t(-86400 * 5) },
    { id: 'WF-002', name: 'Sepsis Protocol', department: 'ICU', steps: ['Alert Trigger', 'Lactate Draw', 'Blood Culture', 'Broad-spectrum Abx', 'Fluid Resuscitation'], status: 'Active', adoptionRate: 92, avgTimeSavedMins: 25, lastUpdated: t(-86400 * 12) },
    { id: 'WF-003', name: 'Pre-Op Checklist', department: 'Surgery', steps: ['Patient ID', 'Consent Verification', 'Site Marking', 'Anesthesia Review'], status: 'Active', adoptionRate: 99, avgTimeSavedMins: 8, lastUpdated: t(-86400 * 20) },
    { id: 'WF-004', name: 'Discharge Planning', department: 'General Ward', steps: ['Medication Rec', 'Follow-up Booking', 'Patient Edu', 'Summary Generation'], status: 'Draft', adoptionRate: 0, avgTimeSavedMins: 0, lastUpdated: t(-3600 * 2) },
  ],
  standardizationRules: [
    { id: 'STD-1', field: 'Primary Diagnosis', codeSystem: 'ICD-10', complianceRate: 98.5, mappingErrors: 12 },
    { id: 'STD-2', field: 'Lab Results', codeSystem: 'LOINC', complianceRate: 95.2, mappingErrors: 45 },
    { id: 'STD-3', field: 'Clinical Findings', codeSystem: 'SNOMED CT', complianceRate: 91.8, mappingErrors: 128 },
    { id: 'STD-4', field: 'Medication Orders', codeSystem: 'RxNorm', complianceRate: 99.1, mappingErrors: 3 },
  ],
  cdssRules: [
    { id: 'CDSS-1', name: 'High-Risk Drug Interaction', description: 'Alerts when co-prescribing contraindicating medications', type: 'Drug Interaction', status: 'Active', alertsFiredToday: 142, overrideRate: 15 },
    { id: 'CDSS-2', name: 'Early Sepsis Warning', description: 'Combines vitals and labs to flag sepsis risk early', type: 'Sepsis Alert', status: 'Active', alertsFiredToday: 38, overrideRate: 8 },
    { id: 'CDSS-3', name: 'Hypoglycemia Protocol', description: 'Triggers treatment pathway when blood glucose drops', type: 'Abnormal Vitals', status: 'Testing', alertsFiredToday: 0, overrideRate: 0 },
    { id: 'CDSS-4', name: 'Post-Op DVT Prophylaxis', description: 'Reminds to prescribe DVT prophylaxis for surgical patients', type: 'Care Pathway', status: 'Active', alertsFiredToday: 215, overrideRate: 22 },
  ],
  qualityMetrics: [
    { id: 'QM-1', metric: 'EHR Data Completeness', score: 96.4, status: 'Excellent', trend: 'up' },
    { id: 'QM-2', metric: 'Allergy Documentation', score: 99.2, status: 'Excellent', trend: 'flat' },
    { id: 'QM-3', metric: 'Social Determinants of Health', score: 45.8, status: 'Needs Improvement', trend: 'up' },
    { id: 'QM-4', metric: 'Problem List Maintenance', score: 72.5, status: 'Good', trend: 'down' },
  ],
  uxMetrics: [
    { id: 'UX-1', taskName: 'Admit Patient', avgClicks: 14, avgTimeMins: 3.5, errorRate: 2.1, satisfactionScore: 8.5 },
    { id: 'UX-2', taskName: 'Order Basic Metabolic Panel', avgClicks: 8, avgTimeMins: 1.2, errorRate: 0.5, satisfactionScore: 9.0 },
    { id: 'UX-3', taskName: 'Complete Discharge Summary', avgClicks: 42, avgTimeMins: 14.5, errorRate: 8.4, satisfactionScore: 5.5 },
    { id: 'UX-4', taskName: 'Acknowledge Critical Lab', avgClicks: 3, avgTimeMins: 0.5, errorRate: 0.1, satisfactionScore: 9.5 },
  ],
  alerts: [
    { id: 'ALT-1', title: 'High Override Rate Detected', description: 'CDSS Rule "Post-Op DVT Prophylaxis" has an override rate of 22%. Review for alert fatigue.', severity: 'Warning', timestamp: t(-3600), actionRequired: true },
    { id: 'ALT-2', title: 'Mapping Error Spike', description: 'SNOMED CT mapping errors increased by 15% in the Cardiology department today.', severity: 'Critical', timestamp: t(-7200), actionRequired: true },
    { id: 'ALT-3', title: 'New Workflow Published', description: '"Sepsis Protocol v2" is now live in the ICU.', severity: 'Info', timestamp: t(-86400), actionRequired: false },
  ],
};

export const informaticistApi = {
  getData: async () => ({ data: mockData, message: 'Success', status: 200 }),
  dismissAlert: async (id: string) => ({ data: { success: true }, message: 'Alert dismissed', status: 200 }),
  tuneCDSSRule: async (id: string) => ({ data: { success: true }, message: 'CDSS rule tuning initiated', status: 200 }),
};
