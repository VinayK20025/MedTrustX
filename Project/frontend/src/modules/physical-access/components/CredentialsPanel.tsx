import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { usePhysicalAccess } from '../hooks/usePhysicalAccess';
import type { Credential } from '../types/physical-access.types';

export const CredentialsPanel: React.FC = () => {
  const { useCredentials } = usePhysicalAccess();
  const { data: response, isLoading } = useCredentials();

  const credentials = response?.data || [
    { id: '1', user_id: 'dr-sarah-jenkins', type: 'card', value: 'RFID-****-721A', status: 'active' },
    { id: '2', user_id: 'dr-sarah-jenkins', type: 'biometric', value: 'FP-HASH-****', status: 'active' },
    { id: '3', user_id: 'nurse-john-doe', type: 'mobile', value: 'NFC-****-992B', status: 'revoked' }
  ];

  if (isLoading) return <div>Loading credentials...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="User Credentials" />
      <CardBody>
        <div className="space-y-3">
          {credentials.map((c: Credential) => (
            <div key={c.id} className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/10">
              <div>
                <p className="text-sm font-semibold text-gray-200">{c.user_id}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-white/10 px-2 py-0.5 rounded capitalize">{c.type}</span>
                  <span className="text-xs text-gray-500 font-mono">{c.value}</span>
                </div>
              </div>
              <Badge variant={c.status === 'active' ? 'success' : 'danger'}>
                {c.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
