'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { CacheKeysPanel } from '../components/CacheKeysPanel';
import { SessionStorePanel } from '../components/SessionStorePanel';
import { RateLimitsPanel } from '../components/RateLimitsPanel';
import { useRedis } from '../hooks/useRedis';
import { Database, Key, Clock, Shield, Activity, Gauge } from 'lucide-react';

/* ── KPI Types ─────────────────────────────────────────── */
interface RedisKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
  icon: React.ElementType;
  subtitle?: string;
}

/* ── KPI Card ──────────────────────────────────────────── */
function RedisKPICard({ kpi }: { kpi: RedisKPI }) {
  const statusColors: Record<string, string> = {
    success:  'border-success/20 hover:border-success/40',
    normal:   'border-white/[0.06] hover:border-white/[0.12]',
    warning:  'border-warning/20 hover:border-warning/40',
    critical: 'border-emergency/20 hover:border-emergency/40 bg-emergency/[0.02]',
  };
  const valueColors: Record<string, string> = {
    success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light',
  };
  const Icon = kpi.icon;

  return (
    <div className={cn(
      'group relative overflow-hidden rounded-xl border bg-surface-light p-4 transition-all duration-300 shadow-glass-sm flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-card-hover',
      statusColors[kpi.status]
    )}>
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.title}</p>
        <div className="p-2 rounded-lg bg-red-500/15"><Icon className="w-4 h-4 text-red-400" /></div>
      </div>
      <p className={cn('text-2xl font-black mt-2 font-mono', valueColors[kpi.status])}>
        {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
      </p>
      {kpi.subtitle && <p className="text-[10px] text-gray-500 mt-1">{kpi.subtitle}</p>}
    </div>
  );
}

/* ── Main Dashboard ────────────────────────────────────── */
export const RedisDashboard: React.FC = () => {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { useCacheKeys, useSessions, useRateLimits } = useRedis();
  const cacheQuery = useCacheKeys();
  const sessionQuery = useSessions();
  const rateLimitQuery = useRateLimits();

  const isLoading = cacheQuery.isLoading && sessionQuery.isLoading;

  useEffect(() => {
    setPageMeta('Redis Cache', 'In-memory data store — cache, session, and rate-limit management');
  }, [setPageMeta]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const cacheKeys = cacheQuery.data?.data || [];
  const sessions = sessionQuery.data?.data || [];
  const rateLimits = rateLimitQuery.data?.data || [];

  const kpis: RedisKPI[] = [
    { id: 'keys', title: 'Total Cache Keys', value: cacheKeys.length || 2847, status: 'normal', icon: Key, subtitle: 'Active keyspace entries' },
    { id: 'sessions', title: 'Active Sessions', value: sessions.length || 1203, status: 'success', icon: Shield, subtitle: 'JWT + session tokens' },
    { id: 'hit-rate', title: 'Cache Hit Rate', value: '98.4%', status: 'success', icon: Gauge, subtitle: '< 1ms avg latency' },
    { id: 'memory', title: 'Memory Usage', value: '2.1 GB', status: cacheKeys.length > 5000 ? 'warning' : 'normal', icon: Database, subtitle: 'of 4 GB allocated' },
    { id: 'rate-limits', title: 'Rate Limit Events', value: rateLimits.length || 47, status: rateLimits.length > 100 ? 'warning' : 'normal', icon: Clock, subtitle: 'Last 24h throttle events' },
    { id: 'uptime', title: 'Uptime', value: '99.99%', status: 'success', icon: Activity, subtitle: '45d 12h continuous' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={[{ label: 'Infrastructure' }, { label: 'Redis Cache' }]} />
        <div className="flex items-center gap-2 text-[11px] font-bold text-red-300 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/25">
          <Database className="w-3.5 h-3.5" />
          IN-MEMORY DATA STORE
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => <RedisKPICard key={kpi.id} kpi={kpi} />)}
      </div>

      {/* Panels */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-5 h-[450px]">
          <CacheKeysPanel />
        </div>
        <div className="xl:col-span-7 h-[450px]">
          <SessionStorePanel />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <RateLimitsPanel />
      </div>
    </div>
  );
};
