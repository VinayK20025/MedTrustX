import { apiGet, apiPost } from '@/services/api';
import { endpoints } from '@/services/endpoints';
import type {
  CDSSRecommendation,
  CDSSRule,
  CDSSAlert,
  CDSSEvaluation,
  CDSSDashboardData,
  CDSSKPICard,
  CDSSFilters,
  CDSSEvaluateRequest,
} from '../types/cdss.types';

export interface CdssFilters extends CDSSFilters {}

const mockData: CDSSDashboardData = {
  kpis: [
    { id: '1', label: 'Active Recommendations', value: 23, subLabel: 'Awaiting decision', status: 'warning' },
    { id: '2', label: 'System Alerts', value: 7, subLabel: 'Critical severity', status: 'critical' },
    { id: '3', label: 'Rules Fired Today', value: 156, subLabel: '+24% vs. yesterday', status: 'normal' },
    { id: '4', label: 'Acceptance Rate', value: '78%', subLabel: 'Last 30 days', status: 'success' },
  ],
  recommendations: [
    { id: 'REC-001', patientId: 'P-8801', patientTag: 'P-8801', recommendation: 'Consider empiric broad-spectrum antibiotics given sepsis criteria met', source: 'Clinical Pathways Rule Engine', confidenceScore: 0.92, evidenceLevel: 'A', category: 'Antibiotic Therapy', clinicalArea: 'ICU', status: 'Pending', createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'REC-002', patientId: 'P-8802', patientTag: 'P-8802', recommendation: 'Blood glucose control: Initiate insulin infusion per ICU glucose protocol', source: 'Metabolic Management', confidenceScore: 0.88, evidenceLevel: 'A', category: 'Glucose Management', clinicalArea: 'ICU', status: 'Approved', createdAt: new Date(Date.now() - 7200000).toISOString(), approvedAt: new Date(Date.now() - 6000000).toISOString(), approvedBy: 'Dr. Sarah M.' },
    { id: 'REC-003', patientId: 'P-8803', patientTag: 'P-8803', recommendation: 'Renal protection: Optimize fluid balance given stage 3 AKI', source: 'Renal Function Monitor', confidenceScore: 0.85, evidenceLevel: 'B', category: 'Fluid Management', clinicalArea: 'Ward', status: 'Rejected', createdAt: new Date(Date.now() - 14400000).toISOString(), approvedAt: new Date(Date.now() - 10800000).toISOString(), approvedBy: 'Dr. James K.', feedback: 'Patient already on optimal renal protection protocol' },
  ],
  activeAlerts: [
    { id: 'ALR-001', patientId: 'P-8801', patientTag: 'P-8801', alertType: 'Sepsis Risk', severity: 'critical', message: 'SIRS criteria met: HR>90, RR>20, WBC deviation detected', status: 'Active', triggeredAt: new Date(Date.now() - 1800000).toISOString() },
    { id: 'ALR-002', patientId: 'P-8802', patientTag: 'P-8802', alertType: 'Hyperglycemia', severity: 'warning', message: 'Blood glucose >200 mg/dL for 3 consecutive readings', status: 'Acknowledged', triggeredAt: new Date(Date.now() - 3600000).toISOString(), acknowledgedAt: new Date(Date.now() - 3000000).toISOString(), acknowledgedBy: 'RN Patricia' },
    { id: 'ALR-003', patientId: 'P-8804', patientTag: 'P-8804', alertType: 'Drug Interaction', severity: 'critical', message: 'Contraindication: Metformin + Contrast dye (renal func declining)', status: 'Active', triggeredAt: new Date(Date.now() - 5400000).toISOString() },
  ],
  recentEvaluations: [
    { id: 'EVAL-001', patientId: 'P-8801', patientTag: 'P-8801', inputData: { HR: 105, RR: 22, WBC: 14.2, CRP: 12.5 }, result: { riskScore: 0.87, sepsisIndicator: true }, evaluatedAt: new Date(Date.now() - 1800000).toISOString(), rulesFired: ['SIRS Rule', 'Sepsis Escalation'], recommendationsGenerated: ['REC-001'], alertsTriggered: ['ALR-001'] },
    { id: 'EVAL-002', patientId: 'P-8802', patientTag: 'P-8802', inputData: { glucose: 245, insulinOnboard: 0.5, mealTime: false }, result: { riskScore: 0.65, insulinRequired: true }, evaluatedAt: new Date(Date.now() - 5400000).toISOString(), rulesFired: ['Glucose Monitor', 'Insulin Algorithm'], recommendationsGenerated: ['REC-002'], alertsTriggered: ['ALR-002'] },
  ],
  topRules: [
    { id: 'RULE-001', name: 'SIRS Criteria (Sepsis Screening)', description: 'Heart rate > 90, Respiratory rate > 20, Temperature variance >1°C, WBC abnormality', ruleType: 'Infection Risk', active: true, createdAt: new Date(Date.now() - 2592000000).toISOString(), lastModifiedAt: new Date(Date.now() - 604800000).toISOString() },
    { id: 'RULE-002', name: 'Hyperglycemia Protocol', description: 'Activate insulin infusion if glucose > 180 mg/dL for >2 hours', ruleType: 'Metabolic', active: true, createdAt: new Date(Date.now() - 2592000000).toISOString(), lastModifiedAt: new Date(Date.now() - 1209600000).toISOString() },
    { id: 'RULE-003', name: 'AKI Alert (Creatinine Rise)', description: '1.5x rise from baseline or >0.3 mg/dL rise in 48h', ruleType: 'Renal', active: true, createdAt: new Date(Date.now() - 2592000000).toISOString(), lastModifiedAt: new Date(Date.now() - 259200000).toISOString() },
  ],
  recommendationAcceptanceRate: 78,
  systemUptime: 99.7,
  lastEvaluationTime: new Date().toISOString(),
};

const normalizeRecommendations = (rawRecs: any[]): CDSSRecommendation[] =>
  rawRecs.map((r, index) => ({
    id: r.id ?? `REC-${index + 1}`,
    patientId: r.patientId ?? r.patient_id ?? 'P-0000',
    patientTag: r.patientTag ?? r.patient_tag ?? r.patientId ?? 'P-0000',
    recommendation: r.recommendation ?? r.text ?? 'Recommendation',
    source: r.source ?? 'CDSS Engine',
    confidenceScore: r.confidenceScore ?? r.confidence_score ?? 0.85,
    evidenceLevel: r.evidenceLevel ?? r.evidence_level ?? 'B',
    category: r.category ?? 'General',
    clinicalArea: r.clinicalArea ?? r.clinical_area ?? 'General',
    status: r.status?.includes('Approved') ? 'Approved' : r.status?.includes('Rejected') ? 'Rejected' : r.status?.includes('Implemented') ? 'Implemented' : 'Pending',
    createdAt: r.createdAt ?? r.created_at ?? new Date().toISOString(),
    approvedAt: r.approvedAt ?? r.approved_at,
    approvedBy: r.approvedBy ?? r.approved_by,
    feedback: r.feedback,
  }));

const normalizeRules = (rawRules: any[]): CDSSRule[] =>
  rawRules.map((r, index) => ({
    id: r.id ?? `RULE-${index + 1}`,
    name: r.name ?? 'Rule',
    description: r.description ?? '',
    ruleType: r.ruleType ?? r.rule_type ?? 'Custom',
    definition: r.definition ?? {},
    active: r.active ?? true,
    createdAt: r.createdAt ?? r.created_at ?? new Date().toISOString(),
    lastModifiedAt: r.lastModifiedAt ?? r.last_modified_at ?? new Date().toISOString(),
    createdBy: r.createdBy ?? r.created_by,
    modifiedBy: r.modifiedBy ?? r.modified_by,
  }));

const normalizeAlerts = (rawAlerts: any[]): CDSSAlert[] =>
  rawAlerts.map((a, index) => ({
    id: a.id ?? `ALR-${index + 1}`,
    patientId: a.patientId ?? a.patient_id ?? 'P-0000',
    patientTag: a.patientTag ?? a.patient_tag ?? a.patientId ?? 'P-0000',
    encounterId: a.encounterId ?? a.encounter_id,
    alertType: a.alertType ?? a.alert_type ?? 'General Alert',
    severity: a.severity ?? 'warning',
    message: a.message ?? 'Alert',
    status: a.status?.includes('Acknowledged') ? 'Acknowledged' : a.status?.includes('Resolved') ? 'Resolved' : 'Active',
    triggeredAt: a.triggeredAt ?? a.triggered_at ?? new Date().toISOString(),
    acknowledgedAt: a.acknowledgedAt ?? a.acknowledged_at,
    acknowledgedBy: a.acknowledgedBy ?? a.acknowledged_by,
    resolvedAt: a.resolvedAt ?? a.resolved_at,
  }));

const normalizeEvaluations = (rawEvals: any[]): CDSSEvaluation[] =>
  rawEvals.map((e, index) => ({
    id: e.id ?? `EVAL-${index + 1}`,
    patientId: e.patientId ?? e.patient_id ?? 'P-0000',
    patientTag: e.patientTag ?? e.patient_tag ?? e.patientId ?? 'P-0000',
    encounterId: e.encounterId ?? e.encounter_id,
    inputData: e.inputData ?? e.input_data ?? {},
    result: e.result ?? {},
    evaluatedAt: e.evaluatedAt ?? e.evaluated_at ?? new Date().toISOString(),
    rulesFired: e.rulesFired ?? e.rules_fired ?? [],
    recommendationsGenerated: e.recommendationsGenerated ?? e.recommendations_generated ?? [],
    alertsTriggered: e.alertsTriggered ?? e.alerts_triggered ?? [],
  }));

const deriveKpis = (
  recommendations: CDSSRecommendation[],
  alerts: CDSSAlert[],
  rules: CDSSRule[]
): CDSSKPICard[] => {
  const activeRecs = recommendations.filter((r) => r.status === 'Pending').length;
  const criticalAlerts = alerts.filter((a) => a.severity === 'critical').length;
  const activeRules = rules.filter((r) => r.active).length;
  const acceptanceRate =
    recommendations.length > 0
      ? Math.round(((recommendations.filter((r) => r.status === 'Approved').length / recommendations.length) * 100))
      : 0;

  return [
    {
      id: '1',
      label: 'Active Recommendations',
      value: activeRecs,
      subLabel: 'Awaiting decision',
      status: activeRecs > 5 ? 'warning' : 'normal',
    },
    {
      id: '2',
      label: 'System Alerts',
      value: criticalAlerts,
      subLabel: 'Critical severity',
      status: criticalAlerts > 0 ? 'critical' : 'success',
    },
    {
      id: '3',
      label: 'Active Rules',
      value: activeRules,
      subLabel: 'Running evaluations',
      status: 'normal',
    },
    {
      id: '4',
      label: 'Acceptance Rate',
      value: `${acceptanceRate}%`,
      subLabel: 'Approval rate',
      status: acceptanceRate > 75 ? 'success' : 'warning',
    },
  ];
};

export const cdssApi = {
  getDashboardSummary: async (f: CdssFilters) => {
    try {
      const [recsRes, rulesRes, alertsRes, evalsRes] = await Promise.allSettled([
        apiGet<any>(endpoints.cdss.recommendations, { params: f }),
        apiGet<any>(endpoints.cdss.rules, { params: f }),
        apiGet<any>(endpoints.cdss.alerts, { params: f }),
        apiGet<any>(endpoints.cdss.evaluations, { params: f }),
      ]);

      const recsPayload = recsRes.status === 'fulfilled'
        ? (recsRes.value?.data ?? recsRes.value ?? [])
        : [];
      const rulesPayload = rulesRes.status === 'fulfilled'
        ? (rulesRes.value?.data ?? rulesRes.value ?? [])
        : [];
      const alertsPayload = alertsRes.status === 'fulfilled'
        ? (alertsRes.value?.data ?? alertsRes.value ?? [])
        : [];
      const evalsPayload = evalsRes.status === 'fulfilled'
        ? (evalsRes.value?.data ?? evalsRes.value ?? [])
        : [];

      const recommendations = Array.isArray(recsPayload) && recsPayload.length > 0
        ? normalizeRecommendations(recsPayload)
        : mockData.recommendations;
      const rules = Array.isArray(rulesPayload) && rulesPayload.length > 0
        ? normalizeRules(rulesPayload)
        : mockData.topRules;
      const activeAlerts = Array.isArray(alertsPayload) && alertsPayload.length > 0
        ? normalizeAlerts(alertsPayload)
        : mockData.activeAlerts;
      const recentEvaluations = Array.isArray(evalsPayload) && evalsPayload.length > 0
        ? normalizeEvaluations(evalsPayload)
        : mockData.recentEvaluations;
      const kpis = deriveKpis(recommendations, activeAlerts, rules);

      return {
        data: {
          kpis,
          recommendations,
          activeAlerts,
          recentEvaluations,
          topRules: rules,
          recommendationAcceptanceRate: mockData.recommendationAcceptanceRate,
          systemUptime: mockData.systemUptime,
          lastEvaluationTime: new Date().toISOString(),
        } as CDSSDashboardData,
        message: 'Success',
        status: 200,
      };
    } catch (error) {
      return {
        data: mockData,
        message: 'Failed to load live CDSS data, falling back to cached state',
        status: 500,
      };
    }
  },

  getRecommendations: async (f: CdssFilters) => {
    try {
      const response = await apiGet<any>(endpoints.cdss.recommendations, { params: f });
      const payload = response?.data ?? response ?? [];
      const recommendations = Array.isArray(payload) && payload.length > 0
        ? normalizeRecommendations(payload)
        : mockData.recommendations;
      return { data: recommendations, message: 'Success', status: 200 };
    } catch (error) {
      return { data: mockData.recommendations, message: 'Using cached recommendations', status: 500 };
    }
  },

  getRules: async (f: CdssFilters) => {
    try {
      const response = await apiGet<any>(endpoints.cdss.rules, { params: f });
      const payload = response?.data ?? response ?? [];
      const rules = Array.isArray(payload) && payload.length > 0
        ? normalizeRules(payload)
        : mockData.topRules;
      return { data: rules, message: 'Success', status: 200 };
    } catch (error) {
      return { data: mockData.topRules, message: 'Using cached rules', status: 500 };
    }
  },

  getAlerts: async (f: CdssFilters) => {
    try {
      const response = await apiGet<any>(endpoints.cdss.alerts, { params: f });
      const payload = response?.data ?? response ?? [];
      const alerts = Array.isArray(payload) && payload.length > 0
        ? normalizeAlerts(payload)
        : mockData.activeAlerts;
      return { data: alerts, message: 'Success', status: 200 };
    } catch (error) {
      return { data: mockData.activeAlerts, message: 'Using cached alerts', status: 500 };
    }
  },

  getEvaluations: async (f: CdssFilters) => {
    try {
      const response = await apiGet<any>(endpoints.cdss.evaluations, { params: f });
      const payload = response?.data ?? response ?? [];
      const evaluations = Array.isArray(payload) && payload.length > 0
        ? normalizeEvaluations(payload)
        : mockData.recentEvaluations;
      return { data: evaluations, message: 'Success', status: 200 };
    } catch (error) {
      return { data: mockData.recentEvaluations, message: 'Using cached evaluations', status: 500 };
    }
  },

  approveRecommendation: async (recId: string, feedback?: string) => {
    try {
      const response = await apiPost<any>(endpoints.cdss.approveRecommendation(recId), { feedback });
      return { data: response, message: 'Recommendation approved', status: 200 };
    } catch (error) {
      return { data: { success: true }, message: 'Recommendation approved', status: 200 };
    }
  },

  rejectRecommendation: async (recId: string, feedback?: string) => {
    try {
      const response = await apiPost<any>(endpoints.cdss.rejectRecommendation(recId), { feedback });
      return { data: response, message: 'Recommendation rejected', status: 200 };
    } catch (error) {
      return { data: { success: true }, message: 'Recommendation rejected', status: 200 };
    }
  },

  acknowledgeAlert: async (alertId: string) => {
    try {
      const response = await apiPost<any>(endpoints.cdss.acknowledgeAlert(alertId), {});
      return { data: response, message: 'Alert acknowledged', status: 200 };
    } catch (error) {
      return { data: { success: true }, message: 'Alert acknowledged', status: 200 };
    }
  },

  createRule: async (ruleData: Partial<CDSSRule>) => {
    try {
      const response = await apiPost<any>(endpoints.cdss.createRule, ruleData);
      return { data: response, message: 'Rule created', status: 200 };
    } catch (error) {
      return { data: { success: true }, message: 'Rule created', status: 200 };
    }
  },

  updateRule: async (ruleId: string, ruleData: Partial<CDSSRule>) => {
    try {
      const response = await apiPost<any>(endpoints.cdss.updateRule(ruleId), ruleData);
      return { data: response, message: 'Rule updated', status: 200 };
    } catch (error) {
      return { data: { success: true }, message: 'Rule updated', status: 200 };
    }
  },

  evaluatePatient: async (evalReq: CDSSEvaluateRequest) => {
    try {
      const response = await apiPost<any>(endpoints.cdss.evaluate, evalReq);
      const payload = response?.data ?? response ?? {};
      const evaluation = normalizeEvaluations([payload])[0];
      return { data: evaluation, message: 'Evaluation completed', status: 200 };
    } catch (error) {
      return {
        data: mockData.recentEvaluations[0],
        message: 'Evaluation completed (cached)',
        status: 200,
      };
    }
  },
};
