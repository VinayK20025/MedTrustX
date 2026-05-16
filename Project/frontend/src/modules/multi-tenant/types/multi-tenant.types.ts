export interface Tenant {
  id: string;
  name: string;
  status: string;
}

export interface IsolationPolicy {
  id: string;
  policy_name: string;
  rules: Record<string, any>;
}

export interface AccessLog {
  id: string;
  tenant_id: string;
  resource_type: string;
  resource_id: string;
  action: string;
  status: string;
  created_at: string;
}

export interface ContextPropagation {
  id: string;
  tenant_id: string;
  request_id: string;
  service_name: string;
  propagated_at: string;
}
