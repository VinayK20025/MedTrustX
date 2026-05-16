'use client';
import React, { useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useEventSubscription } from '@/hooks/useEvents';
import { notify } from '@/store/notification.store';
import type { RealtimeEvent } from '@/types/events.types';

/**
 * MedTrustX — Notification Bridge
 * ──────────────────────────────────────────────────
 * Listens to real-time WebSocket events from the backend
 * and surfaces important ones as toast notifications.
 *
 * Event → Notification mapping:
 *   • Critical vitals    → Error toast (immediate)
 *   • Lab results ready  → Success toast
 *   • Medication due     → Warning toast
 *   • Security violation  → Error toast
 *   • Discharge ready    → Info toast
 *   • Appointment update → Info toast
 */

const EVENT_NOTIFICATION_MAP: Record<string, {
  type: 'success' | 'error' | 'warning' | 'info';
  titleTemplate: (event: RealtimeEvent) => string;
  messageTemplate?: (event: RealtimeEvent) => string;
}> = {
  // Clinical
  'patient.ADMITTED': {
    type: 'info',
    titleTemplate: () => 'Patient Admitted',
    messageTemplate: (e) => `${e.payload?.patientName ?? 'A patient'} has been admitted to ${e.payload?.ward ?? 'ward'}`,
  },
  'patient.DISCHARGED': {
    type: 'success',
    titleTemplate: () => 'Patient Discharged',
    messageTemplate: (e) => `${e.payload?.patientName ?? 'Patient'} discharge completed`,
  },
  'clinical.VITALS_CRITICAL': {
    type: 'error',
    titleTemplate: () => '⚠ Critical Vitals Alert',
    messageTemplate: (e) => `${e.payload?.patientName ?? 'Patient'} — ${e.payload?.detail ?? 'abnormal vitals detected'}`,
  },
  'clinical.LAB_RESULT_READY': {
    type: 'success',
    titleTemplate: () => 'Lab Result Available',
    messageTemplate: (e) => `Results ready for ${e.payload?.testName ?? 'lab order'}`,
  },
  'pharmacy.MEDICATION_DUE': {
    type: 'warning',
    titleTemplate: () => 'Medication Due',
    messageTemplate: (e) => `${e.payload?.medication ?? 'Medication'} due for ${e.payload?.patientName ?? 'patient'}`,
  },
  'pharmacy.LOW_STOCK': {
    type: 'warning',
    titleTemplate: () => 'Low Stock Alert',
    messageTemplate: (e) => `${e.payload?.drugName ?? 'Drug'} stock is running low`,
  },
  'security.VIOLATION': {
    type: 'error',
    titleTemplate: () => 'Security Violation',
    messageTemplate: (e) => `${e.payload?.detail ?? 'ZTA policy violation detected'}`,
  },
  'security.BLOCKED': {
    type: 'error',
    titleTemplate: () => 'Access Blocked',
    messageTemplate: (e) => `Unauthorized access attempt blocked: ${e.payload?.detail ?? ''}`,
  },
  'appointment.CREATED': {
    type: 'info',
    titleTemplate: () => 'New Appointment',
    messageTemplate: (e) => `Appointment scheduled for ${e.payload?.patientName ?? 'patient'}`,
  },
  'appointment.CANCELLED': {
    type: 'warning',
    titleTemplate: () => 'Appointment Cancelled',
    messageTemplate: (e) => `Appointment cancelled for ${e.payload?.patientName ?? 'patient'}`,
  },
  'icu.ALERT': {
    type: 'error',
    titleTemplate: () => '🏥 ICU Alert',
    messageTemplate: (e) => `${e.payload?.detail ?? 'ICU monitoring alert'}`,
  },
  'er.TRIAGE': {
    type: 'warning',
    titleTemplate: () => 'ER Triage Update',
    messageTemplate: (e) => `New patient triaged: ${e.payload?.patientName ?? ''} (${e.payload?.category ?? 'pending'})`,
  },
  'billing.PAYMENT_RECEIVED': {
    type: 'success',
    titleTemplate: () => 'Payment Received',
    messageTemplate: (e) => `₹${e.payload?.amount ?? '0'} payment received`,
  },
};

/** Maps an incoming event to a notification, if applicable */
function shouldNotify(event: RealtimeEvent): {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
} | null {
  const key = `${event.domain}.${event.action}`;
  const mapping = EVENT_NOTIFICATION_MAP[key];

  if (mapping) {
    return {
      type: mapping.type,
      title: mapping.titleTemplate(event),
      message: mapping.messageTemplate?.(event),
    };
  }

  // Auto-notify all critical events even without explicit mapping
  if (event.priority === 'critical') {
    return {
      type: 'error',
      title: `Critical: ${event.entityType}`,
      message: `${event.action} on ${event.entityType} ${event.entityId ?? ''}`.trim(),
    };
  }

  return null;
}

/**
 * NotificationBridge component — place inside AppProviders to
 * automatically surface backend events as toast notifications.
 */
export function NotificationBridge() {
  const { isAuthenticated } = useAuth();

  const handleEvent = useCallback((event: RealtimeEvent) => {
    const notification = shouldNotify(event);
    if (notification) {
      switch (notification.type) {
        case 'success': notify.success(notification.title, notification.message); break;
        case 'error':   notify.error(notification.title, notification.message); break;
        case 'warning': notify.warning(notification.title, notification.message); break;
        case 'info':    notify.info(notification.title, notification.message); break;
      }
    }
  }, []);

  // Subscribe to all high-priority events
  useEventSubscription(
    {
      domains: ['patient', 'clinical', 'pharmacy', 'icu', 'er', 'security', 'appointment', 'billing'],
      priority: ['high', 'critical'],
    },
    handleEvent,
    isAuthenticated,
  );

  // Also subscribe to specific actions regardless of priority
  useEventSubscription(
    {
      actions: [
        'ADMITTED', 'DISCHARGED', 'VITALS_CRITICAL', 'LAB_RESULT_READY',
        'MEDICATION_DUE', 'LOW_STOCK', 'VIOLATION', 'BLOCKED',
        'ALERT', 'TRIAGE', 'PAYMENT_RECEIVED',
      ],
    },
    handleEvent,
    isAuthenticated,
  );

  return null; // This is a logic-only component
}
