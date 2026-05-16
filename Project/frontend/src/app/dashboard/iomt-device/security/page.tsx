'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Spinner';
import { useIomtDashboard } from '@/modules/iomt-device';

export default function IomtSecurityPage() {
  const { data, isLoading } = useIomtDashboard();

  if (isLoading) {
    return <Skeleton className="h-[500px] w-full rounded-xl" />;
  }

  const policies = data?.data?.securityPolicies ?? [];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Devices' }, { label: 'Security Policies' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light">
        <CardHeader title="Policy Enforcement" subtitle="Zero-trust IoMT safeguards" />
        <CardBody className="space-y-3">
          {policies.map((policy) => (
            <div key={policy.id} className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center justify-between">
                <p className="text-sm text-white font-semibold">{policy.policyName}</p>
                <Badge size="sm" variant={policy.status === 'Enforcing' ? 'success' : policy.status === 'Enabled' ? 'info' : 'outline'}>
                  {policy.status}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1">{policy.description}</p>
            </div>
          ))}
          {policies.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-8">No security policies available.</div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
