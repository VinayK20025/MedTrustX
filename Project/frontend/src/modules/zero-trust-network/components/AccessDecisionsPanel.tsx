import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useZeroTrustNetwork } from '../hooks/useZeroTrustNetwork';
import type { AccessDecision } from '../types/zero-trust-network.types';

export const AccessDecisionsPanel: React.FC = () => {
  const { useDecisions } = useZeroTrustNetwork();
  const { data: response, isLoading } = useDecisions();

  const decisions = response?.data || [
    { id: '1', session_id: '1', decision: 'allow', reason: 'Device compliant, user authenticated via MFA' },
    { id: '2', session_id: '2', decision: 'deny', reason: 'Device posture non-compliant: disk encryption missing' }
  ];

  if (isLoading) return <div>Loading access decisions...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Access Decision Audit" />
      <CardBody>
        <ul className="border-l-2 border-white/10 ml-3 space-y-4">
          {decisions.map((d: AccessDecision) => (
            <li key={d.id} className="relative pl-4">
              <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${d.decision === 'allow' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={d.decision === 'allow' ? 'success' : 'danger'}>
                  {d.decision.toUpperCase()}
                </Badge>
                <span className="text-xs text-gray-500">Session: {d.session_id}</span>
              </div>
              {d.reason && <p className="text-xs text-gray-400">{d.reason}</p>}
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};
