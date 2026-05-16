import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLitigationTracking } from '../hooks/useLitigationTracking';
import type { LegalParty } from '../types/litigation.types';

export const LegalPartiesPanel: React.FC = () => {
  const { useParties } = useLitigationTracking();
  const { data: response, isLoading } = useParties();

  const parties = response?.data || [
    { id: '1', litigation_id: '1', party_name: 'Hospital Trust Board', role: 'defendant' },
    { id: '2', litigation_id: '1', party_name: 'Patient Family (Claimant)', role: 'plaintiff' },
    { id: '3', litigation_id: '1', party_name: 'Sharma & Associates LLP', role: 'counsel' }
  ];

  if (isLoading) return <div>Loading parties...</div>;

  const roleColor = (role: string) => {
    switch (role) {
      case 'plaintiff': return 'danger';
      case 'defendant': return 'warning';
      default: return 'outline' as const;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Legal Parties" />
      <CardBody>
        <ul className="space-y-3">
          {parties.map((p: LegalParty) => (
            <li key={p.id} className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-sm font-medium text-gray-200">{p.party_name}</span>
              <Badge variant={roleColor(p.role)}>
                {p.role.toUpperCase()}
              </Badge>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};
