'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { 
  Cpu, Box, History, Gauge, Search, RefreshCw, 
  Activity, Zap, ShieldCheck, AlertCircle, Play, 
  Terminal, Server, Globe, ArrowRight, Layers
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { 
  useTfServingDashboard, 
  useReloadModel 
} from '../hooks/useTfServing';

type Tab = 'models' | 'versions' | 'monitoring';

const statusColor: Record<string, string> = {
  'Available': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Loading': 'text-amber-400 bg-amber-500/10 border-amber-500/30 animate-pulse',
  'Unloading': 'text-gray-400 bg-gray-500/10 border-gray-500/30',
  'End of Life': 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  'Ready': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Failed': 'text-danger-light bg-danger/10 border-danger/30',
};

const fmtRel = (iso: string) => {
  if (!iso) return '-';
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'Just now';
  return m < 60 ? `${m}m ago` : m < 1440 ? `${Math.floor(m/60)}h ago` : `${Math.floor(m/1440)}d ago`;
};

export function TfServingDashboard() {
  const { data, isLoading, isRefetching, refetch } = useTfServingDashboard();
  const reloadModel = useReloadModel();

  const [tab, setTab] = useState<Tab>('models');
  const [search, setSearch] = useState('');

  const dbData = data?.data;
  const metrics = dbData?.metrics;

  const handleReload = (name: string) => {
    if (confirm(`Trigger reload for model ${name}?`)) {
      reloadModel.mutate(name);
    }
  };

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'models', label: 'Models', icon: Box },
    { key: 'versions', label: 'Versions', icon: History },
    { key: 'monitoring', label: 'Monitoring', icon: Gauge },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Cpu className="w-7 h-7 text-indigo-400" /> TF Serving Infrastructure
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Model Inference Layer · gRPC/REST Endpoints · Version Orchestration
          </p>
        </div>
        <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5" onClick={() => refetch()} disabled={isRefetching}>
          <RefreshCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} /> Sync State
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Inf/sec', value: metrics?.inferenceRequestsPerSec.toFixed(1), color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: Activity },
          { label: 'Latency', value: `${metrics?.averageLatencyMs}ms`, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: Zap },
          { label: 'Error Rate', value: `${((metrics?.errorRate || 0) * 100).toFixed(2)}%`, color: 'text-rose-400', bg: 'bg-rose-500/10', icon: ShieldCheck },
          { label: 'Active Models', value: metrics?.activeModelCount, color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: Box },
          { label: 'CPU Usage', value: `${metrics?.cpuUsagePercent}%`, color: 'text-gray-300', bg: 'bg-white/5', icon: Server },
          { label: 'Memory', value: `${metrics?.memoryUsageMb}MB`, color: 'text-gray-300', bg: 'bg-white/5', icon: Layers },
          { label: 'Uptime', value: `${Math.floor((metrics?.uptimeSeconds || 0) / 86400)}d`, color: 'text-gray-300', bg: 'bg-white/5', icon: Globe },
        ].map((s, i) => (
          <Card key={i} className="p-4 border-white/[0.06] bg-surface-dark flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
            <div>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold">{s.label}</p>
              <p className={`text-xl font-bold mt-1 ${s.color}`}>
                {isLoading ? <Spinner size="sm" /> : String(s.value || 0)}
              </p>
            </div>
            <div className={`p-2 rounded-xl ${s.bg} group-hover:scale-110 transition-transform`}>
              <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 p-1 bg-black/30 border border-white/[0.06] rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
              tab === t.key ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30' : 'text-gray-400 hover:text-white hover:bg-white/5')}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder={`Filter ${tab}...`}
          className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-indigo-500/50" 
        />
      </div>

      {/* TAB: Models */}
      {tab === 'models' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['Model Name', 'Base Path', 'Active Version', 'Signatures', 'Last Updated', 'Status', ''].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : i === 6 ? 'pr-6 text-right' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dbData?.models.filter(m => m.name.toLowerCase().includes(search.toLowerCase())).map(m => (
                    <tr key={m.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6">
                        <p className="font-bold text-white text-sm flex items-center gap-2">
                          <Box className="w-3.5 h-3.5 text-indigo-400" /> {m.name}
                        </p>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{m.id}</p>
                      </td>
                      <td className="py-4 px-4 font-mono text-[10px] text-gray-500">{m.basePath}</td>
                      <td className="py-4 px-4">
                         <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold">
                           v{m.activeVersion}
                         </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {m.signatureDefs.map(s => (
                            <span key={s} className="text-[9px] text-gray-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 font-mono">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-400">{fmtRel(m.lastUpdated)}</td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[10px] px-2', statusColor[m.status])}>
                          {m.status}
                        </Badge>
                      </td>
                      <td className="py-4 pr-6 text-right">
                        <Button size="sm" variant="outline" onClick={() => handleReload(m.name)} className="h-7 text-[11px] border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
                          <RefreshCw className="w-3 h-3 mr-1" /> Reload
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* TAB: Versions */}
      {tab === 'versions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? <div className="flex justify-center p-16 col-span-full"><Spinner size="lg" /></div> : 
            dbData?.models.map(m => (
              <Card key={m.id} className="p-5 border-white/[0.06] bg-surface-dark flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-white text-base">{m.name}</h3>
                  <Badge variant="outline" className="text-[10px] border-white/10 text-gray-500">
                    {m.versions.length} versions
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {m.versions.map(v => (
                    <div key={v.version} className="p-3 bg-black/20 rounded-xl border border-white/[0.04] flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                         <div className={cn("w-2 h-2 rounded-full", v.status === 'Ready' ? "bg-emerald-500" : v.status === 'Loading' ? "bg-amber-500 animate-pulse" : "bg-rose-500")} />
                         <div>
                           <p className="text-sm font-bold text-white">Version {v.version}</p>
                           {v.statusMessage && <p className="text-[10px] text-rose-400 mt-0.5 italic">{v.statusMessage}</p>}
                         </div>
                      </div>
                      <Badge variant="outline" className={cn('text-[9px]', statusColor[v.status])}>
                        {v.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            ))
          }
        </div>
      )}

      {/* TAB: Monitoring */}
      {tab === 'monitoring' && (
        <Card className="p-10 border-white/[0.06] bg-surface-dark flex flex-col items-center justify-center text-center">
           <div className="p-4 bg-indigo-500/10 rounded-full mb-4">
             <Gauge className="w-12 h-12 text-indigo-400" />
           </div>
           <h2 className="text-xl font-bold text-white mb-2">Advanced Performance Metrics</h2>
           <p className="text-gray-400 max-w-md mb-6">
             Detailed gRPC method tracing, model-specific throughput, and quantile-based latency analysis are being streamed to the Analytics Layer.
           </p>
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
             {[
               { label: '99th Percentile Latency', value: '142ms', icon: Zap },
               { label: '95th Percentile Latency', value: '88ms', icon: Zap },
               { label: 'Success Rate (24h)', value: '99.98%', icon: ShieldCheck },
             ].map((m, i) => (
               <div key={i} className="p-4 bg-black/40 rounded-2xl border border-white/5">
                 <m.icon className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
                 <p className="text-lg font-bold text-white">{m.value}</p>
                 <p className="text-[10px] text-gray-500 uppercase tracking-widest">{m.label}</p>
               </div>
             ))}
           </div>
        </Card>
      )}
    </div>
  );
}
