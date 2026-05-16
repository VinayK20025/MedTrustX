import type { DataAnalystData } from '../types/analyst.types';

const t = (sec: number) => new Date(Date.now() + sec * 1000).toISOString();

// Generate 8 months of trend data
const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];

const mockData: DataAnalystData = {
  metrics: {
    patientsThisMonth: 4842,
    revenueThisMonth: 182.4,
    bedOccupancy: 87,
    avgLOS: 4.2,
    readmissionRate: 3.8,
    netPromoterScore: 71,
  },
  kpis: [
    { id: 'K01', label: 'Total Admissions', value: '4,842', change: 8.2, trend: 'up', positive: true, category: 'Clinical' },
    { id: 'K02', label: 'Revenue (₹ Lakh)', value: '182.4', change: 12.4, trend: 'up', positive: true, category: 'Financial' },
    { id: 'K03', label: 'Bed Occupancy', value: '87%', change: 4.1, trend: 'up', positive: false, category: 'Operational' },
    { id: 'K04', label: 'Avg Length of Stay', value: '4.2d', change: -0.3, trend: 'down', positive: true, category: 'Clinical' },
    { id: 'K05', label: 'Readmission Rate', value: '3.8%', change: 0.6, trend: 'up', positive: false, category: 'Quality' },
    { id: 'K06', label: 'Net Promoter Score', value: '71', change: 5.0, trend: 'up', positive: true, category: 'Quality' },
    { id: 'K07', label: 'OT Utilization', value: '78%', change: -2.0, trend: 'down', positive: false, category: 'Operational' },
    { id: 'K08', label: 'Lab TAT (avg)', value: '2.8h', change: -0.4, trend: 'down', positive: true, category: 'Operational' },
  ],
  datasets: [
    { id: 'DS-001', name: 'Patient Encounters', source: 'Epic EHR', category: 'Clinical', sizeRows: 4_820_000, lastRefreshed: t(-3600), status: 'Active', refreshSchedule: 'Daily' },
    { id: 'DS-002', name: 'Billing Transactions', source: 'Billing System', category: 'Financial', sizeRows: 1_240_000, lastRefreshed: t(-7200), status: 'Active', refreshSchedule: 'Hourly' },
    { id: 'DS-003', name: 'Lab Results', source: 'Cobas LIS', category: 'Clinical', sizeRows: 840_000, lastRefreshed: t(-600), status: 'Active', refreshSchedule: 'Real-time' },
    { id: 'DS-004', name: 'Insurance Claims', source: 'Insurance Gateway', category: 'Financial', sizeRows: 312_000, lastRefreshed: t(-86400), status: 'Stale', refreshSchedule: 'Daily' },
    { id: 'DS-005', name: 'Operational Metrics', source: 'HIMS', category: 'Operational', sizeRows: 120_000, lastRefreshed: t(-1800), status: 'Active', refreshSchedule: 'Hourly' },
    { id: 'DS-006', name: 'Quality Indicators', source: 'Quality Mgmt System', category: 'Quality', sizeRows: 48_000, lastRefreshed: t(-21600), status: 'Active', refreshSchedule: 'Daily' },
  ],
  trends: [
    { id: 'TR-001', label: 'Monthly Admissions', unit: 'patients', color: '#6366f1', points: months.map((m, i) => ({ period: m, value: 3800 + i * 120 + Math.floor(Math.random() * 200 - 100) })) },
    { id: 'TR-002', label: 'Revenue (₹ Lakh)', unit: '₹L', color: '#14b8a6', points: months.map((m, i) => ({ period: m, value: 140 + i * 6 + Math.floor(Math.random() * 10 - 5) })) },
    { id: 'TR-003', label: 'Bed Occupancy %', unit: '%', color: '#f59e0b', points: months.map((m, i) => ({ period: m, value: 78 + i * 1.2 + Math.floor(Math.random() * 4 - 2) })) },
    { id: 'TR-004', label: 'Readmission Rate %', unit: '%', color: '#f43f5e', points: months.map((m, i) => ({ period: m, value: +(4.8 - i * 0.15 + Math.random() * 0.3 - 0.15).toFixed(1) })) },
  ],
  insights: [
    { id: 'INS-001', title: 'ICU capacity at critical threshold (87% occupancy)', description: 'ICU bed occupancy has been above 85% for 14 consecutive days, creating patient overflow risk.', category: 'Operational', severity: 'Critical', impact: 'Patient safety risk — inability to accept new critical admissions', recommendation: 'Activate step-down protocol, review discharge criteria, consider temporary capacity expansion.', detectedAt: t(-3600), status: 'New' },
    { id: 'INS-002', title: 'Readmission spike in Cardiac ward (+0.6%)', description: 'Cardiac ward readmissions increased from 3.2% to 3.8% over 3 months — above NABH 4% threshold approaching.', category: 'Quality', severity: 'High', impact: 'Quality indicator breach risk; potential payment penalties from insurers', recommendation: 'Review post-discharge follow-up protocol. Strengthen patient education on medication adherence.', detectedAt: t(-7200), status: 'New' },
    { id: 'INS-003', title: 'Revenue grew 12.4% MoM — driven by surgical cases', description: 'Surgical revenue up 18% from last month, primarily from orthopedic and cardiac procedures.', category: 'Financial', severity: 'Positive', impact: 'Strong financial performance; supports capex planning for next quarter', recommendation: 'Allocate additional OT slots for high-margin surgical procedures.', detectedAt: t(-14400), status: 'Reviewed' },
    { id: 'INS-004', title: 'Lab TAT improved by 0.4h — reagent quality impact', description: 'Lab turnaround time dropped from 3.2h to 2.8h following reagent change in hematology.', category: 'Quality', severity: 'Positive', impact: 'Faster clinical decisions; improved patient throughput', recommendation: 'Extend same reagent brand to microbiology section.', detectedAt: t(-28800), status: 'Action Taken' },
    { id: 'INS-005', title: 'Insurance claim rejections up 8% — ICD coding issues', description: 'Primary insurer Medi Assist rejected 8% more claims citing ICD-10 coding mismatches.', category: 'Financial', severity: 'High', impact: '₹14.2 Lakh revenue at risk in pending claims', recommendation: 'Conduct coding audit. Retrain clinical coding team on ICD-10-CM specificity.', detectedAt: t(-43200), status: 'New' },
  ],
  reports: [
    { id: 'RPT-001', title: 'Monthly Clinical Dashboard — April 2026', category: 'Clinical', status: 'Ready', scheduledAt: t(-86400), generatedAt: t(-3600), format: 'PDF', recipients: 12 },
    { id: 'RPT-002', title: 'Financial Performance Report — Q1 2026', category: 'Financial', status: 'Ready', scheduledAt: t(-172800), generatedAt: t(-86400), format: 'Excel', recipients: 8 },
    { id: 'RPT-003', title: 'NABH Quality Indicators — April 2026', category: 'Quality', status: 'Generating', scheduledAt: t(-1800), format: 'PDF', recipients: 6 },
    { id: 'RPT-004', title: 'Bed Occupancy & LOS Weekly Report', category: 'Operational', status: 'Scheduled', scheduledAt: t(86400), format: 'PDF', recipients: 5 },
    { id: 'RPT-005', title: 'Insurance Claims Rejection Analysis', category: 'Financial', status: 'Ready', scheduledAt: t(-43200), generatedAt: t(-21600), format: 'Excel', recipients: 4 },
  ],
  admissionsByDept: [
    { label: 'General Medicine', value: 1240, color: '#6366f1' },
    { label: 'Cardiology', value: 840, color: '#f43f5e' },
    { label: 'Orthopedics', value: 720, color: '#14b8a6' },
    { label: 'Obstetrics', value: 620, color: '#f59e0b' },
    { label: 'Neurology', value: 480, color: '#a855f7' },
    { label: 'Pediatrics', value: 420, color: '#3b82f6' },
    { label: 'ICU', value: 320, color: '#ef4444' },
    { label: 'Others', value: 202, color: '#6b7280' },
  ],
  revenueByPayer: [
    { label: 'Insurance (Private)', value: 42, color: '#6366f1' },
    { label: 'Self-Pay (Cash)', value: 28, color: '#14b8a6' },
    { label: 'Govt / Ayushman', value: 18, color: '#f59e0b' },
    { label: 'Corporate', value: 9, color: '#a855f7' },
    { label: 'TPA / Others', value: 3, color: '#6b7280' },
  ],
};

export const analystApi = {
  getData: async () => ({ data: mockData, message: 'Success', status: 200 }),
  generateReport: async (id: string) => ({ data: { success: true }, message: 'Report generation queued', status: 200 }),
  markInsightReviewed: async (id: string) => ({ data: { success: true }, message: 'Insight marked reviewed', status: 200 }),
};
