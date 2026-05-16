/**
 * MedTrustX — Common / Shared Types
 */

/** Base entity with audit fields */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

/** Soft-deletable entity */
export interface SoftDeletableEntity extends BaseEntity {
  deletedAt?: string | null;
  deletedBy?: string | null;
  isDeleted: boolean;
}

/** Tenant-scoped entity */
export interface TenantEntity extends BaseEntity {
  tenantId: string;
}

/** Status badge variants */
export type StatusVariant = 'active' | 'inactive' | 'pending' | 'error' | 'warning' | 'success';

/** Generic select option */
export interface SelectOption<T = string> {
  label: string;
  value: T;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  description?: string;
}

/** Breadcrumb item */
export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

/** Navigation menu item */
export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
  children?: MenuItem[];
  badge?: string | number;
  roles?: string[];
  isActive?: boolean;
  divider?: boolean;
}

/** Table column definition */
export interface ColumnDef<T> {
  key: string;
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  minWidth?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  sticky?: 'left' | 'right';
  hidden?: boolean;
}

/** Tab definition */
export interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
  disabled?: boolean;
  content?: React.ReactNode;
}

/** File / attachment */
export interface Attachment {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  uploadedBy: string;
}

/** Address */
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

/** Contact info */
export interface ContactInfo {
  phone?: string;
  mobile?: string;
  email?: string;
  fax?: string;
}

/** Audit log entry */
export interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userName: string;
  timestamp: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}
