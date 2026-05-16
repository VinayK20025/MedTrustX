'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { facilityApi, type FacilityFilters } from '../services/facility.api';
import type {
  Facility,
  Room,
  Asset,
  MaintenanceRequest,
  FacilityDashboardData,
} from '../types/facility.types';

const KEYS = {
  all: ['facility'] as const,
  dashboard: (f: FacilityFilters) => [...KEYS.all, 'dashboard', f] as const,
  facilities: () => [...KEYS.all, 'facilities'] as const,
  facility: (id: string) => [...KEYS.all, 'facility', id] as const,
  rooms: () => [...KEYS.all, 'rooms'] as const,
  room: (id: string) => [...KEYS.all, 'room', id] as const,
  assets: () => [...KEYS.all, 'assets'] as const,
  asset: (id: string) => [...KEYS.all, 'asset', id] as const,
  maintenance: () => [...KEYS.all, 'maintenance'] as const,
  maintenanceRequest: (id: string) => [...KEYS.all, 'maintenance', id] as const,
};

// ── Dashboard Hooks ────────────────────────────────────────────
export function useFacilityDashboard(filters: FacilityFilters) {
  return useQuery({
    queryKey: KEYS.dashboard(filters),
    queryFn: () => facilityApi.getDashboardSummary(filters),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

// ── Facilities Hooks ───────────────────────────────────────────
export function useFacilities() {
  return useQuery({
    queryKey: KEYS.facilities(),
    queryFn: () => facilityApi.listFacilities(),
    staleTime: 60_000,
  });
}

export function useFacility(id: string) {
  return useQuery({
    queryKey: KEYS.facility(id),
    queryFn: () => facilityApi.getFacility(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useCreateFacility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Facility>) => facilityApi.createFacility(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.facilities() });
      qc.invalidateQueries({ queryKey: KEYS.dashboard({}) });
    },
  });
}

export function useUpdateFacility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Facility> }) =>
      facilityApi.updateFacility(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: KEYS.facility(id) });
      qc.invalidateQueries({ queryKey: KEYS.facilities() });
    },
  });
}

// ── Rooms Hooks ────────────────────────────────────────────────
export function useRooms() {
  return useQuery({
    queryKey: KEYS.rooms(),
    queryFn: () => facilityApi.listRooms(),
    staleTime: 60_000,
  });
}

export function useRoom(id: string) {
  return useQuery({
    queryKey: KEYS.room(id),
    queryFn: () => facilityApi.getRoom(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useCreateRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Room>) => facilityApi.createRoom(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.rooms() });
      qc.invalidateQueries({ queryKey: KEYS.dashboard({}) });
    },
  });
}

export function useUpdateRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Room> }) =>
      facilityApi.updateRoom(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: KEYS.room(id) });
      qc.invalidateQueries({ queryKey: KEYS.rooms() });
    },
  });
}

// ── Assets Hooks ───────────────────────────────────────────────
export function useAssets() {
  return useQuery({
    queryKey: KEYS.assets(),
    queryFn: () => facilityApi.listAssets(),
    staleTime: 60_000,
  });
}

export function useAsset(id: string) {
  return useQuery({
    queryKey: KEYS.asset(id),
    queryFn: () => facilityApi.getAsset(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useCreateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Asset>) => facilityApi.createAsset(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.assets() });
      qc.invalidateQueries({ queryKey: KEYS.dashboard({}) });
    },
  });
}

export function useUpdateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Asset> }) =>
      facilityApi.updateAsset(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: KEYS.asset(id) });
      qc.invalidateQueries({ queryKey: KEYS.assets() });
    },
  });
}

// ── Maintenance Hooks ──────────────────────────────────────────
export function useMaintenanceRequests() {
  return useQuery({
    queryKey: KEYS.maintenance(),
    queryFn: () => facilityApi.listMaintenanceRequests(),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useMaintenanceRequest(id: string) {
  return useQuery({
    queryKey: KEYS.maintenanceRequest(id),
    queryFn: () => facilityApi.getMaintenanceRequest(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreateMaintenanceRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<MaintenanceRequest>) => facilityApi.createMaintenanceRequest(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.maintenance() });
      qc.invalidateQueries({ queryKey: KEYS.dashboard({}) });
    },
  });
}

export function useUpdateMaintenanceRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MaintenanceRequest> }) =>
      facilityApi.updateMaintenanceRequest(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: KEYS.maintenanceRequest(id) });
      qc.invalidateQueries({ queryKey: KEYS.maintenance() });
    },
  });
}
