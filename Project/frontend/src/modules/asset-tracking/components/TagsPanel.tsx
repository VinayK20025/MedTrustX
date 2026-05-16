import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAssetTracking } from '../hooks/useAssetTracking';
import type { Tag } from '../types/asset-tracking.types';

export const TagsPanel: React.FC = () => {
  const { useTags } = useAssetTracking();
  const { data: response, isLoading } = useTags();

  const tags = response?.data || [
    { id: '1', asset_id: '1', tag_type: 'ble', identifier: 'BLE-AA:BB:CC:DD:01', status: 'paired' },
    { id: '2', asset_id: '2', tag_type: 'rfid', identifier: 'RFID-0x4F3A12', status: 'paired' },
    { id: '3', asset_id: '3', tag_type: 'uwb', identifier: 'UWB-ANCHOR-ICU-3', status: 'unpaired' }
  ];

  if (isLoading) return <div>Loading tags...</div>;

  const typeColor = (t: string) => {
    switch (t) {
      case 'ble': return 'text-blue-400';
      case 'rfid': return 'text-purple-400';
      case 'uwb': return 'text-amber-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="RTLS Tags" />
      <CardBody>
        <div className="space-y-3">
          {tags.map((tag: Tag) => (
            <div key={tag.id} className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/10">
              <div>
                <p className="text-sm font-mono font-bold text-gray-200">{tag.identifier}</p>
                <p className={`text-xs mt-1 uppercase font-semibold ${typeColor(tag.tag_type)}`}>{tag.tag_type}</p>
              </div>
              <Badge variant={tag.status === 'paired' ? 'success' : 'outline'}>
                {tag.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
