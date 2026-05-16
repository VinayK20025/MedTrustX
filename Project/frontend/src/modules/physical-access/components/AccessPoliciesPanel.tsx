import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { usePhysicalAccess } from '../hooks/usePhysicalAccess';
import type { AccessPolicy } from '../types/physical-access.types';

export const AccessPoliciesPanel: React.FC = () => {
  const { usePolicies } = usePhysicalAccess();
  const { data: response, isLoading } = usePolicies();

  const policies = response?.data || [
    { id: '1', role: 'attending_physician', zone: 'icu_ward', rules: { schedule: '24/7', requires_2fa: false } },
    { id: '2', role: 'maintenance_staff', zone: 'server_room', rules: { schedule: '08:00-18:00', requires_2fa: true, escort_required: false } },
    { id: '3', role: 'visitor', zone: 'pharmacy_vault', rules: { access: 'denied' } }
  ];

  if (isLoading) return <div>Loading policies...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Access Control Policies" />
      <CardBody>
        <div className="space-y-4">
          {policies.map((p: AccessPolicy) => (
            <div key={p.id} className="p-4 border border-white/10 rounded-lg bg-white/5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-bold text-blue-400">{p.role}</span>
                <span className="text-gray-500">→</span>
                <span className="text-sm font-bold text-emerald-400">{p.zone}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(p.rules).map(([k, v]) => (
                  <div key={k} className="text-[11px] bg-black/40 border border-white/10 px-2 py-1 rounded">
                    <span className="text-gray-400 capitalize">{k.replace('_', ' ')}:</span>{' '}
                    <span className={v === 'denied' ? 'text-red-400 font-bold' : 'text-gray-200'}>{String(v)}</span>
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
