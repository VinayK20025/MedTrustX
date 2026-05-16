import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAssetTracking } from '../hooks/useAssetTracking';
import type { Asset } from '../types/asset-tracking.types';

export const AssetsPanel: React.FC = () => {
  const { useAssets } = useAssetTracking();
  const { data: response, isLoading } = useAssets();

  const assets = response?.data || [
    { id: '1', name: 'Wheelchair #12', type: 'wheelchair', status: 'active' },
    { id: '2', name: 'Infusion Pump B-7', type: 'infusion_pump', status: 'active' },
    { id: '3', name: 'Ventilator ICU-3', type: 'ventilator', status: 'maintenance' }
  ];

  if (isLoading) return <div>Loading assets...</div>;

  const statusVariant = (s: string) => {
    switch (s) {
      case 'active': return 'success';
      case 'maintenance': return 'warning';
      case 'retired': return 'danger';
      default: return 'outline' as const;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Tracked Assets" />
      <CardBody>
        <div className="space-y-4">
          {assets.map((asset: Asset) => (
            <div key={asset.id} className="p-4 border border-white/10 rounded-lg bg-white/5 flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-100">{asset.name}</p>
                <p className="text-sm text-gray-400 mt-1 capitalize">{asset.type.replace('_', ' ')}</p>
              </div>
              <Badge variant={statusVariant(asset.status)}>
                {asset.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
