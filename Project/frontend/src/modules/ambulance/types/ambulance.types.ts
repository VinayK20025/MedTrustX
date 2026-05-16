/**
 * MedTrustX — Ambulance Driver (Role 120) Types
 * Mission-critical pre-hospital execution, dispatch alerts, and GPS navigation.
 */

export interface AmbulanceKPI {
  id: string;
  label: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface DispatchAlert {
  id: string;
  type: 'Trauma' | 'Cardiac' | 'Transfer' | 'Medical Emergency';
  pickupLocation: string;
  destination: string;
  priority: 'Critical' | 'High' | 'Routine';
  distance: string;
  etaToPickup: string;
  status: 'Pending Accept' | 'En Route to Pickup' | 'At Scene' | 'Patient Onboard' | 'Completed';
  dispatchedAt: string;
}

export interface AmbulanceData {
  kpis: AmbulanceKPI[];
  activeDispatch: DispatchAlert | null;
  fleetStatus: 'Available' | 'On Call' | 'Maintenance';
}
