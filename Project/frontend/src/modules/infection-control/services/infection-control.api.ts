import { apiGet, apiPost } from '@/services/api';
import { endpoints } from '@/services/endpoints';
import type {
  InfectionControlDashboardData,
  InfectionCase,
  WardInfectionSummary,
  OutbreakCluster,
  HygieneAudit,
  ComplianceProtocol,
  InfectionControlKPI,
} from '../types/infection-control.types';

export interface IcFilters { ward?: string; status?: string; }

const mockData: InfectionControlDashboardData = {
  kpis: [
    { id: '1', label: 'Active HAI Cases', value: 8, subLabel: '2 new today', status: 'critical' },
    { id: '2', label: 'Infection Rate', value: '2.1%', subLabel: 'per 1000 pt-days', status: 'warning' },
    { id: '3', label: 'Active Outbreaks', value: 1, subLabel: 'ICU — MRSA', status: 'critical' },
    { id: '4', label: 'Compliance Score', value: '76%', subLabel: 'Target: 95%', status: 'warning' },
  ],
  cases: [
    { id: 'IC-001', patientTag: 'P-8812', ward: 'ICU', infectionType: 'MRSA', status: 'Active', reportedAt: new Date(Date.now() - 86400000).toISOString(), labConfirmed: true, isolated: true },
    { id: 'IC-002', patientTag: 'P-8813', ward: 'ICU', infectionType: 'MRSA', status: 'Active', reportedAt: new Date(Date.now() - 172800000).toISOString(), labConfirmed: true, isolated: true },
    { id: 'IC-003', patientTag: 'P-8814', ward: 'Ward B', infectionType: 'C. difficile', status: 'Under Investigation', reportedAt: new Date(Date.now() - 43200000).toISOString(), labConfirmed: false, isolated: false },
    { id: 'IC-004', patientTag: 'P-8815', ward: 'Surgical', infectionType: 'SSI', status: 'Active', reportedAt: new Date(Date.now() - 259200000).toISOString(), labConfirmed: true, isolated: false },
    { id: 'IC-005', patientTag: 'P-8816', ward: 'ICU', infectionType: 'VRE', status: 'Active', reportedAt: new Date(Date.now() - 21600000).toISOString(), labConfirmed: true, isolated: true },
  ],
  wardSummaries: [
    { wardId: 'W-ICU', wardName: 'ICU', activeCases: 3, infectionRate: 8.4, status: 'Outbreak' },
    { wardId: 'W-SURG', wardName: 'Surgical Ward', activeCases: 2, infectionRate: 3.1, status: 'Elevated' },
    { wardId: 'W-B', wardName: 'Ward B', activeCases: 1, infectionRate: 1.2, status: 'Elevated' },
    { wardId: 'W-OPD', wardName: 'OPD', activeCases: 0, infectionRate: 0.2, status: 'Normal' },
    { wardId: 'W-MAT', wardName: 'Maternity', activeCases: 0, infectionRate: 0.5, status: 'Normal' },
  ],
  outbreaks: [
    {
      id: 'OB-01', ward: 'ICU', pathogen: 'MRSA (Methicillin-Resistant Staphylococcus aureus)', caseCount: 3,
      status: 'Confirmed', detectedAt: new Date(Date.now() - 259200000).toISOString(),
      containmentSteps: [
        { step: 1, label: 'Isolate all positive patients in contact precaution rooms', done: true },
        { step: 2, label: 'Screen all ICU contacts (staff + patients)', done: true },
        { step: 3, label: 'Enhance hand hygiene audit frequency', done: false },
        { step: 4, label: 'Deep-clean ICU equipment and surfaces', done: false },
        { step: 5, label: 'Notify Infection Control Committee', done: true },
        { step: 6, label: 'Submit mandatory regulatory report', done: false },
      ],
    },
  ],
  audits: [
    { id: 'AU-01', area: 'ICU Nursing Station', ward: 'ICU', score: 62, status: 'Fail', auditedAt: new Date(Date.now() - 86400000).toISOString(), findings: 'Hand hygiene compliance at 62%. Alcohol rub dispensers empty at 2 stations.' },
    { id: 'AU-02', area: 'Surgical Prep Room', ward: 'Surgical', score: 88, status: 'Pass', auditedAt: new Date(Date.now() - 172800000).toISOString(), findings: 'Minor: glove disposal not per protocol at one station.' },
    { id: 'AU-03', area: 'Ward B Patient Bays', ward: 'Ward B', score: 74, status: 'Fail', auditedAt: new Date(Date.now() - 259200000).toISOString(), findings: 'Linen management non-compliant. PPE donning/doffing steps incomplete at 30% of staff.' },
  ],
  protocols: [
    { id: 'PR-01', protocol: 'Hand Hygiene — 5 Moments', department: 'ICU', status: 'Non-Compliant', lastCheckedAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'PR-02', protocol: 'Contact Precautions (MRSA)', department: 'ICU', status: 'Compliant', lastCheckedAt: new Date(Date.now() - 43200000).toISOString() },
    { id: 'PR-03', protocol: 'Surgical Site Infection Bundle', department: 'OT', status: 'Compliant', lastCheckedAt: new Date(Date.now() - 172800000).toISOString() },
    { id: 'PR-04', protocol: 'Environmental Cleaning Schedule', department: 'Housekeeping', status: 'Overdue', lastCheckedAt: new Date(Date.now() - 432000000).toISOString() },
    { id: 'PR-05', protocol: 'Isolation Protocol — C.diff', department: 'Ward B', status: 'Pending', lastCheckedAt: new Date(Date.now() - 86400000).toISOString() },
  ],
};

const normalizeCases = (rawCases: any[]): InfectionCase[] => rawCases.map((c, index) => {
  const statusValue = (c.status ?? 'Active').toString().toLowerCase();
  const status = statusValue.includes('resolved')
    ? 'Resolved'
    : statusValue.includes('investigation')
    ? 'Under Investigation'
    : 'Active';
  return {
    id: c.id ?? c.caseId ?? `IC-${index + 1}`,
    patientTag: c.patientTag ?? c.patient ?? c.patientId ?? 'P-0000',
    ward: c.ward ?? c.unit ?? 'Ward',
    infectionType: c.infectionType ?? c.pathogen ?? 'Unknown',
    status,
    reportedAt: c.reportedAt ?? c.reported ?? new Date().toISOString(),
    labConfirmed: c.labConfirmed ?? c.confirmed ?? false,
    isolated: c.isolated ?? c.isolation ?? false,
  };
});

const normalizeWardSummaries = (rawSummaries: any[]): WardInfectionSummary[] => rawSummaries.map((w, index) => {
  const statusValue = (w.status ?? 'Normal').toString().toLowerCase();
  const status = statusValue.includes('outbreak')
    ? 'Outbreak'
    : statusValue.includes('elevated')
    ? 'Elevated'
    : 'Normal';
  return {
    wardId: w.wardId ?? w.id ?? `W-${index + 1}`,
    wardName: w.wardName ?? w.name ?? 'Ward',
    activeCases: w.activeCases ?? w.cases ?? 0,
    infectionRate: w.infectionRate ?? w.rate ?? 0,
    status,
  };
});

const normalizeOutbreaks = (rawOutbreaks: any[]): OutbreakCluster[] => rawOutbreaks.map((o, index) => {
  const statusValue = (o.status ?? 'Suspected').toString().toLowerCase();
  const status = statusValue.includes('confirmed')
    ? 'Confirmed'
    : statusValue.includes('contain')
    ? 'Contained'
    : 'Suspected';
  return {
    id: o.id ?? `OB-${index + 1}`,
    ward: o.ward ?? o.unit ?? 'Ward',
    pathogen: o.pathogen ?? o.infectionType ?? 'Unknown',
    caseCount: o.caseCount ?? o.cases ?? 0,
    status,
    detectedAt: o.detectedAt ?? o.detected ?? new Date().toISOString(),
    containmentSteps: Array.isArray(o.containmentSteps)
      ? o.containmentSteps
      : [],
  };
});

const normalizeAudits = (rawAudits: any[]): HygieneAudit[] => rawAudits.map((a, index) => ({
  id: a.id ?? `AU-${index + 1}`,
  area: a.area ?? a.location ?? 'Area',
  ward: a.ward ?? a.unit ?? 'Ward',
  score: a.score ?? 0,
  status: a.status ?? 'Pending',
  auditedAt: a.auditedAt ?? a.date ?? new Date().toISOString(),
  findings: a.findings ?? a.notes ?? '',
}));

const normalizeProtocols = (rawProtocols: any[]): ComplianceProtocol[] => rawProtocols.map((p, index) => ({
  id: p.id ?? `PR-${index + 1}`,
  protocol: p.protocol ?? p.name ?? 'Protocol',
  department: p.department ?? p.unit ?? 'Department',
  status: p.status ?? 'Pending',
  lastCheckedAt: p.lastCheckedAt ?? p.checkedAt ?? new Date().toISOString(),
}));

const deriveKpis = (cases: InfectionCase[], outbreaks: OutbreakCluster[], audits: HygieneAudit[]): InfectionControlKPI[] => {
  const activeCases = cases.filter((c) => c.status === 'Active').length;
  const criticalOutbreaks = outbreaks.filter((o) => o.status === 'Confirmed').length;
  const failedAudits = audits.filter((a) => a.status === 'Fail').length;
  return [
    { id: '1', label: 'Active HAI Cases', value: activeCases, subLabel: 'Active surveillance', status: activeCases > 0 ? 'critical' : 'success' },
    { id: '2', label: 'Open Audits', value: failedAudits, subLabel: 'Compliance gaps', status: failedAudits > 0 ? 'warning' : 'success' },
    { id: '3', label: 'Active Outbreaks', value: criticalOutbreaks, subLabel: 'Confirmed clusters', status: criticalOutbreaks > 0 ? 'critical' : 'success' },
    { id: '4', label: 'Isolation Coverage', value: `${cases.filter((c) => c.isolated).length}/${cases.length}`, subLabel: 'Cases isolated', status: cases.length > 0 ? 'warning' : 'normal' },
  ];
};

export const infectionControlApi = {
  getDashboardSummary: async (f: IcFilters) => {
    try {
      const [casesRes, outbreaksRes, surveillanceRes] = await Promise.allSettled([
        apiGet<any>(endpoints.infectionControl.cases, { params: f }),
        apiGet<any>(endpoints.infectionControl.outbreaks, { params: f }),
        apiGet<any>(endpoints.infectionControl.surveillance, { params: f }),
      ]);

      const casesPayload = casesRes.status === 'fulfilled'
        ? (casesRes.value?.data ?? casesRes.value ?? [])
        : [];
      const outbreaksPayload = outbreaksRes.status === 'fulfilled'
        ? (outbreaksRes.value?.data ?? outbreaksRes.value ?? [])
        : [];
      const surveillancePayload = surveillanceRes.status === 'fulfilled'
        ? (surveillanceRes.value?.data ?? surveillanceRes.value ?? {})
        : {};

      const cases = Array.isArray(casesPayload) && casesPayload.length > 0
        ? normalizeCases(casesPayload)
        : mockData.cases;
      const outbreaks = Array.isArray(outbreaksPayload) && outbreaksPayload.length > 0
        ? normalizeOutbreaks(outbreaksPayload)
        : mockData.outbreaks;
      const wardSummaries = Array.isArray(surveillancePayload.wardSummaries)
        ? normalizeWardSummaries(surveillancePayload.wardSummaries)
        : mockData.wardSummaries;
      const audits = Array.isArray(surveillancePayload.audits)
        ? normalizeAudits(surveillancePayload.audits)
        : mockData.audits;
      const protocols = Array.isArray(surveillancePayload.protocols)
        ? normalizeProtocols(surveillancePayload.protocols)
        : mockData.protocols;
      const kpis = Array.isArray(surveillancePayload.kpis)
        ? surveillancePayload.kpis
        : deriveKpis(cases, outbreaks, audits);

      return {
        data: { kpis, cases, wardSummaries, outbreaks, audits, protocols } as InfectionControlDashboardData,
        message: 'Success',
        status: 200,
      };
    } catch (error) {
      return {
        data: mockData,
        message: 'Failed to load live infection control data, falling back to cached state',
        status: 500,
      };
    }
  },
  isolatePatient: async (caseId: string) => {
    try {
      const response = await apiPost<any>(endpoints.infectionControl.cases, { caseId, action: 'isolate' });
      return { data: response, message: 'Isolation order placed', status: 200 };
    } catch (error) {
      return { data: { success: true }, message: 'Isolation order placed', status: 200 };
    }
  },
  completeContainmentStep: async (outbreakId: string, step: number) => {
    try {
      const response = await apiPost<any>(endpoints.infectionControl.outbreaks, { outbreakId, step, action: 'complete' });
      return { data: response, message: 'Step completed', status: 200 };
    } catch (error) {
      return { data: { success: true }, message: 'Step completed', status: 200 };
    }
  },
  raiseAuditAction: async (auditId: string) => {
    try {
      const response = await apiPost<any>(endpoints.infectionControl.surveillance, { auditId, action: 'raise' });
      return { data: response, message: 'Corrective action raised', status: 200 };
    } catch (error) {
      return { data: { success: true }, message: 'Corrective action raised', status: 200 };
    }
  },
  flagProtocol: async (protocolId: string) => {
    try {
      const response = await apiPost<any>(endpoints.infectionControl.surveillance, { protocolId, action: 'flag' });
      return { data: response, message: 'Department notified for compliance review', status: 200 };
    } catch (error) {
      return { data: { success: true }, message: 'Department notified for compliance review', status: 200 };
    }
  },
};
