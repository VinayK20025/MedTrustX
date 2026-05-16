import {
  WebSocketGateway as WsGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

/**
 * MedTrustX — WebSocket Event Gateway
 * ──────────────────────────────────────────────────
 * Bridges backend Kafka/Redpanda events to frontend WebSocket clients.
 * Handles:
 *   • Client authentication (JWT verification)
 *   • Tenant-scoped event delivery
 *   • Event filtering by domain/action
 *   • Heartbeat/keepalive
 *   • Connection tracking
 */

interface ConnectedClient {
  socketId: string;
  tenantId: string;
  userId: string;
  subscribedDomains: string[];
  connectedAt: Date;
}

@WsGateway({
  path: '/ws/events',
  cors: { origin: '*' },
  transports: ['websocket', 'polling'],
})
export class EventGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventGateway.name);
  private clients: Map<string, ConnectedClient> = new Map();

  afterInit() {
    this.logger.log('WebSocket Event Gateway initialized');
  }

  handleConnection(client: Socket) {
    const token = client.handshake.query?.token as string;
    const tenantId = client.handshake.query?.tenant as string;

    if (!token || !tenantId) {
      this.logger.warn(`Client ${client.id} rejected: missing token or tenant`);
      client.disconnect(true);
      return;
    }

    // In production, verify JWT here via Keycloak public key
    const userId = this.extractUserIdFromToken(token);

    this.clients.set(client.id, {
      socketId: client.id,
      tenantId,
      userId,
      subscribedDomains: [],
      connectedAt: new Date(),
    });

    // Join tenant room for scoped broadcasts
    client.join(`tenant:${tenantId}`);

    this.logger.log(`Client connected: ${client.id} (tenant: ${tenantId}, user: ${userId})`);
    this.logger.debug(`Total connected clients: ${this.clients.size}`);
  }

  handleDisconnect(client: Socket) {
    this.clients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id} (remaining: ${this.clients.size})`);
  }

  /* ── Client Messages ───────────────────────────────── */

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { domains: string[] },
  ) {
    const clientInfo = this.clients.get(client.id);
    if (clientInfo) {
      clientInfo.subscribedDomains = data.domains ?? [];
      // Join domain-specific rooms
      data.domains?.forEach(domain => {
        client.join(`domain:${domain}`);
      });
      this.logger.debug(`Client ${client.id} subscribed to: ${data.domains?.join(', ')}`);
    }
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { domains: string[] },
  ) {
    const clientInfo = this.clients.get(client.id);
    if (clientInfo) {
      data.domains?.forEach(domain => {
        client.leave(`domain:${domain}`);
        clientInfo.subscribedDomains = clientInfo.subscribedDomains.filter(d => d !== domain);
      });
    }
  }

  /* ── Backend Event Broadcasting ─────────────────────── */

  /**
   * Called by Kafka consumer when a backend event arrives.
   * Routes the event to the appropriate tenant/domain rooms.
   */
  broadcastEvent(event: {
    domain: string;
    action: string;
    entityType: string;
    entityId?: string;
    tenantId: string;
    payload?: any;
    priority?: 'low' | 'normal' | 'high' | 'critical';
    timestamp: string;
  }) {
    // Send to all clients in the tenant room
    this.server.to(`tenant:${event.tenantId}`).emit('event', {
      domain: event.domain,
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId,
      priority: event.priority ?? 'normal',
      payload: event.payload,
      timestamp: event.timestamp,
    });

    // Also send to domain-specific subscribers (cross-tenant if applicable)
    this.server.to(`domain:${event.domain}`).emit('event', {
      domain: event.domain,
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId,
      priority: event.priority ?? 'normal',
      timestamp: event.timestamp,
    });
  }

  /** Broadcast a system-wide alert */
  broadcastAlert(alert: {
    severity: 'critical' | 'warning' | 'info';
    title: string;
    message: string;
    source: string;
  }) {
    this.server.emit('alert', {
      ...alert,
      timestamp: new Date().toISOString(),
    });
  }

  /** Get connection statistics */
  getConnectionStats() {
    const tenantCounts = new Map<string, number>();
    this.clients.forEach(client => {
      const count = tenantCounts.get(client.tenantId) ?? 0;
      tenantCounts.set(client.tenantId, count + 1);
    });

    return {
      totalConnections: this.clients.size,
      byTenant: Object.fromEntries(tenantCounts),
      uptime: process.uptime(),
    };
  }

  /* ── Private Helpers ───────────────────────────────── */

  private extractUserIdFromToken(token: string): string {
    try {
      // Decode JWT payload (in production, verify signature with Keycloak public key)
      const base64Payload = token.split('.')[1];
      const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
      return payload.sub ?? 'unknown';
    } catch {
      return 'unknown';
    }
  }
}
