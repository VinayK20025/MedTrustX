/**
 * MedTrustX — Real-time Event Types
 * Maps to backend Kafka/Redpanda topic events.
 */

/** All event domains matching backend services */
export type EventDomain =
  | 'patient'
  | 'clinical'
  | 'appointment'
  | 'pharmacy'
  | 'icu'
  | 'er'
  | 'nursing'
  | 'diagnostics'
  | 'billing'
  | 'inventory'
  | 'blood_bank'
  | 'ot'
  | 'bed'
  | 'notification'
  | 'security'
  | 'zta'
  | 'audit'
  | 'device'
  | 'alert';

/** Event actions */
export type EventAction =
  | 'CREATED'
  | 'UPDATED'
  | 'DELETED'
  | 'STATUS_CHANGED'
  | 'ASSIGNED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ALERT'
  | 'CRITICAL'
  | 'ESCALATED'
  | 'TRANSFERRED'
  | 'DISCHARGED'
  | 'ADMITTED';

/** Incoming WebSocket/SSE event */
export interface RealtimeEvent<T = unknown> {
  id: string;
  domain: EventDomain;
  action: EventAction;
  entityId: string;
  entityType: string;
  payload: T;
  tenantId: string;
  userId?: string;
  timestamp: string;
  correlationId?: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
}

/** Event subscription filter */
export interface EventFilter {
  domains?: EventDomain[];
  actions?: EventAction[];
  entityTypes?: string[];
  priority?: ('low' | 'normal' | 'high' | 'critical')[];
}

/** WebSocket connection state */
export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

/** Event handler function */
export type EventHandler<T = unknown> = (event: RealtimeEvent<T>) => void;

/** Event subscription */
export interface EventSubscription {
  id: string;
  filter: EventFilter;
  handler: EventHandler;
  unsubscribe: () => void;
}
