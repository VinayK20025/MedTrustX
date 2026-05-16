'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { ICUAlert } from '../types/icu.types';

const severityVariant: Record<string, 'success' | 'warning' | 'danger'> = {
  normal: 'success',
  warning: 'warning',
  critical: 'danger',
};

export function ICUAlertsList({ alerts }: { alerts: ICUAlert[] }) {
  return (
    <Card>
      <CardHeader title="ICU Alerts" subtitle="Critical events requiring action" />
      <CardBody className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <div>
              <p className="text-sm text-white">{alert.message}</p>
              <p className="text-2xs text-gray-500 mt-1">{alert.bed ?? 'ICU'} · {new Date(alert.timestamp).toLocaleTimeString()}</p>
            </div>
            <Badge variant={severityVariant[alert.severity]} size="sm">{alert.severity}</Badge>
          </div>
        ))}
        {alerts.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-6">No active ICU alerts.</div>
        )}
      </CardBody>
    </Card>
  );
}
