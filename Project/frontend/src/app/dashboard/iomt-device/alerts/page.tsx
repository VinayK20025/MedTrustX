'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Spinner';
import { useIomtDashboard, useResolveAlert } from '@/modules/iomt-device';

export default function IomtAlertsPage() {
  const { data, isLoading } = useIomtDashboard();
  const resolve = useResolveAlert();

  if (isLoading) {
    return <Skeleton className="h-[500px] w-full rounded-xl" />;
  }

  const alerts = data?.data?.alerts ?? [];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Devices' }, { label: 'Alerts' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light">
        <CardHeader title="Security Incidents" subtitle="Active IoMT device alerts" />
        <CardBody className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between gap-4 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]"
            >
              <div>
                <p className="text-sm text-white font-semibold">{alert.issue}</p>
                <p className="text-xs text-gray-500">Device {alert.deviceId}</p>
                <p className="text-2xs text-gray-600">{new Date(alert.timestamp).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  size="sm"
                  variant={alert.severity === 'Critical' ? 'danger' : alert.severity === 'Warning' ? 'warning' : 'info'}
                >
                  {alert.severity}
                </Badge>
                {!alert.resolved && (
                  <button
                    className="text-xs text-emerald-400 hover:text-emerald-300"
                    onClick={() => resolve.mutate({ alertId: alert.id })}
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
          {alerts.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-8">No active alerts.</div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
