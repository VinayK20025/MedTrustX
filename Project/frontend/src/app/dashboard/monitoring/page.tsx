'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useUIStore } from '@/store/ui.store';
import { useSystemHealth, useServiceHealth } from '@/hooks/useDashboard';
import { SERVICE_REGISTRY, type ServiceRegistryEntry } from '@/services/gateway';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import {
  Activity, Search, CheckCircle2, XCircle, AlertTriangle,
  Clock, Server, Wifi, WifiOff, RefreshCw, Filter,
} from 'lucide-react';

/* ── Category Colors ─────────────────────────────────── */

const categoryColors: Record<string, string> = {
  clinical: 'from-teal-500 to-teal-700',
  operational: 'from-blue-500 to-blue-700',
  platform: 'from-purple-500 to-purple-700',
  security: 'from-amber-500 to-amber-700',
  infrastructure: 'from-cyan-500 to-cyan-700',
};

const categoryBadgeVariant: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'default'> = {
  clinical: 'success',
  operational: 'info',
  platform: 'default',
  security: 'warning',
  infrastructure: 'info',
};

/* ── Service Card Component ──────────────────────────── */

function ServiceCard({ service }: { service: ServiceRegistryEntry }) {
  const { data: health, isLoading } = useServiceHealth(service.name);

  const statusIcon = health?.status === 'healthy' ? <CheckCircle2 className="w-5 h-5 text-success" /> :
                     health?.status === 'degraded' ? <AlertTriangle className="w-5 h-5 text-warning" /> :
                     health?.status === 'unhealthy' ? <XCircle className="w-5 h-5 text-emergency" /> :
                     <Clock className="w-5 h-5 text-gray-500" />;

  const statusBorder = health?.status === 'healthy' ? 'border-success/20' :
                       health?.status === 'degraded' ? 'border-warning/20' :
                       health?.status === 'unhealthy' ? 'border-emergency/20' :
                       'border-white/[0.08]';

  return (
    <div className={`glass-card p-4 ${statusBorder} transition-all duration-300 hover:bg-white/[0.06]`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {isLoading ? <Spinner size="xs" /> : statusIcon}
          <h3 className="text-sm font-semibold text-white">{service.displayName}</h3>
        </div>
        <Badge variant={categoryBadgeVariant[service.category]} size="sm">
          {service.category}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Service</span>
          <span className="text-xs text-gray-400 font-mono">{service.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Technology</span>
          <Badge variant="default" size="sm">
            {service.technology === 'python' ? 'Python/FastAPI' : 'Node.js/NestJS'}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Port</span>
          <span className="text-xs text-gray-400 font-mono">{service.port}</span>
        </div>
        {health && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Response Time</span>
              <span className={`text-xs font-medium ${
                (health.responseTime ?? 0) < 500 ? 'text-success-light' :
                (health.responseTime ?? 0) < 2000 ? 'text-warning-light' :
                'text-emergency-light'
              }`}>
                {health.responseTime}ms
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Uptime</span>
              <span className="text-xs text-gray-400">{health.uptime}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Main Monitoring Page ────────────────────────────── */

export default function MonitoringPage() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const systemHealth = useSystemHealth();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    setPageMeta('Service Monitoring', 'Real-time microservice health monitoring');
  }, [setPageMeta]);

  const filteredServices = useMemo(() => {
    return SERVICE_REGISTRY.filter(svc => {
      const matchesSearch = !search ||
        svc.name.toLowerCase().includes(search.toLowerCase()) ||
        svc.displayName.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || svc.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [search, categoryFilter]);

  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    SERVICE_REGISTRY.forEach(s => {
      counts[s.category] = (counts[s.category] ?? 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumbs items={[{ label: 'Monitoring' }]} />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700">
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xs text-gray-500 uppercase tracking-wide">Total Services</p>
              <p className="text-2xl font-bold text-white">{SERVICE_REGISTRY.length}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-green-700">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xs text-gray-500 uppercase tracking-wide">Healthy</p>
              <p className="text-2xl font-bold text-white">
                {systemHealth.isLoading ? <Spinner size="sm" /> : systemHealth.data?.healthyCount ?? '—'}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xs text-gray-500 uppercase tracking-wide">Degraded</p>
              <p className="text-2xl font-bold text-white">
                {systemHealth.isLoading ? <Spinner size="sm" /> : systemHealth.data?.degradedCount ?? '—'}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-red-700">
              <XCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xs text-gray-500 uppercase tracking-wide">Unhealthy</p>
              <p className="text-2xl font-bold text-white">
                {systemHealth.isLoading ? <Spinner size="sm" /> : systemHealth.data?.unhealthyCount ?? '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Input
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
          fullWidth={false}
          className="w-full sm:w-80"
        />
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              categoryFilter === 'all' ? 'bg-teal-500/20 text-teal-400' : 'text-gray-500 hover:text-white hover:bg-white/5'
            }`}
          >
            All ({SERVICE_REGISTRY.length})
          </button>
          {Object.entries(categories).map(([cat, count]) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                categoryFilter === cat ? 'bg-teal-500/20 text-teal-400' : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Service Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredServices.map(svc => (
          <ServiceCard key={svc.name} service={svc} />
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Server className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No services match your search.</p>
        </div>
      )}
    </div>
  );
}
