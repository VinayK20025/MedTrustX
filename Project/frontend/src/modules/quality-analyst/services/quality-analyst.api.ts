import type { QualityAnalystData } from '../types/quality-analyst.types';

export interface QaFilters { dateRange?: string; department?: string; }

const mockData: QualityAnalystData = {
  kpis: [
    { id: '1', label: 'Overall Compliance', value: '92%', trend: 'up', trendValue: '+2.1%', status: 'success' },
    { id: '2', label: 'Infection Rate', value: '1.8%', trend: 'up', trendValue: '+0.4%', status: 'warning' },
    { id: '3', label: 'Safety Incidents', value: 14, trend: 'down', trendValue: '-3', status: 'success' },
    { id: '4', label: 'Data Accuracy', value: '98.5%', trend: 'flat', trendValue: '0%', status: 'success' },
  ],
  sources: [
    { id: 'DS-01', name: 'EHR Clinical Data', type: 'EHR', status: 'Connected', lastSync: new Date(Date.now() - 300000).toISOString(), recordCount: 142500 },
    { id: 'DS-02', name: 'Microbiology LIS', type: 'Lab', status: 'Delayed', lastSync: new Date(Date.now() - 14400000).toISOString(), recordCount: 28400 },
    { id: 'DS-03', name: 'Field Audits', type: 'Audits', status: 'Connected', lastSync: new Date(Date.now() - 60000).toISOString(), recordCount: 3150 },
    { id: 'DS-04', name: 'Incident Tracker', type: 'Incidents', status: 'Connected', lastSync: new Date(Date.now() - 120000).toISOString(), recordCount: 890 },
  ],
  insights: [
    {
      id: 'IN-01', type: 'Anomaly', metric: 'SSI Rate', severity: 'Critical',
      description: 'Surgical Site Infections (SSI) in OT-3 spiked 14% over baseline in the last 72 hours.',
      recommendation: 'Audit OT-3 sterilization logs and suspend elective surgeries in OT-3 pending review.',
      detectedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'IN-02', type: 'Risk', metric: 'Hand Hygiene', severity: 'High',
      description: 'Hand hygiene compliance in ICU night shift has dropped below 70% threshold.',
      recommendation: 'Schedule targeted training and increase random audits during 23:00 - 07:00 shift.',
      detectedAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: 'IN-03', type: 'Opportunity', metric: 'Discharge Time', severity: 'Medium',
      description: 'Ward B average discharge time improved by 45 minutes after new checklist implementation.',
      recommendation: 'Standardize Ward B discharge checklist across all inpatient wards.',
      detectedAt: new Date(Date.now() - 259200000).toISOString(),
    },
  ],
  comparisons: [
    { id: 'C-01', department: 'ICU', score: 88, incidentRate: 2.1, complianceRate: 91, status: 'Average' },
    { id: 'C-02', department: 'Surgical (OT)', score: 76, incidentRate: 3.4, complianceRate: 82, status: 'Below Target' },
    { id: 'C-03', department: 'Maternity', score: 95, incidentRate: 0.5, complianceRate: 98, status: 'Above Average' },
    { id: 'C-04', department: 'ER', score: 84, incidentRate: 4.2, complianceRate: 86, status: 'Average' },
  ],
  trends: [
    { date: 'Mon', infectionRate: 1.2, safetyIncidents: 4, complianceScore: 92 },
    { date: 'Tue', infectionRate: 1.3, safetyIncidents: 2, complianceScore: 94 },
    { date: 'Wed', infectionRate: 1.5, safetyIncidents: 5, complianceScore: 90 },
    { date: 'Thu', infectionRate: 1.8, safetyIncidents: 3, complianceScore: 91 },
    { date: 'Fri', infectionRate: 2.1, safetyIncidents: 6, complianceScore: 88 },
    { date: 'Sat', infectionRate: 2.0, safetyIncidents: 2, complianceScore: 89 },
    { date: 'Sun', infectionRate: 1.8, safetyIncidents: 1, complianceScore: 92 },
  ],
};

export const qualityAnalystApi = {
  getDashboardSummary: async (f: QaFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  generateReport: async (type: string) => ({ data: { success: true, link: '#' }, message: `Report generated: ${type}`, status: 200 }),
  triggerValidation: async (sourceId: string) => ({ data: { success: true }, message: 'Data validation triggered', status: 200 }),
  dismissInsight: async (insightId: string) => ({ data: { success: true }, message: 'Insight dismissed', status: 200 }),
  flagAnomaly: async (insightId: string) => ({ data: { success: true }, message: 'Anomaly escalated to Quality Manager', status: 200 }),
};
