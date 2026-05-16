import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { EventGateway } from './event.gateway';

/**
 * MedTrustX — Kafka Event Consumer
 * ──────────────────────────────────────────────────
 * Consumes events from Redpanda/Kafka topics published by backend
 * microservices and forwards them to the WebSocket EventGateway
 * for real-time frontend delivery.
 *
 * Topics subscribed:
 *   • medtrust.events.*  — All domain events
 *   • medtrust.alerts    — System alerts
 *   • medtrust.audit     — Audit trail events
 */

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private kafka: Kafka;
  private consumer: Consumer;
  private isRunning = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventGateway: EventGateway,
  ) {
    const brokers = (this.configService.get<string>('KAFKA_BROKERS') ?? 'redpanda:9092').split(',');

    this.kafka = new Kafka({
      clientId: 'medtrust-gateway-consumer',
      brokers,
      retry: { retries: 5, initialRetryTime: 1000 },
    });

    this.consumer = this.kafka.consumer({
      groupId: 'medtrust-gateway-ws-group',
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });
  }

  async onModuleInit() {
    try {
      await this.consumer.connect();
      this.logger.log('Kafka consumer connected');

      // Subscribe to event topics
      await this.consumer.subscribe({
        topics: [
          'medtrust.events.patient',
          'medtrust.events.clinical',
          'medtrust.events.pharmacy',
          'medtrust.events.nursing',
          'medtrust.events.icu',
          'medtrust.events.ot',
          'medtrust.events.er',
          'medtrust.events.billing',
          'medtrust.events.appointment',
          'medtrust.events.bed',
          'medtrust.events.device',
          'medtrust.events.security',
          'medtrust.events.compliance',
          'medtrust.events.inventory',
          'medtrust.alerts',
          'medtrust.audit',
        ],
        fromBeginning: false,
      });

      // Start consuming
      await this.consumer.run({
        eachMessage: async (payload) => this.handleMessage(payload),
      });

      this.isRunning = true;
      this.logger.log('Kafka consumer running — listening for backend events');
    } catch (error) {
      this.logger.warn(`Kafka consumer failed to start: ${error.message}. Will retry on demand.`);
    }
  }

  async onModuleDestroy() {
    try {
      if (this.isRunning) {
        await this.consumer.disconnect();
        this.logger.log('Kafka consumer disconnected');
      }
    } catch (error) {
      this.logger.error(`Kafka disconnect error: ${error.message}`);
    }
  }

  private async handleMessage({ topic, partition, message }: EachMessagePayload) {
    try {
      const value = message.value?.toString();
      if (!value) return;

      const event = JSON.parse(value);
      const domain = this.extractDomainFromTopic(topic);

      this.logger.debug(`Event received: ${topic} [${partition}] — ${event.action ?? 'unknown'}`);

      if (topic === 'medtrust.alerts') {
        // System alert
        this.eventGateway.broadcastAlert({
          severity: event.severity ?? 'info',
          title: event.title ?? 'System Alert',
          message: event.message ?? '',
          source: event.source ?? domain,
        });
      } else {
        // Domain event → broadcast to WebSocket clients
        this.eventGateway.broadcastEvent({
          domain,
          action: event.action ?? event.type ?? 'UNKNOWN',
          entityType: event.entity_type ?? event.entityType ?? domain,
          entityId: event.entity_id ?? event.entityId,
          tenantId: event.tenant_id ?? event.tenantId ?? 'default',
          payload: event.payload ?? event.data,
          priority: this.mapPriority(event.priority ?? event.severity),
          timestamp: event.timestamp ?? new Date().toISOString(),
        });
      }
    } catch (error) {
      this.logger.error(`Failed to process message from ${topic}: ${error.message}`);
    }
  }

  private extractDomainFromTopic(topic: string): string {
    // medtrust.events.patient → patient
    // medtrust.alerts → alerts
    const parts = topic.split('.');
    return parts[parts.length - 1];
  }

  private mapPriority(priority?: string): 'low' | 'normal' | 'high' | 'critical' {
    switch (priority?.toLowerCase()) {
      case 'critical': case 'emergency': return 'critical';
      case 'high': case 'warning': return 'high';
      case 'low': return 'low';
      default: return 'normal';
    }
  }
}
