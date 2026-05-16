/**
 * MedTrustX — Authentication & Authorization Types
 */

/** Keycloak JWT token claims */
export interface TokenClaims {
  sub: string;
  email: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  realm_access?: {
    roles: string[];
  };
  roles?: string[];
  resource_access?: Record<string, { roles: string[] }>;
  tenant_id: string;
  department?: string;
  employee_id?: string;
  /** ISO 8601 */
  exp: number;
  iat: number;
}

/** Application-level user representation */
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  roles: UserRole[];
  permissions: string[];
  tenantId: string;
  department?: string;
  employeeId?: string;
}

/** Hierarchical role system matching IAM architecture */
export type UserRole =
  | 'super_admin'
  | 'ceo'
  | 'board'
  | 'enterprise-root'
  | 'ciso'
  | 'enterprise-security'
  | 'security-root'
  | 'pathologist'
  | 'hod'
  | 'triage_nurse'
  | 'triage-nurse'
  | 'er-nurse'
  | 'emergency-care'
  | 'gp'
  | 'specialist'
  | 'ot-user'
  | 'diagnostics-user'
  | 'lab-specialist'
  | 'patient-counselor'
  | 'social-work'
  | 'support-services'
  | 'pharmacy'
  | 'clinical-pharmacy'
  | 'medication-operator'
  | 'pharmacy-chief'
  | 'tenant_admin'
  | 'hospital_admin'
  | 'operations'
  | 'operations-admin'
  | 'facility-admin'
  | 'front-desk'
  | 'visitor-management'
  | 'admission-scheduler'
  | 'billing'
  | 'claims'
  | 'insurance'
  | 'tpa'
  | 'it'
  | 'system-administrator'
  | 'it-ops'
  | 'helpdesk'
  | 'network'
  | 'network-engineer'
  | 'network-management'
  | 'infection-nurse'
  | 'infection-control'
  | 'epidemiology-user'
  | 'legal'
  | 'legal-compliance'
  | 'legal-risk'
  | 'ethics'
  | 'clinical-ethics'
  | 'research-governance'
  | 'procurement'
  | 'procurement-exec'
  | 'vendor-management'
  | 'inventory'
  | 'storekeeper'
  | 'supply-chain'
  | 'external-auditor'
  | 'audit-reviewer'
  | 'regulatory-auditor'
  | 'infosec-risk'
  | 'infosec-compliance'
  | 'security-governance'
  | 'devsecops'
  | 'platform-engineer'
  | 'cloud-security'
  | 'ai-governance-officer'
  | 'ai-governance'
  | 'ai-ethics-specialist'
  | 'chief_medical_officer'
  | 'department_head'
  | 'doctor'
  | 'surgeon'
  | 'nurse_manager'
  | 'nurse'
  | 'pharmacist'
  | 'lab_technician'
  | 'radiologist'
  | 'receptionist'
  | 'billing_officer'
  | 'insurance_officer'
  | 'hr_manager'
  | 'hr_staff'
  | 'security_officer'
  | 'compliance_officer'
  | 'legal_counsel'
  | 'icu_specialist'
  | 'er_physician'
  | 'dietitian'
  | 'physiotherapist'
  | 'blood_bank_officer'
  | 'infection_control_officer'
  | 'biomedical_engineer'
  | 'facilities_manager'
  | 'vendor_manager'
  | 'patient'
  | 'visitor';

/** Auth session state */
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/** Tenant information */
export interface Tenant {
  id: string;
  name: string;
  code: string;
  logo?: string;
  primaryColor?: string;
  isActive: boolean;
}

/** Permission check function signature */
export type PermissionCheck = (permission: string) => boolean;

/** Role guard configuration */
export interface RoleGuardConfig {
  roles: UserRole[];
  requireAll?: boolean; // default: false (any match)
  fallback?: React.ReactNode;
}
