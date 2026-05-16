'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Spinner';
import { useInfectionControlDashboard, useFlagProtocol } from '@/modules/infection-control';

export default function InfectionCompliancePage() {
  const { data, isLoading } = useInfectionControlDashboard({});
  const { mutate: flagProtocol } = useFlagProtocol();

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full rounded-xl" />;
  }

  const protocols = data?.data?.protocols ?? [];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Infection Control' }, { label: 'Compliance' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light">
        <CardHeader title="Compliance Protocols" subtitle="Department adherence" />
        <CardBody className="space-y-3">
          {protocols.map((protocol) => (
            <div key={protocol.id} className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-white font-semibold">{protocol.protocol}</p>
                  <p className="text-xs text-gray-500">{protocol.department} · {new Date(protocol.lastCheckedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    size="sm"
                    variant={protocol.status === 'Compliant' ? 'success' : protocol.status === 'Overdue' ? 'danger' : protocol.status === 'Non-Compliant' ? 'warning' : 'outline'}
                  >
                    {protocol.status}
                  </Badge>
                  {(protocol.status === 'Non-Compliant' || protocol.status === 'Overdue') && (
                    <button
                      className="text-xs text-warning-light hover:text-yellow-300"
                      onClick={() => flagProtocol(protocol.id)}
                    >
                      Notify
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {protocols.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-8">No protocols available.</div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
