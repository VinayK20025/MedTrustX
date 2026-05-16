import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useZeroTrustNetwork } from '../hooks/useZeroTrustNetwork';
import type { DevicePosture } from '../types/zero-trust-network.types';

export const DevicePosturePanel: React.FC = () => {
  const { useDevicePosture } = useZeroTrustNetwork();
  const { data: response, isLoading } = useDevicePosture();

  const postures = response?.data || [
    { id: '1', device_id: 'workstation-icu-05', compliance_status: 'compliant', attributes: { os: 'Ubuntu 22.04', encryption: 'LUKS', antivirus: 'ClamAV' } },
    { id: '2', device_id: 'tablet-ward-3b', compliance_status: 'non_compliant', attributes: { os: 'Android 14', encryption: 'none', antivirus: 'missing' } }
  ];

  if (isLoading) return <div>Loading device posture...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Device Compliance Posture" />
      <CardBody>
        <div className="space-y-4">
          {postures.map((p: DevicePosture) => (
            <div key={p.id} className="p-4 border border-white/10 rounded-lg bg-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-200">{p.device_id}</span>
                <Badge variant={p.compliance_status === 'compliant' ? 'success' : 'danger'}>
                  {p.compliance_status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {Object.entries(p.attributes).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-gray-500 capitalize">{k}:</span>{' '}
                    <span className={`font-medium ${v === 'none' || v === 'missing' ? 'text-red-400' : 'text-white'}`}>{String(v)}</span>
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
