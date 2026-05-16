/**
 * MedTrustX — Permission & Role Utilities
 */
import type { UserRole, User } from '@/types/auth.types';

/**
 * Role hierarchy — higher index = more privileged.
 * Used for "at least this role" checks.
 */
const ROLE_HIERARCHY: Record<string, number> = {
  visitor:                   0,
  patient:                   1,
  receptionist:              10,
  billing_officer:           10,
  insurance_officer:         10,
  hr_staff:                  10,
  dietitian:                 15,
  physiotherapist:           15,
  lab_technician:            20,
  blood_bank_officer:        20,
  infection_control_officer: 20,
  biomedical_engineer:       20,
  radiologist:               25,
  pharmacist:                25,
  nurse:                     30,
  nurse_manager:             35,
  doctor:                    40,
  surgeon:                   45,
  icu_specialist:            45,
  er_physician:              45,
  facilities_manager:        50,
  vendor_manager:            50,
  security_officer:          55,
  compliance_officer:        55,
  legal_counsel:             55,
  hr_manager:                55,
  department_head:           60,
  chief_medical_officer:     70,
  hospital_admin:            80,
  tenant_admin:              90,
  super_admin:               100,
};

/** Check if user has a specific role */
export function hasRole(user: User | null, role: UserRole): boolean {
  if (!user) return false;
  return user.roles.includes(role);
}

/** Check if user has ANY of the given roles */
export function hasAnyRole(user: User | null, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.some((role) => user.roles.includes(role));
}

/** Check if user has ALL of the given roles */
export function hasAllRoles(user: User | null, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.every((role) => user.roles.includes(role));
}

/** Check if user has a specific permission */
export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false;
  return user.permissions.includes(permission) || user.permissions.includes('*');
}

/** Check if user has at least the given role level */
export function hasMinimumRole(user: User | null, minimumRole: UserRole): boolean {
  if (!user) return false;
  const minLevel = ROLE_HIERARCHY[minimumRole] ?? 0;
  return user.roles.some((role) => (ROLE_HIERARCHY[role] ?? 0) >= minLevel);
}

/** Get the highest role a user has */
export function getHighestRole(user: User | null): UserRole | null {
  if (!user || user.roles.length === 0) return null;
  return user.roles.reduce((highest, current) => {
    const currentLevel = ROLE_HIERARCHY[current] ?? 0;
    const highestLevel = ROLE_HIERARCHY[highest] ?? 0;
    return currentLevel > highestLevel ? current : highest;
  });
}

/** Clinical roles that can access patient data */
export const CLINICAL_ROLES: UserRole[] = [
  'doctor', 'surgeon', 'nurse', 'nurse_manager', 'icu_specialist',
  'er_physician', 'pharmacist', 'lab_technician', 'radiologist',
  'dietitian', 'physiotherapist', 'chief_medical_officer',
  'department_head', 'blood_bank_officer', 'infection_control_officer',
];

/** Admin roles */
export const ADMIN_ROLES: UserRole[] = [
  'super_admin', 'tenant_admin', 'hospital_admin',
];

/** Check if user is clinical staff */
export function isClinicalStaff(user: User | null): boolean {
  return hasAnyRole(user, CLINICAL_ROLES);
}

/** Check if user is admin */
export function isAdmin(user: User | null): boolean {
  return hasAnyRole(user, ADMIN_ROLES);
}
