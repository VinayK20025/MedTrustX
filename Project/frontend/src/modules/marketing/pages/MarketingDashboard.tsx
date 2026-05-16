'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Spinner';
import { MarketingKPICard } from '../components/MarketingKPICard';
import { CampaignPanel } from '../components/CampaignPanel';
import { FunnelPanel } from '../components/FunnelPanel';
import { ChannelPanel } from '../components/ChannelPanel';
import { useMarketingDashboard } from '../hooks/useMarketingAnalytics';
import type { MarketingFilters } from '../services/marketing.api';

export function MarketingDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const [filters, setFilters] = useState<MarketingFilters>({ period: '30d' });
  const { data, isLoading } = useMarketingDashboard(filters);

  useEffect(() => {
    setPageMeta('Growth & Marketing', 'Patient acquisition, campaign ROI & channel optimization');
  }, [setPageMeta]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No marketing data available</div>;

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Marketing Command' }, { label: 'Growth Dashboard' }]} />
        <Select
          options={[
            { label: 'Today', value: 'today' },
            { label: 'Last 7 Days', value: '7d' },
            { label: 'Last 30 Days', value: '30d' },
            { label: 'Last 90 Days', value: '90d' },
            { label: 'Year to Date', value: 'ytd' },
          ]}
          value={filters.period}
          onChange={(e) => setFilters({ ...filters, period: e.target.value as any })}
          className="w-full sm:w-44 bg-surface-dark border-white/[0.08]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {d.kpis.map(kpi => <MarketingKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><CampaignPanel campaigns={d.campaigns} /></div>
        <FunnelPanel stages={d.funnel} />
      </div>

      <ChannelPanel channels={d.channels} />
    </div>
  );
}
