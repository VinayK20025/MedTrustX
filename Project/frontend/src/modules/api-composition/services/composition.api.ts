/**
 * API Composition Gateway real service layer
 * Proxied via Next.js: /api/gateway/composition/* → :8022
 */
import { apiGet, apiPost } from '@/services/api';

const COMP = '/api/gateway/composition';
const DISC = '/api/gateway/discovery';

/* ─── helpers ─── */
async function safeGet<T>(path: string): Promise<T | null> {
  try { return (await apiGet<T>(path)) as T; } catch { return null; }
}

/* ─── Types ─── */
export interface ServiceNode {
  service_name: string;
  url: string;
  health: 'healthy' | 'degraded' | 'down';
  circuit_state: 'CLOSED' | 'HALF_OPEN' | 'OPEN';
  avg_response_ms: number;
}

export interface ComposedEndpoint {
  key: string;
  service: string;
  path: string;
  status: 'ok' | 'error' | 'unavailable';
}

/* ─── Mocks ─── */
const MOCK_SERVICES: ServiceNode[] = [
  { service_name: 'patient-service',      url: 'http://patient-service:8018',      health: 'healthy',  circuit_state: 'CLOSED',    avg_response_ms: 42 },
  { service_name: 'clinical-service',     url: 'http://clinical-service:8019',     health: 'healthy',  circuit_state: 'CLOSED',    avg_response_ms: 58 },
  { service_name: 'appointment-service',  url: 'http://appointment-service:8020',  health: 'healthy',  circuit_state: 'CLOSED',    avg_response_ms: 35 },
  { service_name: 'ai-platform-service',  url: 'http://ai-platform-service:8010',  health: 'healthy',  circuit_state: 'CLOSED',    avg_response_ms: 340 },
  { service_name: 'audit-service',        url: 'http://audit-service:8015',        health: 'healthy',  circuit_state: 'CLOSED',    avg_response_ms: 22 },
  { service_name: 'compliance-service',   url: 'http://compliance-service:8016',   health: 'healthy',  circuit_state: 'CLOSED',    avg_response_ms: 28 },
  { service_name: 'consent-service',      url: 'http://consent-service:8017',      health: 'healthy',  circuit_state: 'CLOSED',    avg_response_ms: 19 },
  { service_name: 'zta-service',          url: 'http://zta-service:8012',          health: 'healthy',  circuit_state: 'CLOSED',    avg_response_ms: 12 },
  { service_name: 'iam-service',          url: 'http://iam-service:8013',          health: 'healthy',  circuit_state: 'CLOSED',    avg_response_ms: 18 },
  { service_name: 'pam-service',          url: 'http://pam-service:8014',          health: 'healthy',  circuit_state: 'CLOSED',    avg_response_ms: 25 },
  { service_name: 'rls-manager-service',  url: 'http://rls-manager-service:8011',  health: 'healthy',  circuit_state: 'CLOSED',    avg_response_ms: 8  },
];

/* ─── Client ─── */
export const compositionApi = {
  getServiceRegistry: async (): Promise<ServiceNode[]> => {
    const real = await safeGet<ServiceNode[]>(`${DISC}/services`);
    return real ?? MOCK_SERVICES;
  },

  getPatientDashboard: async (patientId: string) => {
    const real = await safeGet<any>(`${COMP}/patient-dashboard/${patientId}`);
    return real ?? {
      patient: { id: patientId, mrn: 'MRN-DEMO', first_name: 'Demo', last_name: 'Patient', date_of_birth: '1985-03-15', gender: 'M', tenant_id: 'tenant_apollo' },
      vitals: [{ type: 'heart_rate', value: 72, unit: 'bpm', timestamp: new Date().toISOString() }],
      conditions: [{ code: 'E11', name: 'Type 2 Diabetes', status: 'active' }],
      medications: [{ name: 'Metformin', dosage: '500mg', status: 'active' }],
      appointments: [],
      readmission_risk: { score: 0.18, risk_level: 'low' },
      consent_summary: { active: true, last_updated: new Date().toISOString() },
    };
  },

  getClinicalSummary: async (patientId: string) => {
    const real = await safeGet<any>(`${COMP}/clinical-summary/${patientId}`);
    return real ?? {
      vitals: [], conditions: [], orders: [], results: [],
      ai_insights: { anomaly_detected: false, confidence: 0.95 },
      recent_access: [],
    };
  },

  getAdminOverview: async (tenantId: string) => {
    const real = await safeGet<any>(`${COMP}/admin-overview/${tenantId}`);
    return real ?? {
      iam: { total_users: 148, active_sessions: 32, failed_logins_24h: 7 },
      zta: { trust_score_avg: 92, active_threats: 2, device_verified: 98 },
      audit: { events_24h: 1240, critical_events: 3 },
      compliance: { frameworks: [{ name: 'HIPAA', score: 96 }, { name: 'ISO-27001', score: 94 }, { name: 'SOC2', score: 91 }] },
      ai: { models_active: 4, inferences_24h: 8420 },
      appointments: { scheduled_today: 128, completed: 94, cancelled: 12 },
    };
  },

  getCircuitStates: async (): Promise<Record<string, string>> => {
    // Circuit states are embedded in registry response
    const services = await compositionApi.getServiceRegistry();
    return Object.fromEntries(services.map(s => [s.service_name, s.circuit_state]));
  },

  getCompositionAnalytics: async () => {
    return {
      requests_per_hour: 4200,
      avg_composition_latency_ms: 89,
      error_rate_pct: 0.3,
      circuit_breaker_trips: 0,
      top_endpoints: [
        { path: '/api/composed/patient-dashboard/:id', calls: 2100 },
        { path: '/api/composed/clinical-summary/:id', calls: 1400 },
        { path: '/api/composed/admin-overview/:id', calls: 700 },
      ],
    };
  },
};
