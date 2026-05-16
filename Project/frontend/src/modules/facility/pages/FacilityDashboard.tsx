'use client';

import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { FacilityAssetPanel } from '../components/FacilityAssetPanel';
import { MaintenanceWorkspace } from '../components/MaintenanceWorkspace';
import { UtilitySafetyPanel } from '../components/UtilitySafetyPanel';
import { useFacilityDashboard } from '../hooks/useFacilityAnalytics';
import type { FacilityFilters, Asset, MaintenanceRequest } from '../services/facility.api';
import type { FacilityKPI } from '../types/facility.types';
import { Building2, AlertTriangle } from 'lucide-react';

function FacKPICard({ kpi }: { kpi: FacilityKPI }) {
  const sc: Record<string, string> = {
    success: 'border-success/20',
    normal: 'border-white/[0.06]',
    warning: 'border-warning/20 bg-warning/[0.02]',
    critical: 'border-emergency/20 bg-emergency/[0.02]',
  };
  const vc: Record<string, string> = {
    success: 'text-success-light',
    normal: 'text-white',
    warning: 'text-warning-light',
    critical: 'text-emergency-light',
  };

  return (
    <div className={cn('rounded-xl border bg-surface-light p-4 shadow-glass-sm', sc[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
        {(kpi.status === 'warning' || kpi.status === 'critical') && (
          <AlertTriangle className="w-3 h-3" />
        )}
        {kpi.title}
      </p>
      <p className={cn('text-2xl font-black mt-2 font-mono', vc[kpi.status])}>
        {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
      </p>
    </div>
  );
}

function AssetItem({
  asset,
  isSelected,
  onSelect,
}: {
  asset: Asset;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const statusColor: Record<string, string> = {
    operational: 'bg-success/10 border-success/30 text-success-light',
    degraded: 'bg-warning/10 border-warning/30 text-warning-light',
    offline: 'bg-emergency/10 border-emergency/30 text-emergency-light',
    maintenance: 'bg-blue/10 border-blue/30 text-blue-light',
  };

  return (
    <button
      onClick={() => onSelect(asset.id)}
      className={cn(
        'w-full text-left p-3 rounded-lg border transition-all',
        isSelected ? 'border-blue/50 bg-blue/10' : 'border-white/[0.06] hover:border-white/10'
      )}
    >
      <p className="text-xs font-bold text-gray-300">{asset.name}</p>
      <p className="text-[10px] text-gray-500 mt-1">{asset.location}</p>
      <div className={cn('mt-2 inline-block px-2 py-1 rounded text-[10px] font-bold', statusColor[asset.status])}>
        {asset.status}
      </div>
    </button>
  );
}

function MaintenanceItem({ request }: { request: MaintenanceRequest }) {
  const statusColor: Record<string, string> = {
    open: 'bg-yellow/10 border-yellow/30 text-yellow-light',
    in_progress: 'bg-blue/10 border-blue/30 text-blue-light',
    resolved: 'bg-success/10 border-success/30 text-success-light',
    cancelled: 'bg-gray/10 border-gray/30 text-gray-light',
  };

  const priorityColor: Record<string, string> = {
    low: 'text-gray-400',
    medium: 'text-yellow-500',
    high: 'text-orange-500',
    critical: 'text-emergency-light',
  };

  return (
    <div className="p-3 rounded-lg border border-white/[0.06] bg-surface-light">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white truncate">{request.issue_description}</p>
          <p className="text-[10px] text-gray-500 mt-1">ID: {request.id}</p>
        </div>
        <div className={cn('px-2 py-1 rounded text-[10px] font-bold', statusColor[request.status])}>
          {request.status}
        </div>
      </div>
      <p className="text-[10px] text-gray-500 mt-2">Reported: {new Date(request.reported_at).toLocaleDateString()}</p>
    </div>
  );
}

export function FacilityDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters] = useState<FacilityFilters>({});
  const [selectedAssetId, setSelectedAssetId] = useState<string | undefined>();
  const { data, isLoading } = useFacilityDashboard(filters);

  useEffect(() => {
    setPageMeta('Facility Management', 'Hospital infrastructure command — maintenance, utilities, and asset tracking');
  }, [setPageMeta]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1800px]">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const d = data?.data;
  if (!d) {
    return <div className="text-gray-500 py-20 text-center">No data available</div>;
  }

  const relevantRequests = selectedAssetId
    ? d.maintenanceRequests.filter((m) => m.asset_id === selectedAssetId)
    : d.maintenanceRequests;

  return (
    <div className="space-y-5 animate-fade-in max-w-[1800px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Operations' }, { label: 'Facility Management' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-300 bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/25">
          <Building2 className="w-3.5 h-3.5" /> FACILITY COMMAND
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map((kpi) => (
          <FacKPICard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-3 h-[650px] rounded-xl border border-white/[0.06] bg-surface-light p-4 overflow-y-auto">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Assets</h3>
          <div className="space-y-2">
            {d.assets.map((asset) => (
              <AssetItem
                key={asset.id}
                asset={asset}
                isSelected={selectedAssetId === asset.id}
                onSelect={setSelectedAssetId}
              />
            ))}
          </div>
        </div>

        <div className="xl:col-span-6 h-[650px] rounded-xl border border-white/[0.06] bg-surface-light p-4 overflow-y-auto">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
            Maintenance Requests {selectedAssetId && `(${relevantRequests.length})`}
          </h3>
          <div className="space-y-3">
            {relevantRequests.length > 0 ? (
              relevantRequests.map((request) => (
                <MaintenanceItem key={request.id} request={request} />
              ))
            ) : (
              <p className="text-gray-500 text-sm">
                {selectedAssetId ? 'No maintenance requests for this asset' : 'No maintenance requests'}
              </p>
            )}
          </div>
        </div>

        <div className="xl:col-span-3 h-[650px] rounded-xl border border-white/[0.06] bg-surface-light p-4 overflow-y-auto">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Summary</h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-[10px] text-gray-500 uppercase">Total Facilities</p>
              <p className="text-lg font-bold text-white mt-1">{d.facilities.length}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase">Total Rooms</p>
              <p className="text-lg font-bold text-white mt-1">{d.rooms.length}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase">Active Assets</p>
              <p className="text-lg font-bold text-success-light mt-1">
                {d.assets.filter((a) => a.status === 'operational').length}/{d.assets.length}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase">Open Maintenance</p>
              <p className="text-lg font-bold text-warning-light mt-1">
                {d.maintenanceRequests.filter((m) => m.status === 'open' || m.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
