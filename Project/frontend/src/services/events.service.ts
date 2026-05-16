/**
 * MedTrustX — Real-time Event Service
 * WebSocket client with automatic reconnection, heartbeat, and event routing.
 */
import { WS_URL } from '@/utils/constants';
import type {
  RealtimeEvent,
  EventFilter,
  EventHandler,
  ConnectionState,
  EventSubscription,
} from '@/types/events.types';

type ConnectionListener = (state: ConnectionState) => void;

class EventService {
  private socket: WebSocket | null = null;
  private subscriptions: Map<string, EventSubscription> = new Map();
  private connectionListeners: Set<ConnectionListener> = new Set();
  private connectionState: ConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private subIdCounter = 0;

  /** Connect to WebSocket endpoint */
  connect(token: string, tenantId: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    this.setConnectionState('connecting');

    const url = `${WS_URL}?token=${encodeURIComponent(token)}&tenant=${encodeURIComponent(tenantId)}`;
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.setConnectionState('connected');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      console.debug('[Events] WebSocket connected');
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as RealtimeEvent;
        this.routeEvent(data);
      } catch (err) {
        console.error('[Events] Failed to parse message:', err);
      }
    };

    this.socket.onerror = () => {
      this.setConnectionState('error');
    };

    this.socket.onclose = (event) => {
      this.stopHeartbeat();
      if (!event.wasClean) {
        this.attemptReconnect(token, tenantId);
      } else {
        this.setConnectionState('disconnected');
      }
    };
  }

  /** Disconnect from WebSocket */
  disconnect(): void {
    this.stopHeartbeat();
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }
    this.setConnectionState('disconnected');
  }

  /** Subscribe to events with optional filter */
  subscribe<T = unknown>(filter: EventFilter, handler: EventHandler<T>): EventSubscription {
    const id = `sub_${++this.subIdCounter}`;
    const subscription: EventSubscription = {
      id,
      filter,
      handler: handler as EventHandler,
      unsubscribe: () => this.subscriptions.delete(id),
    };
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  /** Listen for connection state changes */
  onConnectionChange(listener: ConnectionListener): () => void {
    this.connectionListeners.add(listener);
    return () => this.connectionListeners.delete(listener);
  }

  /** Get current connection state */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /* ── Private ─────────────────────────────────────────── */

  private routeEvent(event: RealtimeEvent): void {
    this.subscriptions.forEach((sub) => {
      if (this.matchesFilter(event, sub.filter)) {
        try {
          sub.handler(event);
        } catch (err) {
          console.error('[Events] Handler error:', err);
        }
      }
    });
  }

  private matchesFilter(event: RealtimeEvent, filter: EventFilter): boolean {
    if (filter.domains?.length && !filter.domains.includes(event.domain)) return false;
    if (filter.actions?.length && !filter.actions.includes(event.action)) return false;
    if (filter.entityTypes?.length && !filter.entityTypes.includes(event.entityType)) return false;
    if (filter.priority?.length && !filter.priority.includes(event.priority)) return false;
    return true;
  }

  private attemptReconnect(token: string, tenantId: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setConnectionState('error');
      console.error('[Events] Max reconnect attempts reached');
      return;
    }
    this.setConnectionState('reconnecting');
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;
    console.debug(`[Events] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    this.reconnectTimer = setTimeout(() => this.connect(token, tenantId), delay);
  }

  private setConnectionState(state: ConnectionState): void {
    this.connectionState = state;
    this.connectionListeners.forEach((listener) => listener(state));
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30_000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

/** Singleton event service */
export const eventService = new EventService();
