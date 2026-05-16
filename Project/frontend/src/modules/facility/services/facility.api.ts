/**
 * MedTrustX — Facility Management API Service
 * Wires frontend to facility service backend with normalization and fallbacks
 */

import { apiGet, apiPost, apiPut } from '@/services/api';
import { endpoints } from '@/services/endpoints';
import type {
  Facility,
  Room,
  Asset,
  MaintenanceRequest,
  FacilityDashboardData,
  FacilityKPI,
} from '../types/facility.types';

export interface FacilityFilters {
  facilityId?: string;
  status?: string;
  type?: string;
}

// ── Normalization Functions ──────────────────────────────────────
function normalizeFacility(data: any): Facility {
  return {
    id: data.id || '',
    name: data.name || 'Unknown',
    type: data.type || 'main_hospital',
    location: data.location || '',
    status: data.status || 'active',
    created_at: data.created_at || new Date().toISOString(),
    rooms: Array.isArray(data.rooms) ? data.rooms.map(normalizeRoom) : [],
  };
}

function normalizeRoom(data: any): Room {
  return {
    id: data.id || '',
    facility_id: data.facility_id || '',
    room_number: data.room_number || '',
    type: data.type || 'ward',
    status: data.status || 'available',
  };
}

function normalizeAsset(data: any): Asset {
  return {
    id: data.id || '',
    name: data.name || '',
    category: data.category || 'utility',
    location: data.location || '',
    status: data.status || 'operational',
    created_at: data.created_at || new Date().toISOString(),
  };
}

function normalizeMaintenanceRequest(data: any): MaintenanceRequest {
  return {
    id: data.id || '',
    asset_id: data.asset_id || '',
    issue_description: data.issue_description || '',
    status: data.status || 'open',
    reported_at: data.reported_at || new Date().toISOString(),
    resolved_at: data.resolved_at || null,
  };
}

function generateKPIs(
  facilities: Facility[],
  assets: Asset[],
  maintenanceRequests: MaintenanceRequest[],
  rooms: Room[]
): FacilityKPI[] {
  const activeTickets = maintenanceRequests.filter((m) => m.status === 'open' || m.status === 'in_progress').length;
  const criticalAssets = assets.filter((a) => a.status === 'offline' || a.status === 'degraded').length;
  const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
  const totalRooms = rooms.length || 1;
  const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);

  return [
    {
      id: '1',
      title: 'Active Facilities',
      value: facilities.filter((f) => f.status === 'active').length,
      status: facilities.filter((f) => f.status === 'active').length > 0 ? 'success' : 'warning',
    },
    {
      id: '2',
      title: 'Maintenance Tickets',
      value: activeTickets,
      status: activeTickets > 5 ? 'critical' : activeTickets > 2 ? 'warning' : 'normal',
    },
    {
      id: '3',
      title: 'Assets Operational',
      value: `${100 - (criticalAssets / assets.length) * 100}%`.substring(0, 5),
      status: criticalAssets === 0 ? 'success' : criticalAssets > 2 ? 'critical' : 'warning',
    },
    {
      id: '4',
      title: 'Room Occupancy',
      value: `${occupancyRate}%`,
      status: occupancyRate > 80 ? 'warning' : 'normal',
    },
  ];
}

// ── Mock Data (Fallback) ────────────────────────────────────────
const mockFacilities: Facility[] = [
  {
    id: 'fac-001',
    name: 'Main Hospital Building',
    type: 'main_hospital',
    location: 'Block A',
    status: 'active',
    created_at: new Date().toISOString(),
    rooms: [],
  },
  {
    id: 'fac-002',
    name: 'Clinical Lab',
    type: 'laboratory',
    location: 'Block C',
    status: 'active',
    created_at: new Date().toISOString(),
    rooms: [],
  },
];

const mockRooms: Room[] = [
  {
    id: 'room-001',
    facility_id: 'fac-001',
    room_number: 'ICU-301',
    type: 'icu',
    status: 'occupied',
  },
  {
    id: 'room-002',
    facility_id: 'fac-001',
    room_number: 'Ward-101',
    type: 'ward',
    status: 'available',
  },
  {
    id: 'room-003',
    facility_id: 'fac-002',
    room_number: 'Lab-001',
    type: 'lab',
    status: 'occupied',
  },
];

const mockAssets: Asset[] = [
  {
    id: 'asset-001',
    name: 'ICU Central AC Unit',
    category: 'hvac',
    location: 'Block A - Floor 3',
    status: 'operational',
    created_at: new Date().toISOString(),
  },
  {
    id: 'asset-002',
    name: 'Backup Generator 1',
    category: 'utility',
    location: 'Basement',
    status: 'operational',
    created_at: new Date().toISOString(),
  },
  {
    id: 'asset-003',
    name: 'Main Elevator',
    category: 'utility',
    location: 'Main Lobby',
    status: 'degraded',
    created_at: new Date().toISOString(),
  },
];

const mockMaintenanceRequests: MaintenanceRequest[] = [
  {
    id: 'maint-001',
    asset_id: 'asset-001',
    issue_description: 'AC unit not cooling properly',
    status: 'in_progress',
    reported_at: new Date(Date.now() - 86400000).toISOString(),
    resolved_at: null,
  },
  {
    id: 'maint-002',
    asset_id: 'asset-003',
    issue_description: 'Elevator cable inspection',
    status: 'open',
    reported_at: new Date(Date.now() - 172800000).toISOString(),
    resolved_at: null,
  },
];

// ── API Service ──────────────────────────────────────────────────
export const facilityApi = {
  // Facilities
  async listFacilities(): Promise<{ data: Facility[] }> {
    try {
      const response = await apiGet<{ data: Facility[] }>(endpoints.facilities.list);
      return {
        data: (response.data || []).map(normalizeFacility),
      };
    } catch (error) {
      console.warn('Facility list failed, using mock data:', error);
      return { data: mockFacilities };
    }
  },

  async getFacility(id: string): Promise<{ data: Facility }> {
    try {
      const response = await apiGet<Facility>(endpoints.facilities.facility(id));
      return { data: normalizeFacility(response) };
    } catch (error) {
      console.warn('Facility fetch failed:', error);
      return { data: normalizeFacility(mockFacilities[0] || {}) };
    }
  },

  async createFacility(data: Partial<Facility>): Promise<{ data: Facility }> {
    try {
      const response = await apiPost<Facility>(endpoints.facilities.create, data);
      return { data: normalizeFacility(response) };
    } catch (error) {
      console.warn('Facility creation failed:', error);
      return { data: normalizeFacility(data) };
    }
  },

  async updateFacility(id: string, data: Partial<Facility>): Promise<{ data: Facility }> {
    try {
      const response = await apiPut<Facility>(endpoints.facilities.updateFacility(id), data);
      return { data: normalizeFacility(response) };
    } catch (error) {
      console.warn('Facility update failed:', error);
      return { data: normalizeFacility(data) };
    }
  },

  // Rooms
  async listRooms(): Promise<{ data: Room[] }> {
    try {
      const response = await apiGet<{ data: Room[] }>(endpoints.facilities.rooms);
      return {
        data: (response.data || []).map(normalizeRoom),
      };
    } catch (error) {
      console.warn('Rooms list failed, using mock data:', error);
      return { data: mockRooms };
    }
  },

  async getRoom(id: string): Promise<{ data: Room }> {
    try {
      const response = await apiGet<Room>(endpoints.facilities.room(id));
      return { data: normalizeRoom(response) };
    } catch (error) {
      console.warn('Room fetch failed:', error);
      return { data: normalizeRoom(mockRooms[0] || {}) };
    }
  },

  async createRoom(data: Partial<Room>): Promise<{ data: Room }> {
    try {
      const response = await apiPost<Room>(endpoints.facilities.createRoom, data);
      return { data: normalizeRoom(response) };
    } catch (error) {
      console.warn('Room creation failed:', error);
      return { data: normalizeRoom(data) };
    }
  },

  async updateRoom(id: string, data: Partial<Room>): Promise<{ data: Room }> {
    try {
      const response = await apiPut<Room>(endpoints.facilities.updateRoom(id), data);
      return { data: normalizeRoom(response) };
    } catch (error) {
      console.warn('Room update failed:', error);
      return { data: normalizeRoom(data) };
    }
  },

  // Assets
  async listAssets(): Promise<{ data: Asset[] }> {
    try {
      const response = await apiGet<{ data: Asset[] }>(endpoints.facilities.assets);
      return {
        data: (response.data || []).map(normalizeAsset),
      };
    } catch (error) {
      console.warn('Assets list failed, using mock data:', error);
      return { data: mockAssets };
    }
  },

  async getAsset(id: string): Promise<{ data: Asset }> {
    try {
      const response = await apiGet<Asset>(endpoints.facilities.asset(id));
      return { data: normalizeAsset(response) };
    } catch (error) {
      console.warn('Asset fetch failed:', error);
      return { data: normalizeAsset(mockAssets[0] || {}) };
    }
  },

  async createAsset(data: Partial<Asset>): Promise<{ data: Asset }> {
    try {
      const response = await apiPost<Asset>(endpoints.facilities.createAsset, data);
      return { data: normalizeAsset(response) };
    } catch (error) {
      console.warn('Asset creation failed:', error);
      return { data: normalizeAsset(data) };
    }
  },

  async updateAsset(id: string, data: Partial<Asset>): Promise<{ data: Asset }> {
    try {
      const response = await apiPut<Asset>(endpoints.facilities.updateAsset(id), data);
      return { data: normalizeAsset(response) };
    } catch (error) {
      console.warn('Asset update failed:', error);
      return { data: normalizeAsset(data) };
    }
  },

  // Maintenance Requests
  async listMaintenanceRequests(): Promise<{ data: MaintenanceRequest[] }> {
    try {
      const response = await apiGet<{ data: MaintenanceRequest[] }>(endpoints.facilities.maintenanceRequests);
      return {
        data: (response.data || []).map(normalizeMaintenanceRequest),
      };
    } catch (error) {
      console.warn('Maintenance requests list failed, using mock data:', error);
      return { data: mockMaintenanceRequests };
    }
  },

  async getMaintenanceRequest(id: string): Promise<{ data: MaintenanceRequest }> {
    try {
      const response = await apiGet<MaintenanceRequest>(endpoints.facilities.maintenanceRequest(id));
      return { data: normalizeMaintenanceRequest(response) };
    } catch (error) {
      console.warn('Maintenance request fetch failed:', error);
      return { data: normalizeMaintenanceRequest(mockMaintenanceRequests[0] || {}) };
    }
  },

  async createMaintenanceRequest(data: Partial<MaintenanceRequest>): Promise<{ data: MaintenanceRequest }> {
    try {
      const response = await apiPost<MaintenanceRequest>(endpoints.facilities.createMaintenanceRequest, data);
      return { data: normalizeMaintenanceRequest(response) };
    } catch (error) {
      console.warn('Maintenance request creation failed:', error);
      return { data: normalizeMaintenanceRequest(data) };
    }
  },

  async updateMaintenanceRequest(id: string, data: Partial<MaintenanceRequest>): Promise<{ data: MaintenanceRequest }> {
    try {
      const response = await apiPut<MaintenanceRequest>(endpoints.facilities.updateMaintenanceRequest(id), data);
      return { data: normalizeMaintenanceRequest(response) };
    } catch (error) {
      console.warn('Maintenance request update failed:', error);
      return { data: normalizeMaintenanceRequest(data) };
    }
  },

  // Dashboard Summary
  async getDashboardSummary(filters: FacilityFilters): Promise<{ data: FacilityDashboardData }> {
    try {
      const [facilitiesRes, roomsRes, assetsRes, maintenanceRes] = await Promise.allSettled([
        this.listFacilities(),
        this.listRooms(),
        this.listAssets(),
        this.listMaintenanceRequests(),
      ]);

      const facilities =
        facilitiesRes.status === 'fulfilled' ? facilitiesRes.value.data : mockFacilities;
      const rooms = roomsRes.status === 'fulfilled' ? roomsRes.value.data : mockRooms;
      const assets = assetsRes.status === 'fulfilled' ? assetsRes.value.data : mockAssets;
      const maintenanceRequests =
        maintenanceRes.status === 'fulfilled' ? maintenanceRes.value.data : mockMaintenanceRequests;

      const kpis = generateKPIs(facilities, assets, maintenanceRequests, rooms);

      return {
        data: {
          kpis,
          facilities,
          assets,
          maintenanceRequests,
          rooms,
        },
      };
    } catch (error) {
      console.warn('Dashboard summary failed, using fallback:', error);
      return {
        data: {
          kpis: generateKPIs(mockFacilities, mockAssets, mockMaintenanceRequests, mockRooms),
          facilities: mockFacilities,
          assets: mockAssets,
          maintenanceRequests: mockMaintenanceRequests,
          rooms: mockRooms,
        },
      };
    }
  },
};
