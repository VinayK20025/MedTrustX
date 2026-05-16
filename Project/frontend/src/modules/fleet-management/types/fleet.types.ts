/**
 * MedTrustX — Fleet Management Service Types
 */

export type VehicleStatus = 'Available' | 'On Mission' | 'Maintenance' | 'Refuelling' | 'Out of Service';
export type VehicleType = 'BLS Ambulance' | 'ALS Ambulance' | 'Critical Care' | 'Admin Van' | 'SUV';

export interface Vehicle {
  id: string;
  licensePlate: string;
  type: VehicleType;
  status: VehicleStatus;
  currentLocation: { lat: number; lng: number; address: string };
  fuelLevelPercent: number;
  lastMaintenanceDate: string;
}

export interface DispatchMission {
  id: string;
  vehicleId: string;
  driverId: string;
  patientId?: string;
  priority: 'Emergency' | 'Urgent' | 'Scheduled';
  status: 'Dispatched' | 'En Route' | 'On Scene' | 'Transporting' | 'Completed';
  origin: string;
  destination: string;
  startTime: string;
}

export interface FleetMetrics {
  totalVehicles: number;
  availableVehicles: number;
  activeMissions: number;
  averageResponseTimeMinutes: number;
  fleetUptimePercent: number;
}

export interface FleetDashboardData {
  metrics: FleetMetrics;
  vehicles: Vehicle[];
  activeMissions: DispatchMission[];
  maintenanceAlerts: { vehicleId: string; issue: string; dueDate: string }[];
}
