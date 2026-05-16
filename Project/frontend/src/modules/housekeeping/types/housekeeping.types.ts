/**
 * MedTrustX — Housekeeping Service Types
 */

export type RoomCleaningStatus = 'Clean' | 'Dirty' | 'In Progress' | 'Terminal Cleaning' | 'Maintenance Down';
export type TaskPriority = 'Routine' | 'Discharge' | 'STAT' | 'Isolation';
export type WasteType = 'General' | 'Biohazard' | 'Sharps' | 'Chemical' | 'Radioactive';

export interface RoomStatus {
  id: string;
  roomNumber: string;
  ward: string;
  status: RoomCleaningStatus;
  lastCleanedAt: string;
  assignedStaffId?: string;
  isIsolation: boolean;
}

export interface CleaningTask {
  id: string;
  location: string;
  taskType: 'Routine' | 'Discharge' | 'Deep Clean' | 'Terminal';
  priority: TaskPriority;
  status: 'Pending' | 'Assigned' | 'In Progress' | 'Completed' | 'Verified';
  assignedTo?: string;
  requestedAt: string;
}

export interface LinenStock {
  id: string;
  itemName: string;
  currentStock: number;
  minRequired: number;
  unit: string;
}

export interface HousekeepingMetrics {
  averageTurnoverTimeMinutes: number;
  cleanRoomCount: number;
  dirtyRoomCount: number;
  activeStaffCount: number;
  pendingStatTasks: number;
}

export interface HousekeepingDashboardData {
  metrics: HousekeepingMetrics;
  rooms: RoomStatus[];
  activeTasks: CleaningTask[];
  lowLinenStock: LinenStock[];
}
