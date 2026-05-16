'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { ICUIntegration } from '../types/icu.types';

const statusVariant: Record<string, 'success' | 'warning' | 'danger'> = {
  healthy: 'success',
  degraded: 'warning',
  offline: 'danger',
};

export function ICUIntegrationsPanel({ integrations }: { integrations: ICUIntegration[] }) {
  return (
    <Card>
      <CardHeader title="ICU Integrations" subtitle="Live device and gateway connectivity" />
      <CardBody className="space-y-3">
        {integrations.map((integration) => (
          <div key={integration.id} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <div>
              <p className="text-sm text-white">{integration.name}</p>
              <p className="text-2xs text-gray-500 mt-1">{integration.sourceSystem} &gt; {integration.targetSystem}</p>
              <p className="text-2xs text-gray-600 mt-1">Last sync {new Date(integration.lastSync).toLocaleTimeString()}</p>
            </div>
            <div className="text-right">
              <Badge variant={statusVariant[integration.status]} size="sm">{integration.status}</Badge>
              {integration.throughputPerHour && (
                <p className="text-2xs text-gray-500 mt-2">{integration.throughputPerHour}/hr</p>
              )}
            </div>
          </div>
        ))}
        {integrations.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-6">No ICU integrations configured.</div>
        )}
      </CardBody>
    </Card>
  );
}
