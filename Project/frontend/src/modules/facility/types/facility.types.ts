/**
 * MedTrustX — Facility Manager Types
 * Backend API models for facility management, rooms, assets, and maintenance.
 */

// ── Facilities ──────────────────────────────────────────────────
export interface Facility {
  id: string;
  name: string;
  type: 'main_hospital' | 'clinic' | 'laboratory' | 'storage';
  location: string;
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
  rooms?: Room[];
}

// ── Rooms ───────────────────────────────────────────────────────
export interface Room {
  id: string;
  facility_id: string;
  room_number: string;
  type: 'ward' | 'icu' | 'ot' | 'consultation' | 'lab' | 'utility';
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
}

// ── Assets ──────────────────────────────────────────────────────
export interface Asset {
  id: string;
  name: string;
  category: 'medical_equipment' | 'utility' | 'hvac' | 'IT' | 'furniture';
  location: string;
  status: 'operational' | 'degraded' | 'offline' | 'maintenance';
  created_at: string;
}

// ── Maintenance ─────────────────────────────────────────────────
export interface MaintenanceRequest {
  id: string;
  asset_id: string;
  issue_description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'cancelled';
  reported_at: string;
  resolved_at?: string | null;
}

export interface MaintenanceSchedule {
  id: string;
  asset_id: string;
  schedule_type: 'weekly' | 'monthly' | 'annual' | 'usage_based';
  next_due: string;
}

// ── Dashboard KPIs ──────────────────────────────────────────────
export interface FacilityKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text';
  status: 'normal' | 'warning' | 'critical' | 'success';
}

// ── Dashboard Data ──────────────────────────────────────────────
export interface FacilityDashboardData {
  kpis: FacilityKPI[];
  facilities: Facility[];
  assets: Asset[];
  maintenanceRequests: MaintenanceRequest[];
  rooms: Room[];
}
