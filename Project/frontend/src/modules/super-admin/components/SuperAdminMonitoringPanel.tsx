'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ServiceHealth, InfraMetrics, SystemMetricTimeSeries } from '../types/superAdmin.types';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, CartesianGrid } from 'recharts';
import { Server, Cpu, HardDrive, Network, Activity, CheckCircle2, AlertTriangle, XCircle, Wrench } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props {
  services: ServiceHealth[];
  infra: InfraMetrics;
  timeSeries: SystemMetricTimeSeries[];
}

const statusCfg: Record<string, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  healthy:     { icon: CheckCircle2, color: 'text-success-light', bg: 'bg-success/15' },
  degraded:    { icon: AlertTriangle, color: 'text-warning-light', bg: 'bg-warning/15' },
  down:        { icon: XCircle, color: 'text-emergency-light', bg: 'bg-emergency/15' },
  maintenance: { icon: Wrench, color: 'text-blue-400', bg: 'bg-blue-500/15' },
};

function MetricGauge({ label, value, threshold, icon: Icon, unit }: { label: string; value: number; threshold: number; icon: typeof Cpu; unit: string }) {
  const pct = Math.min(value, 100);
  const color = value > threshold * 0.9 ? 'bg-emergency' : value > threshold * 0.7 ? 'bg-warning' : 'bg-teal-500';
  const textColor = value > threshold * 0.9 ? 'text-emergency-light' : value > threshold * 0.7 ? 'text-warning-light' : 'text-teal-400';
  return (
    <div className="p-3 rounded-xl border border-white/[0.06] bg-surface-dark">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1"><Icon className="w-3 h-3" />{label}</span>
        <span className={cn('text-sm font-black', textColor)}>{value.toFixed(1)}{unit}</span>
      </div>
      <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-700', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function SuperAdminMonitoringPanel({ services, infra, timeSeries }: Props) {
  const healthy = services.filter(s => s.status === 'healthy').length;
  const degraded = services.filter(s => s.status === 'degraded').length;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-surface-dark border border-white/10 p-3 rounded-lg shadow-xl text-xs">
          <p className="text-white font-bold mb-1.5">{label}</p>
          {payload.map((e: any, i: number) => (
            <div key={i} className="flex justify-between gap-4 text-gray-400">
              <span>{e.name}:</span>
              <span className="text-white font-bold">{typeof e.value === 'number' ? e.value.toFixed(1) : e.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/15"><Server className="w-4 h-4 text-cyan-400" /></div>
          <div>
            <h3 className="text-[15px] font-bold text-white tracking-wide">System Monitoring</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              <span className="text-success-light font-bold">{healthy}</span> healthy ·
              {degraded > 0 && <span className="text-warning-light font-bold ml-1">{degraded} degraded</span>}
              {degraded === 0 && <span className="ml-1">{services.length} services</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          Live
        </div>
      </CardHeader>

      <CardBody className="p-4 flex-1 overflow-y-auto space-y-5 max-h-[600px]">
        {/* Infrastructure Gauges */}
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2.5">Infrastructure</p>
          <div className="grid grid-cols-2 gap-2.5">
            <MetricGauge label="CPU" value={infra.cpuUtilization} threshold={80} icon={Cpu} unit="%" />
            <MetricGauge label="Memory" value={infra.memoryUtilization} threshold={85} icon={HardDrive} unit="%" />
            <MetricGauge label="Disk" value={infra.diskUtilization} threshold={90} icon={HardDrive} unit="%" />
            <MetricGauge label="Cache Hit" value={infra.cacheHitRate} threshold={100} icon={Activity} unit="%" />
          </div>
          <div className="grid grid-cols-3 gap-2.5 mt-2.5">
            <div className="p-2.5 rounded-lg border border-white/[0.06] bg-surface-dark text-center">
              <span className="text-[9px] text-gray-600 uppercase tracking-widest font-bold block">Nodes</span>
              <span className="text-sm font-bold text-white">{infra.healthyNodes}/{infra.totalNodes}</span>
            </div>
            <div className="p-2.5 rounded-lg border border-white/[0.06] bg-surface-dark text-center">
              <span className="text-[9px] text-gray-600 uppercase tracking-widest font-bold block">Containers</span>
              <span className="text-sm font-bold text-white">{infra.runningContainers}/{infra.totalContainers}</span>
            </div>
            <div className="p-2.5 rounded-lg border border-white/[0.06] bg-surface-dark text-center">
              <span className="text-[9px] text-gray-600 uppercase tracking-widest font-bold block">Connections</span>
              <span className="text-sm font-bold text-white">{infra.activeConnections.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* CPU/Memory Chart */}
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2.5">24h Trend</p>
          <div className="h-[140px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} /><stop offset="95%" stopColor="#14b8a6" stopOpacity={0} /></linearGradient>
                  <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} /><stop offset="95%" stopColor="#818cf8" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="timestamp" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }} tickLine={false} axisLine={false} interval={5} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="cpu" name="CPU %" stroke="#14b8a6" fill="url(#cpuGrad)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="memory" name="Memory %" stroke="#818cf8" fill="url(#memGrad)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service List */}
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2.5">Services</p>
          <div className="space-y-1.5">
            {services.map(svc => {
              const cfg = statusCfg[svc.status] || statusCfg.healthy;
              const SIcon = cfg.icon;
              return (
                <div key={svc.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-white/[0.04] bg-surface-dark hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-2.5">
                    <SIcon className={cn('w-3.5 h-3.5', cfg.color)} />
                    <div>
                      <span className="text-[12px] font-bold text-white block">{svc.displayName}</span>
                      <span className="text-[9px] font-mono text-gray-600">{svc.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-gray-500">
                    <span>{svc.responseTime}ms</span>
                    <span>{svc.uptime}%</span>
                    <span className={cn('font-bold', svc.errorRate > 0.5 ? 'text-warning-light' : 'text-gray-500')}>{svc.errorRate}% err</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
