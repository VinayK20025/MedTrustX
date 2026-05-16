'use client';

import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Spinner';
import { useAssets } from '@/modules/facility';
import { cn } from '@/utils/cn';

const FACILITY_ROLES = ['facilities_manager', 'admin', 'super_admin', 'facilities_tech'];

function AssetRow({ asset }: { asset: any }) {
  const statusColor: Record<string, string> = {
    operational: 'bg-success/10 text-success-light border-success/20',
    degraded: 'bg-warning/10 text-warning-light border-warning/20',
    offline: 'bg-emergency/10 text-emergency-light border-emergency/20',
    maintenance: 'bg-blue/10 text-blue-light border-blue/20',
  };

  return (
    <tr className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors">
      <td className="px-4 py-3 text-sm font-medium text-white">{asset.name}</td>
      <td className="px-4 py-3 text-sm text-gray-400 capitalize">{asset.category.replace('_', ' ')}</td>
      <td className="px-4 py-3 text-sm text-gray-400">{asset.location}</td>
      <td className="px-4 py-3">
        <span
          className={cn(
            'px-2 py-1 rounded text-xs font-bold border',
            statusColor[asset.status]
          )}
        >
          {asset.status}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-gray-500">
        {new Date(asset.created_at).toLocaleDateString()}
      </td>
    </tr>
  );
}

export default function FacilityAssetsPage() {
  const { data, isLoading } = useAssets();

  return (
    <RoleGuard roles={FACILITY_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1400px]">
        <Breadcrumbs items={[{ label: 'Facility' }, { label: 'Assets' }]} />

        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardBody>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded" />
                ))}
              </div>
            ) : data?.data && data.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Asset Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Location
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((asset) => (
                      <AssetRow key={asset.id} asset={asset} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No assets found</p>
            )}
          </CardBody>
        </Card>
      </div>
    </RoleGuard>
  );
}
