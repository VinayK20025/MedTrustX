/**
 * MedTrustX — Surveillance Operator / CCTV (Role 101) Types
 */

export type CameraStatus = 'Online' | 'Offline' | 'Alert' | 'Maintenance';
export type FeedLayout = 4 | 9 | 16;

export interface Camera {
  id: string;
  name: string;
  zone: string;
  status: CameraStatus;
  resolution: string;
  gradientClass: string; // for simulated feed placeholder
}

export interface SurveillanceKPI {
  id: string;
  label: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export type AlertSeverity = 'High' | 'Medium' | 'Low';

export interface SurveillanceAlert {
  id: string;
  cameraId: string;
  cameraName: string;
  zone: string;
  type: 'Suspicious Activity' | 'Unauthorized Access' | 'Crowd Density' | 'Motion Detected' | 'Offline Camera';
  severity: AlertSeverity;
  detectedAt: string;
  status: 'Active' | 'Acknowledged' | 'Dispatched' | 'Closed';
  description: string;
}

export interface SurveillanceDashboardData {
  kpis: SurveillanceKPI[];
  cameras: Camera[];
  alerts: SurveillanceAlert[];
}
