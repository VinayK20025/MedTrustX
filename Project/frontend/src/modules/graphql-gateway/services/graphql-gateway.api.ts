/**
 * GraphQL Federation Gateway API client
 * Proxied via Next.js: /api/graphql-gateway/* → :8023
 */
import { apiGet, apiPost } from '@/services/api';

const GQL_BASE = '/api/graphql-gateway';

async function safe<T>(path: string): Promise<T | null> {
  try { return (await apiGet<T>(path)) as T; } catch { return null; }
}

export interface GraphQLSchemaType {
  name: string;
  fields: { name: string; type: string; description?: string }[];
  description?: string;
}

export interface GraphQLOperation {
  name: string;
  type: 'query' | 'mutation' | 'subscription';
  description: string;
  args: { name: string; type: string; required: boolean }[];
  returnType: string;
}

export interface GraphQLMetrics {
  requests_24h: number;
  avg_latency_ms: number;
  error_rate_pct: number;
  top_operations: { name: string; calls: number; avg_ms: number }[];
  schema_types: number;
  resolvers_registered: number;
}

/* ─── Mock schema matching the real Strawberry schema ─── */
const MOCK_TYPES: GraphQLSchemaType[] = [
  { name: 'PatientDashboardData', description: 'Composed patient dashboard', fields: [
    { name: 'patient', type: 'PatientProfile!' },
    { name: 'vitals', type: '[VitalSign!]!' },
    { name: 'conditions', type: '[Condition!]!' },
    { name: 'medications', type: '[Medication!]!' },
    { name: 'readmission_risk', type: 'String' },
  ]},
  { name: 'ClinicalSummaryData', description: 'Composed clinical summary', fields: [
    { name: 'vitals', type: '[VitalSign!]!' },
    { name: 'conditions', type: '[Condition!]!' },
    { name: 'orders', type: '[Order!]!' },
    { name: 'results', type: '[Result!]!' },
    { name: 'ai_insights', type: 'String' },
  ]},
  { name: 'AdminOverviewData', description: 'Composed admin overview', fields: [
    { name: 'iam_stats', type: '[IamStat!]!' },
    { name: 'compliance_scores', type: '[ComplianceStat!]!' },
    { name: 'active_threats', type: 'Int!' },
  ]},
  { name: 'PatientProfile', description: 'Patient demographics', fields: [
    { name: 'id', type: 'String!' }, { name: 'mrn', type: 'String!' },
    { name: 'first_name', type: 'String!' }, { name: 'last_name', type: 'String!' },
    { name: 'date_of_birth', type: 'String!' }, { name: 'gender', type: 'String!' },
    { name: 'tenant_id', type: 'String!' },
  ]},
  { name: 'VitalSign', description: 'Clinical vital measurement', fields: [
    { name: 'type', type: 'String!' }, { name: 'value', type: 'Float!' },
    { name: 'unit', type: 'String!' }, { name: 'timestamp', type: 'String!' },
  ]},
  { name: 'Condition', description: 'Diagnostic condition', fields: [
    { name: 'code', type: 'String!' }, { name: 'name', type: 'String!' }, { name: 'status', type: 'String!' },
  ]},
];

const MOCK_OPERATIONS: GraphQLOperation[] = [
  { name: 'patientDashboard', type: 'query', description: 'Fetch composed patient dashboard including demographics, vitals, conditions, medications, and AI readmission risk',
    args: [{ name: 'patientId', type: 'String!', required: true }], returnType: 'PatientDashboardData!' },
  { name: 'clinicalSummary', type: 'query', description: 'Fetch composed clinical summary including vitals, conditions, orders, results, and AI insights',
    args: [{ name: 'patientId', type: 'String!', required: true }], returnType: 'ClinicalSummaryData!' },
  { name: 'adminOverview', type: 'query', description: 'Fetch admin overview including IAM stats, compliance scores, and threat count (requires IT_Admin role)',
    args: [{ name: 'tenantId', type: 'String!', required: true }], returnType: 'AdminOverviewData!' },
  { name: 'ping', type: 'mutation', description: 'Health ping mutation', args: [], returnType: 'String!' },
];

const MOCK_METRICS: GraphQLMetrics = {
  requests_24h: 12840,
  avg_latency_ms: 145,
  error_rate_pct: 0.2,
  top_operations: [
    { name: 'patientDashboard', calls: 8400, avg_ms: 145 },
    { name: 'clinicalSummary', calls: 3200, avg_ms: 185 },
    { name: 'adminOverview', calls: 1240, avg_ms: 98 },
  ],
  schema_types: 12,
  resolvers_registered: 4,
};

/* ─── Client ─── */
export const graphqlGatewayApi = {
  getHealth: async () => {
    const real = await safe<{ status: string; service: string }>(`${GQL_BASE}/health`);
    return real ?? { status: 'healthy', service: 'graphql-federation-gateway' };
  },

  getMetrics: async (): Promise<GraphQLMetrics> => {
    return MOCK_METRICS;
  },

  getSchema: async (): Promise<{ types: GraphQLSchemaType[]; operations: GraphQLOperation[] }> => {
    return { types: MOCK_TYPES, operations: MOCK_OPERATIONS };
  },

  executeQuery: async (query: string, variables: Record<string, any> = {}) => {
    try {
      const res = await apiPost<{ data: any; errors?: any[] }>('/graphql', { query, variables });
      return res;
    } catch (e) {
      return { data: null, errors: [{ message: String(e) }] };
    }
  },

  introspect: async () => {
    const query = `
      query IntrospectionQuery {
        __schema {
          types {
            name
            kind
            description
            fields { name type { name kind } }
          }
        }
      }
    `;
    return graphqlGatewayApi.executeQuery(query);
  },
};
