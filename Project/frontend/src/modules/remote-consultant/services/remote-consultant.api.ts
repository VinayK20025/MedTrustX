import type { ConsultantData } from '../types/remote-consultant.types';

export interface RcFilters { status?: string; priority?: string; }

const mockData: ConsultantData = {
  kpis: [
    { id: '1', label: 'Pending Cases', value: 5, status: 'warning' },
    { id: '2', label: 'Reviewed Today', value: 8, status: 'success' },
    { id: '3', label: 'Urgent Queue', value: 2, status: 'critical' },
    { id: '4', label: 'Avg Response', value: '1.8h', status: 'success' },
  ],
  cases: [
    {
      id: 'CSE-401', patientName: 'David Okonkwo', age: 58, gender: 'M',
      referredBy: 'Dr. S. Mehta (Cardiology)', specialty: 'Interventional Cardiology',
      priority: 'Urgent', status: 'Pending',
      summary: 'Triple-vessel CAD on angiography. EF 35%. Diabetes + CKD Stage 3. Evaluate for CABG vs PCI suitability.',
      receivedAt: new Date(Date.now() - 3600000).toISOString(),
      reports: [
        { id: 'r1', type: 'Radiology', title: 'Coronary Angiogram', date: '2024-04-20', highlight: 'LAD 90% proximal, RCA 80%, LCx 70%' },
        { id: 'r2', type: 'Lab', title: 'Renal Function Panel', date: '2024-04-19', highlight: 'GFR 42 mL/min' },
        { id: 'r3', type: 'Clinical Notes', title: 'Cardiology Consult Note', date: '2024-04-20' },
      ]
    },
    {
      id: 'CSE-402', patientName: 'Lina Johansson', age: 31, gender: 'F',
      referredBy: 'Dr. A. Patel (Neurology)', specialty: 'Neuro-Oncology',
      priority: 'High', status: 'In Review',
      summary: 'Recurrent GBM post-temozolomide. MRI shows progression. Evaluate for re-resection vs immunotherapy trial eligibility.',
      receivedAt: new Date(Date.now() - 14400000).toISOString(),
      reports: [
        { id: 'r4', type: 'Radiology', title: 'Brain MRI (Contrast)', date: '2024-04-18', highlight: 'Enhancing lesion 3.2cm right frontal' },
        { id: 'r5', type: 'Pathology', title: 'Tumor Molecular Profile', date: '2024-03-15', highlight: 'MGMT unmethylated, IDH wildtype' },
      ]
    },
    {
      id: 'CSE-403', patientName: 'Amir Khalil', age: 72, gender: 'M',
      referredBy: 'Dr. R. Gupta (Pulmonology)', specialty: 'Pulmonary Medicine',
      priority: 'Routine', status: 'Pending',
      summary: 'Chronic ILD with progressive dyspnea. HRCT shows UIP pattern. Evaluate for antifibrotic therapy.',
      receivedAt: new Date(Date.now() - 86400000).toISOString(),
      reports: [
        { id: 'r6', type: 'Radiology', title: 'HRCT Chest', date: '2024-04-15' },
        { id: 'r7', type: 'Lab', title: 'Pulmonary Function Test', date: '2024-04-14', highlight: 'FVC 52% predicted' },
      ]
    },
  ]
};

export const remoteConsultantApi = {
  getDashboardSummary: async (f: RcFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  submitOpinion: async (caseId: string, opinion: any) => ({ data: { success: true }, message: 'Expert opinion submitted and shared with referring physician', status: 200 }),
  requestMoreInfo: async (caseId: string, message: string) => ({ data: { success: true }, message: 'Information request sent', status: 200 }),
};
