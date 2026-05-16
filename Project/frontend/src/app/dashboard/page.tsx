'use client';
import React, { useEffect, useMemo } from 'react';
import { useUIStore } from '@/store/ui.store';
import { useAuth } from '@/hooks/useAuth';
import { useConnectionState } from '@/hooks/useEvents';
import {
  usePatientStats,
  useAppointmentStats,
  useERStats,
  useBedOccupancy,
  useRevenueStats,
  useDeviceStats,
  useZTAStats,
  useSystemHealth,
  useRecentActivity,
  useLiveActivity,
  useSystemAlerts,
  useDashboardEventSync,
} from '@/hooks/useDashboard';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import {
  Users, Calendar, Siren, Stethoscope, Cpu, Shield, Activity, CreditCard,
  TrendingUp, TrendingDown, ArrowRight, AlertTriangle, CheckCircle2,
  XCircle, Minus, Wifi, WifiOff, RefreshCw,
} from 'lucide-react';

/* ── Stat Card Component (API-driven) ────────────────── */

interface LiveStatProps {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  gradient: string;
  loading?: boolean;
}

function LiveStatCard({ label, value, change, trend, icon: Icon, gradient, loading }: LiveStatProps) {
  return (
    <div className="glass-card-hover p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xs text-gray-500 uppercase tracking-wide font-medium">{label}</p>
          {loading ? (
            <div className="mt-1.5"><Spinner size="sm" /></div>
          ) : (
            <>
              <p className="text-2xl font-bold mt-1.5 text-white">{value}</p>
              <div className="flex items-center gap-1 mt-1.5">
                {trend === 'up' ? <TrendingUp className="w-3 h-3 text-success-light" /> :
                 trend === 'down' ? <TrendingDown className="w-3 h-3 text-emergency-light" /> :
                 <Minus className="w-3 h-3 text-gray-500" />}
                <p className={`text-xs font-medium ${
                  trend === 'up' ? 'text-success-light' :
                  trend === 'down' ? 'text-emergency-light' :
                  'text-gray-500'
                }`}>{change}</p>
              </div>
            </>
          )}
        </div>
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

/* ── Service Health Indicator ───────────────────────── */

function ServiceStatusDot({ status }: { status: string }) {
  const color = status === 'healthy' ? 'bg-success' :
                status === 'degraded' ? 'bg-warning animate-pulse' :
                status === 'unhealthy' ? 'bg-emergency animate-pulse' :
                'bg-gray-600';
  return <div className={`w-2 h-2 rounded-full ${color}`} />;
}

/* ── Connection Status Badge ─────────────────────────── */

function ConnectionBadge() {
  const connectionState = useConnectionState();
  const variant = connectionState === 'connected' ? 'success' :
                  connectionState === 'connecting' || connectionState === 'reconnecting' ? 'warning' :
                  'danger';
  const icon = connectionState === 'connected' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />;

  return (
    <Badge variant={variant} size="sm" dot>
      <span className="flex items-center gap-1">
        {icon}
        {connectionState === 'connected' ? 'Live' : connectionState}
      </span>
    </Badge>
  );
}

/* ── Format Helpers ──────────────────────────────────── */

function formatCurrency(amount: number, currency = 'INR'): string {
  if (currency === 'INR') {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount.toLocaleString('en-IN')}`;
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(0)}%`;
}

function timeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/* ── Main Dashboard Page ─────────────────────────────── */

export default function DashboardPage() {
  const { user, tenant } = useAuth();
  const setPageMeta = useUIStore((s) => s.setPageMeta);

  // ── Backend data hooks ────────────────────────────
  const patientStats = usePatientStats();
  const appointmentStats = useAppointmentStats();
  const erStats = useERStats();
  const bedOccupancy = useBedOccupancy();
  const revenueStats = useRevenueStats();
  const deviceStats = useDeviceStats();
  const ztaStats = useZTAStats();
  const systemHealth = useSystemHealth();
  const recentActivity = useRecentActivity(10);
  const systemAlerts = useSystemAlerts();

  // ── Real-time events sync ─────────────────────────
  const liveEvents = useLiveActivity();
  useDashboardEventSync();

  useEffect(() => {
    setPageMeta('Dashboard', `Welcome back — ${tenant?.name ?? 'MedTrustX'} Overview`);
  }, [setPageMeta, tenant]);

  // ── Build stats from real data ────────────────────
  const stats: LiveStatProps[] = useMemo(() => [
    {
      label: 'Active Patients',
      value: patientStats.data ? patientStats.data.totalActive.toLocaleString() : '—',
      change: patientStats.data ? formatPercent(patientStats.data.changePercent) : '—',
      trend: (patientStats.data?.changePercent ?? 0) >= 0 ? 'up' : 'down',
      icon: Users,
      gradient: 'from-teal-500 to-teal-700',
      loading: patientStats.isLoading,
    },
    {
      label: "Today's Appointments",
      value: appointmentStats.data ? appointmentStats.data.todayTotal.toLocaleString() : '—',
      change: appointmentStats.data ? formatPercent(appointmentStats.data.changePercent) : '—',
      trend: (appointmentStats.data?.changePercent ?? 0) >= 0 ? 'up' : 'down',
      icon: Calendar,
      gradient: 'from-blue-500 to-blue-700',
      loading: appointmentStats.isLoading,
    },
    {
      label: 'ER Cases',
      value: erStats.data ? erStats.data.activeCases.toString() : '—',
      change: erStats.data ? formatPercent(erStats.data.changePercent) : '—',
      trend: (erStats.data?.changePercent ?? 0) <= 0 ? 'down' : 'up',
      icon: Siren,
      gradient: 'from-red-500 to-red-700',
      loading: erStats.isLoading,
    },
    {
      label: 'Active Consultations',
      value: appointmentStats.data ? (appointmentStats.data.todayTotal - appointmentStats.data.completed).toString() : '—',
      change: appointmentStats.data ? `${appointmentStats.data.completed} done` : '—',
      trend: 'up' as const,
      icon: Stethoscope,
      gradient: 'from-purple-500 to-purple-700',
      loading: appointmentStats.isLoading,
    },
    {
      label: 'IoMT Devices Online',
      value: deviceStats.data ? deviceStats.data.onlineDevices.toLocaleString() : '—',
      change: deviceStats.data ? `${deviceStats.data.uptimePercent.toFixed(1)}%` : '—',
      trend: (deviceStats.data?.uptimePercent ?? 0) >= 95 ? 'up' : 'down',
      icon: Cpu,
      gradient: 'from-cyan-500 to-cyan-700',
      loading: deviceStats.isLoading,
    },
    {
      label: 'ZTA Trust Score',
      value: ztaStats.data ? `${ztaStats.data.trustScore.toFixed(1)}%` : '—',
      change: ztaStats.data ? (ztaStats.data.status === 'healthy' ? 'Healthy' : ztaStats.data.status) : '—',
      trend: ztaStats.data?.status === 'healthy' ? 'up' : 'down',
      icon: Shield,
      gradient: 'from-teal-500 to-emerald-700',
      loading: ztaStats.isLoading,
    },
    {
      label: 'Bed Occupancy',
      value: bedOccupancy.data ? `${bedOccupancy.data.occupancyRate.toFixed(0)}%` : '—',
      change: bedOccupancy.data ? `${bedOccupancy.data.occupied}/${bedOccupancy.data.totalBeds}` : '—',
      trend: (bedOccupancy.data?.occupancyRate ?? 0) > 90 ? 'down' : 'up',
      icon: Activity,
      gradient: 'from-amber-500 to-amber-700',
      loading: bedOccupancy.isLoading,
    },
    {
      label: 'Revenue Today',
      value: revenueStats.data ? formatCurrency(revenueStats.data.todayRevenue, revenueStats.data.currency) : '—',
      change: revenueStats.data ? formatPercent(revenueStats.data.changePercent) : '—',
      trend: (revenueStats.data?.changePercent ?? 0) >= 0 ? 'up' : 'down',
      icon: CreditCard,
      gradient: 'from-pink-500 to-pink-700',
      loading: revenueStats.isLoading,
    },
  ], [patientStats, appointmentStats, erStats, bedOccupancy, revenueStats, deviceStats, ztaStats]);

  // ── Merge REST activity with live WebSocket events ─
  const mergedActivity = useMemo(() => {
    const restItems = (recentActivity.data ?? []).map(a => ({
      time: timeAgo(a.time),
      event: a.event,
      type: a.type,
      source: a.source,
    }));

    const liveItems = liveEvents.map(e => ({
      time: timeAgo(e.timestamp),
      event: `${e.action}: ${e.entityType} ${e.entityId ?? ''}`.trim(),
      type: (e.priority === 'critical' ? 'critical' :
             e.priority === 'high' ? 'warning' :
             'info') as 'critical' | 'warning' | 'success' | 'info',
      source: e.domain,
    }));

    // Interleave live events at top, then REST
    return [...liveItems, ...restItems].slice(0, 15);
  }, [recentActivity.data, liveEvents]);

  // ── Service health from real data ─────────────────
  const serviceHealthList = useMemo(() => {
    if (systemHealth.data?.services?.length) {
      return systemHealth.data.services.slice(0, 8);
    }
    return [];
  }, [systemHealth.data]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.firstName ?? 'Doctor'}
          </h1>
          <p className="text-gray-400 mt-1 text-sm">{tenant?.name ?? 'MedTrustX'} — DHOS Overview</p>
        </div>
        <div className="flex items-center gap-2">
          <ConnectionBadge />
          <Badge variant={ztaStats.data?.status === 'healthy' ? 'success' : 'warning'} dot>
            ZTA {ztaStats.data?.status === 'healthy' ? 'Active' : ztaStats.data?.status ?? 'Loading'}
          </Badge>
          <Badge variant="info">Multi-Tenant</Badge>
        </div>
      </div>

      {/* System Alerts Banner */}
      {(systemAlerts.data ?? []).filter(a => !a.acknowledged && a.severity === 'critical').length > 0 && (
        <div className="glass-card border-emergency/30 bg-emergency/5 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-emergency-light flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-emergency-light">
                {systemAlerts.data!.filter(a => !a.acknowledged && a.severity === 'critical').length} critical alert(s) require attention
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {systemAlerts.data!.filter(a => !a.acknowledged && a.severity === 'critical')[0]?.message}
              </p>
            </div>
            <button className="text-xs text-teal-400 hover:underline whitespace-nowrap">View All</button>
          </div>
        </div>
      )}

      {/* Stats Grid — driven by real API data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <LiveStatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Activity Feed — merged REST + WebSocket */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Live Activity"
            subtitle={liveEvents.length > 0 ? `${liveEvents.length} live events` : 'Real-time event feed'}
            action={
              <button className="text-xs text-teal-400 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </button>
            }
          />
          <div className="divide-y divide-white/[0.04]">
            {mergedActivity.length === 0 && recentActivity.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="md" />
              </div>
            ) : mergedActivity.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-500 text-sm">
                No recent activity. Events will appear here in real-time.
              </div>
            ) : (
              mergedActivity.map((item, i) => (
                <div key={i} className="px-5 py-3.5 flex items-start gap-3 hover:bg-white/[0.02] transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    item.type === 'critical' ? 'bg-emergency animate-pulse' :
                    item.type === 'warning' ? 'bg-warning' :
                    item.type === 'success' ? 'bg-success' : 'bg-teal-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300">{item.event}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{item.time} · {item.source}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Service Health — real health checks */}
        <Card>
          <CardHeader
            title="Service Health"
            subtitle={systemHealth.data
              ? `${systemHealth.data.healthyCount}/${systemHealth.data.totalServices} healthy`
              : 'Checking services...'}
            action={
              systemHealth.isRefetching ? (
                <RefreshCw className="w-3.5 h-3.5 text-gray-500 animate-spin" />
              ) : null
            }
          />
          <CardBody className="p-3 space-y-1">
            {systemHealth.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="md" />
              </div>
            ) : serviceHealthList.length === 0 ? (
              <div className="px-3 py-6 text-center text-gray-500 text-sm">
                Service health data unavailable. Ensure backend services are running.
              </div>
            ) : (
              serviceHealthList.map((svc) => (
                <div key={svc.name} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                  <div className="flex items-center gap-2.5">
                    <ServiceStatusDot status={svc.status} />
                    <span className="text-sm font-mono text-gray-300">{svc.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{svc.uptime}</span>
                    {svc.responseTime > 0 && (
                      <span className="text-xs text-gray-600">{svc.responseTime}ms</span>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Overall status footer */}
            {systemHealth.data && (
              <div className="mt-2 pt-2 border-t border-white/[0.04] px-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Overall Status</span>
                  <Badge
                    variant={
                      systemHealth.data.overallStatus === 'healthy' ? 'success' :
                      systemHealth.data.overallStatus === 'degraded' ? 'warning' : 'danger'
                    }
                    size="sm"
                  >
                    {systemHealth.data.overallStatus}
                  </Badge>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
