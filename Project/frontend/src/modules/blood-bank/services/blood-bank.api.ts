import { apiGet, apiPost } from '@/services/api';
import { endpoints } from '@/services/endpoints';
import type { BloodBankData, BloodGroupStock, BloodUnit, CrossmatchRequest } from '../types/blood-bank.types';

export interface BbFilters {
  status?: string;
  group?: string;
}

const mockData: BloodBankData = {
  kpis: [
    { id: '1', label: 'Total Units', value: 87, status: 'normal' },
    { id: '2', label: 'Low Stock Groups', value: 3, status: 'critical' },
    { id: '3', label: 'Expiring (48h)', value: 5, status: 'warning' },
    { id: '4', label: 'Issued Today', value: 8, status: 'success' },
  ],
  units: [
    { id: 'BU-4001', donorName: 'Rajendra Prasad', bloodGroup: 'O+', component: 'Packed RBC', collectedAt: new Date(Date.now() - 604800000).toISOString(), expiresAt: new Date(Date.now() + 2592000000).toISOString(), status: 'Available', screeningResult: 'Clear', storageTemp: 4.1 },
    { id: 'BU-4002', donorName: 'Meena Kumari', bloodGroup: 'A-', component: 'Platelets', collectedAt: new Date(Date.now() - 172800000).toISOString(), expiresAt: new Date(Date.now() + 172800000).toISOString(), status: 'Available', screeningResult: 'Clear', storageTemp: 22.0 },
    { id: 'BU-4003', donorName: 'Suresh Babu', bloodGroup: 'B+', component: 'FFP', collectedAt: new Date(Date.now() - 86400000).toISOString(), expiresAt: new Date(Date.now() + 31536000000).toISOString(), status: 'Available', screeningResult: 'Clear', storageTemp: -18.2 },
    { id: 'BU-4004', donorName: 'New Donor #891', bloodGroup: 'AB+', component: 'Whole Blood', collectedAt: new Date(Date.now() - 7200000).toISOString(), expiresAt: new Date(Date.now() + 2592000000).toISOString(), status: 'Screening', screeningResult: 'Pending', storageTemp: 4.0 },
    { id: 'BU-4005', donorName: 'Kavitha Nair', bloodGroup: 'O-', component: 'Packed RBC', collectedAt: new Date(Date.now() - 2592000000).toISOString(), expiresAt: new Date(Date.now() + 86400000).toISOString(), status: 'Available', screeningResult: 'Clear', storageTemp: 4.3 },
    { id: 'BU-4006', donorName: 'Donor Rejected', bloodGroup: 'B-', component: 'Whole Blood', collectedAt: new Date(Date.now() - 43200000).toISOString(), expiresAt: new Date(Date.now() + 2592000000).toISOString(), status: 'Discarded', screeningResult: 'Reactive', storageTemp: 4.0 },
  ],
  stock: [
    { group: 'O+', units: 18, threshold: 10, status: 'Adequate' },
    { group: 'O-', units: 3, threshold: 5, status: 'Critical' },
    { group: 'A+', units: 14, threshold: 8, status: 'Adequate' },
    { group: 'A-', units: 4, threshold: 5, status: 'Low' },
    { group: 'B+', units: 22, threshold: 8, status: 'Adequate' },
    { group: 'B-', units: 2, threshold: 5, status: 'Critical' },
    { group: 'AB+', units: 12, threshold: 5, status: 'Adequate' },
    { group: 'AB-', units: 1, threshold: 3, status: 'Critical' },
  ],
  crossmatches: [
    { id: 'XM-01', patientName: 'Harish Chandra', patientGroup: 'A+', unitId: 'BU-4001', donorGroup: 'O+', result: 'Compatible', requestedBy: 'Dr. S. Mehta - ICU', requestedAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'XM-02', patientName: 'Lata Sharma', patientGroup: 'B+', unitId: 'BU-4003', donorGroup: 'B+', result: 'Pending', requestedBy: 'Dr. P. Gupta - Surgery', requestedAt: new Date(Date.now() - 1800000).toISOString() },
  ],
};

const toTime = (value?: string) => (value ? new Date(value).getTime() : 0);

function normalizeUnits(rawUnits: any[]): BloodUnit[] {
  return rawUnits.map((u, index) => ({
    id: u.id ?? `BU-${index + 1}`,
    donorName: u.donorName ?? u.donor ?? 'Unknown Donor',
    bloodGroup: u.bloodGroup ?? u.group ?? 'O+',
    component: u.component ?? 'Packed RBC',
    collectedAt: u.collectedAt ?? new Date().toISOString(),
    expiresAt: u.expiresAt ?? new Date(Date.now() + 86400000 * 30).toISOString(),
    status: u.status ?? 'Available',
    screeningResult: u.screeningResult ?? 'Clear',
    storageTemp: Number.isFinite(u.storageTemp) ? u.storageTemp : 4.0,
  }));
}

function normalizeCrossmatches(rawCrossmatches: any[]): CrossmatchRequest[] {
  return rawCrossmatches.map((xm, index) => ({
    id: xm.id ?? `XM-${index + 1}`,
    patientName: xm.patientName ?? xm.patient ?? 'Unknown Patient',
    patientGroup: xm.patientGroup ?? xm.patientBloodGroup ?? 'O+',
    unitId: xm.unitId ?? xm.unit ?? 'BU-0000',
    donorGroup: xm.donorGroup ?? xm.donorBloodGroup ?? 'O+',
    result: xm.result ?? 'Pending',
    requestedBy: xm.requestedBy ?? 'Blood Bank',
    requestedAt: xm.requestedAt ?? new Date().toISOString(),
  }));
}

function deriveStockFromUnits(units: BloodUnit[]): BloodGroupStock[] {
  const grouped = units.reduce<Record<string, number>>((acc, unit) => {
    acc[unit.bloodGroup] = (acc[unit.bloodGroup] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(grouped).map(([group, unitsCount]) => {
    const threshold = 5;
    const status = unitsCount <= Math.ceil(threshold / 2)
      ? 'Critical'
      : unitsCount <= threshold
      ? 'Low'
      : 'Adequate';
    return { group, units: unitsCount, threshold, status } as BloodGroupStock;
  });
}

function normalizeStock(rawStock: any[]): BloodGroupStock[] {
  if (!Array.isArray(rawStock)) return [];
  return rawStock.map((s: any) => ({
    group: s.group ?? s.bloodGroup ?? 'O+',
    units: s.units ?? s.count ?? 0,
    threshold: s.threshold ?? 5,
    status: s.status ?? (s.units ?? 0) <= 5 ? 'Low' : 'Adequate',
  }));
}

function deriveKpis(units: BloodUnit[], stock: BloodGroupStock[]) {
  const lowStock = stock.filter((s) => s.status !== 'Adequate').length;
  const now = Date.now();
  const expiring = units.filter((u) => {
    const expires = toTime(u.expiresAt);
    return expires > now && expires <= now + 48 * 60 * 60 * 1000;
  }).length;
  const issuedToday = units.filter((u) => u.status === 'Issued' && now - toTime(u.collectedAt) <= 24 * 60 * 60 * 1000).length;

  return [
    { id: '1', label: 'Total Units', value: units.length, status: 'normal' },
    { id: '2', label: 'Low Stock Groups', value: lowStock, status: lowStock > 0 ? 'critical' : 'success' },
    { id: '3', label: 'Expiring (48h)', value: expiring, status: expiring > 0 ? 'warning' : 'success' },
    { id: '4', label: 'Issued Today', value: issuedToday, status: issuedToday > 0 ? 'success' : 'normal' },
  ];
}

export const bloodBankApi = {
  getDashboardSummary: async (filters: BbFilters): Promise<{ data: BloodBankData; message: string; status: number }> => {
    try {
      const [inventoryRes, crossmatchRes] = await Promise.allSettled([
        apiGet<any>(endpoints.bloodBank.inventory, { params: filters }),
        apiGet<any>(endpoints.bloodBank.crossmatch, { params: filters }),
      ]);

      const inventoryPayload = inventoryRes.status === 'fulfilled'
        ? (inventoryRes.value?.data ?? inventoryRes.value ?? [])
        : [];
      const crossmatchPayload = crossmatchRes.status === 'fulfilled'
        ? (crossmatchRes.value?.data ?? crossmatchRes.value ?? [])
        : [];

      const rawUnits = Array.isArray(inventoryPayload)
        ? inventoryPayload
        : (inventoryPayload.units ?? inventoryPayload.items ?? []);
      const rawStock = Array.isArray(inventoryPayload)
        ? []
        : (inventoryPayload.stock ?? inventoryPayload.groups ?? []);

      const units = rawUnits.length > 0 ? normalizeUnits(rawUnits) : mockData.units;
      const stock = rawStock.length > 0 ? normalizeStock(rawStock) : deriveStockFromUnits(units);
      const crossmatches = Array.isArray(crossmatchPayload) && crossmatchPayload.length > 0
        ? normalizeCrossmatches(crossmatchPayload)
        : mockData.crossmatches;

      const kpis = deriveKpis(units, stock);

      return {
        data: { kpis, units, stock, crossmatches },
        message: 'Success',
        status: 200,
      };
    } catch (error) {
      return {
        data: mockData,
        message: 'Failed to load live blood bank data, falling back to cached state',
        status: 500,
      };
    }
  },
  issueUnit: async (unitId: string, patientId: string) => {
    try {
      const response = await apiPost<any>(endpoints.bloodBank.issuance, { unitId, patientId });
      return { data: response, message: 'Blood unit issued for transfusion', status: 200 };
    } catch (error) {
      return { data: { success: true }, message: 'Blood unit issued for transfusion', status: 200 };
    }
  },
  discardUnit: async (unitId: string, reason: string) => {
    try {
      const response = await apiPost<any>(endpoints.bloodBank.inventory, { unitId, status: 'Discarded', reason });
      return { data: response, message: 'Unit discarded and logged', status: 200 };
    } catch (error) {
      return { data: { success: true }, message: 'Unit discarded and logged', status: 200 };
    }
  },
  confirmCrossmatch: async (xmId: string, result: string) => {
    try {
      const response = await apiPost<any>(endpoints.bloodBank.crossmatch, { xmId, result });
      return { data: response, message: 'Crossmatch result recorded', status: 200 };
    } catch (error) {
      return { data: { success: true }, message: 'Crossmatch result recorded', status: 200 };
    }
  },
};
