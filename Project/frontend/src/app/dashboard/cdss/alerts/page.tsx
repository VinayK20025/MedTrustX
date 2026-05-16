'use client';

import { Card, Skeleton, Button, Badge } from '@/design-system';
import { useUIStore } from '@/store/ui.store';
import { useEffect, useState } from 'react';
import { useCDSSAlerts, useAcknowledgeCDSSAlert } from '@/modules/cdss/hooks/useCDSS';
import { RoleGuard } from '@/components/guards/AuthGuard';

export default function AlertsPage() {
  const setPageMetadata = useUIStore((s) => s.setPageMetadata);
  const { data, isLoading } = useCDSSAlerts();
  const { mutate: acknowledgeAlert } = useAcknowledgeCDSSAlert();
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null);

  useEffect(() => {
    setPageMetadata({
      title: 'Alerts',
      breadcrumbs: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'CDSS', href: '/dashboard/cdss' },
        { label: 'Alerts' },
      ],
    });
  }, [setPageMetadata]);

  const filteredAlerts = filterSeverity
    ? data?.filter((a) => a.severity === filterSeverity)
    : data;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  const criticalCount = data?.filter((a) => a.severity === 'critical').length || 0;
  const warningCount = data?.filter((a) => a.severity === 'warning').length || 0;
  const infoCount = data?.filter((a) => a.severity === 'info').length || 0;

  return (
    <RoleGuard
      roles={['clinician', 'doctor', 'nurse', 'clinical-informaticist', 'super-admin']}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">System Alerts</h1>
          <p className="text-sm text-gray-600">{data?.length || 0} total alerts</p>
        </div>

        {/* Alert Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 border-l-4 border-l-red-500 bg-red-50">
            <p className="text-sm text-gray-600">Critical</p>
            <p className="text-3xl font-bold mt-2 text-red-600">{criticalCount}</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-yellow-500 bg-yellow-50">
            <p className="text-sm text-gray-600">Warning</p>
            <p className="text-3xl font-bold mt-2 text-yellow-600">{warningCount}</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-blue-500 bg-blue-50">
            <p className="text-sm text-gray-600">Info</p>
            <p className="text-3xl font-bold mt-2 text-blue-600">{infoCount}</p>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <Button
            variant={filterSeverity === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterSeverity(null)}
          >
            All
          </Button>
          <Button
            variant={filterSeverity === 'critical' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterSeverity('critical')}
          >
            Critical
          </Button>
          <Button
            variant={filterSeverity === 'warning' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterSeverity('warning')}
          >
            Warning
          </Button>
          <Button
            variant={filterSeverity === 'info' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterSeverity('info')}
          >
            Info
          </Button>
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {filteredAlerts?.map((alert) => (
            <Card
              key={alert.id}
              className={`p-6 border-l-4 ${
                alert.severity === 'critical' ? 'border-l-red-500 bg-red-50' :
                alert.severity === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
                'border-l-blue-500 bg-blue-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{alert.alertType}</h3>
                    <Badge variant={
                      alert.severity === 'critical' ? 'destructive' :
                      alert.severity === 'warning' ? 'outline' :
                      'secondary'
                    }>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    {alert.status !== 'Active' && (
                      <Badge variant="secondary">{alert.status}</Badge>
                    )}
                  </div>

                  <p className="text-sm text-gray-700 mt-2">{alert.message}</p>

                  <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                    <div>
                      <p className="text-gray-600">Patient</p>
                      <p className="font-medium">{alert.patientTag}</p>
                    </div>
                    {alert.encounterId && (
                      <div>
                        <p className="text-gray-600">Encounter</p>
                        <p className="font-medium">{alert.encounterId}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    <p>Triggered: {new Date(alert.triggeredAt).toLocaleString()}</p>
                    {alert.acknowledgedBy && (
                      <p>Acknowledged by {alert.acknowledgedBy} at {new Date(alert.acknowledgedAt!).toLocaleString()}</p>
                    )}
                  </div>
                </div>

                {alert.status === 'Active' && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="ml-4"
                  >
                    Acknowledge
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </RoleGuard>
  );
}
