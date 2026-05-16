'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Spinner';
import { useIomtDashboard } from '@/modules/iomt-device';

export default function IomtValidationPage() {
  const { data, isLoading } = useIomtDashboard();

  if (isLoading) {
    return <Skeleton className="h-[500px] w-full rounded-xl" />;
  }

  const checks = data?.data?.validationChecks ?? [];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Devices' }, { label: 'Validation' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light">
        <CardHeader title="Data Integrity" subtitle="Latest validation checks" />
        <CardBody>
          {checks.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-8">No validation checks available.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-[10px] uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="py-2">Check</th>
                  <th className="py-2">Device</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {checks.map((check) => (
                  <tr key={check.id}>
                    <td className="py-2 text-xs font-mono text-gray-400">{check.id}</td>
                    <td className="py-2 text-xs text-indigo-300 font-mono">{check.deviceId}</td>
                    <td className="py-2 text-xs text-gray-300">{check.checkType}</td>
                    <td className="py-2 text-xs">
                      <span className={check.status === 'Verified' ? 'text-emerald-400' : 'text-red-400'}>
                        {check.status}
                      </span>
                    </td>
                    <td className="py-2 text-[10px] text-gray-500 font-mono">{new Date(check.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
