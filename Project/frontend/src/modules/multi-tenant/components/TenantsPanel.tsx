import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useMultiTenant } from '../hooks/useMultiTenant';
import type { Tenant } from '../types/multi-tenant.types';

export const TenantsPanel: React.FC = () => {
  const { useTenants } = useMultiTenant();
  const { data: response, isLoading } = useTenants();

  const tenants = response?.data || [
    { id: '1', name: 'MedTrustX Global Operations', status: 'active' },
    { id: '2', name: 'City Central Hospital Branch', status: 'active' },
    { id: '3', name: 'Northside Clinic Affiliates', status: 'suspended' }
  ];

  if (isLoading) return <div>Loading tenants...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Tenant Registry" />
      <CardBody>
        <div className="grid grid-cols-1 gap-4">
          {tenants.map((tenant: Tenant) => (
            <div key={tenant.id} className="p-4 border border-white/10 rounded-lg bg-white/5 flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-200">{tenant.name}</p>
                <p className="text-xs text-gray-500 font-mono mt-1">ID: {tenant.id}</p>
              </div>
              <Badge variant={tenant.status === 'active' ? 'success' : 'danger'}>
                {tenant.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
