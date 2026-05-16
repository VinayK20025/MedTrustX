import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useMultiTenant } from '../hooks/useMultiTenant';
import type { IsolationPolicy } from '../types/multi-tenant.types';

export const IsolationPoliciesPanel: React.FC = () => {
  const { usePolicies } = useMultiTenant();
  const { data: response, isLoading } = usePolicies();

  const policies = response?.data || [
    { id: '1', policy_name: 'Strict Data Partitioning', rules: { allow_cross_tenant_read: false, shared_db_pool: true } },
    { id: '2', policy_name: 'Federated Affiliate Access', rules: { allow_cross_tenant_read: true, restrict_write: true } }
  ];

  if (isLoading) return <div>Loading policies...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Isolation Policies" />
      <CardBody>
        <div className="space-y-4">
          {policies.map((p: IsolationPolicy) => (
            <div key={p.id} className="p-4 border border-white/10 rounded-lg bg-white/5">
              <p className="text-sm font-bold text-blue-400 mb-2">{p.policy_name}</p>
              <div className="flex flex-col gap-2">
                {Object.entries(p.rules).map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center text-[12px] bg-black/40 border border-white/10 px-3 py-1.5 rounded">
                    <span className="text-gray-400 font-mono">{k}</span>
                    <span className={v ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{String(v).toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
