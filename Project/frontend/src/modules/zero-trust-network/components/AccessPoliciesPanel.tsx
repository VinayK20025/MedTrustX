import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useZeroTrustNetwork } from '../hooks/useZeroTrustNetwork';
import type { AccessPolicy } from '../types/zero-trust-network.types';

export const AccessPoliciesPanel: React.FC = () => {
  const { usePolicies } = useZeroTrustNetwork();
  const { data: response, isLoading } = usePolicies();

  const policies = response?.data || [
    { id: '1', policy_name: 'Clinical-Only VPN Access', rules: { source: 'clinical-subnet', allow: ['ehr-service', 'pharmacy-service'] } },
    { id: '2', policy_name: 'Guest Wi-Fi Isolation', rules: { source: 'guest-vlan', deny: ['all-internal'] } }
  ];

  if (isLoading) return <div>Loading policies...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Micro-Segmentation Policies" />
      <CardBody>
        <div className="space-y-4">
          {policies.map((pol: AccessPolicy) => (
            <div key={pol.id} className="p-4 border border-white/10 rounded-lg bg-white/5">
              <p className="font-semibold text-gray-100 mb-2">{pol.policy_name}</p>
              <div className="text-xs text-gray-400 grid grid-cols-2 gap-2">
                {Object.entries(pol.rules).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-gray-500 capitalize">{k}:</span>{' '}
                    <span className="text-white font-medium">{Array.isArray(v) ? v.join(', ') : String(v)}</span>
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
