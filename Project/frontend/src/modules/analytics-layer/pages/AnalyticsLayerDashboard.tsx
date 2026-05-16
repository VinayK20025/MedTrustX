'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { 
  BarChart3, Activity, Database, GitBranch, Search, 
  RefreshCw, Play, Pause, XCircle, Clock, CheckCircle, AlertTriangle 
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { 
  useAnalyticsDashboard, 
  useRestartPipeline, 
  usePausePipeline, 
  useCancelQuery 
} from '../hooks/useAnalytics';

type Tab = 'pipelines' | 'sources' | 'queries' | 'dashboards';

const statusColor: Record<string, string> = {
  'Connected': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Degraded': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Disconnected': 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  'Running': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30 animate-pulse',
  'Completed': 'text-success-light bg-success/10 border-success/30',
  'Success': 'text-success-light bg-success/10 border-success/30',
  'Failed': 'text-danger-light bg-danger/10 border-danger/30',
  'Paused': 'text-gray-400 bg-gray-500/10 border-gray-500/30',
  'Queued': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  'Pending': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  'Published': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Draft': 'text-gray-400 bg-gray-500/10 border-gray-500/30',
  'Deprecated': 'text-rose-400 bg-rose-500/10 border-rose-500/30',
};

const fmtRel = (iso: string) => {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  return m < 60 ? `${m}m ago` : m < 1440 ? `${Math.floor(m/60)}h ago` : `${Math.floor(m/1440)}d ago`;
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function AnalyticsLayerDashboard() {
  const { data, isLoading, isRefetching, refetch } = useAnalyticsDashboard();
  const restartPipeline = useRestartPipeline();
  const pausePipeline = usePausePipeline();
  const cancelQuery = useCancelQuery();

  const [tab, setTab] = useState<Tab>('pipelines');
  const [search, setSearch] = useState('');

  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});

  const dashboardData = data?.data;
  const metrics = dashboardData?.metrics;

  const handleRestart = (id: string) => {
    setLocalStatuses(p => ({ ...p, [id]: 'Running' }));
    restartPipeline.mutate(id);
  };

  const handlePause = (id: string) => {
    setLocalStatuses(p => ({ ...p, [id]: 'Paused' }));
    pausePipeline.mutate(id);
  };

  const handleCancel = (id: string) => {
    setLocalStatuses(p => ({ ...p, [id]: 'Failed' }));
    cancelQuery.mutate(id);
  };

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'pipelines', label: 'Data Pipelines', icon: GitBranch },
    { key: 'sources', label: 'Data Sources', icon: Database },
    { key: 'queries', label: 'Active Queries', icon: Activity },
    { key: 'dashboards', label: 'BI Dashboards', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-indigo-400" /> Analytics Layer & BI
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Data Warehousing · ETL Pipelines · Query Engine · Business Intelligence
          </p>
        </div>
        <Button 
          variant="outline" 
          className="border-white/10 text-gray-300 hover:bg-white/5" 
          onClick={() => refetch()} 
          disabled={isRefetching}
        >
          <RefreshCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} /> 
          Sync
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Active Pipelines', value: metrics?.activePipelines, color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: GitBranch },
          { label: 'Failed Pipelines', value: metrics?.failedPipelines, color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertTriangle },
          { label: 'Ingested (TB)', value: metrics?.dataIngestedTB, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: Database },
          { label: 'Query Latency', value: `${metrics?.avgQueryLatencyMs}ms`, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Clock },
          { label: 'Active Users', value: metrics?.activeUsers, color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: Activity },
          { label: 'Compute Cost', value: `$${metrics?.computeCostMonthToDate?.toLocaleString()}`, color: 'text-gray-300', bg: 'bg-white/5', icon: BarChart3 },
        ].map((s, i) => (
          <Card key={i} className="p-4 border-white/[0.06] bg-surface-dark flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
            <div>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold">{s.label}</p>
              <p className={`text-xl font-bold mt-1 ${s.color}`}>
                {isLoading ? <Spinner size="sm" /> : String(s.value || 0)}
              </p>
            </div>
            <div className={`p-2.5 rounded-xl ${s.bg} group-hover:scale-110 transition-transform`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
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
          placeholder={`Search ${tab}…`}
          className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-indigo-500/50" 
        />
      </div>

      {/* TAB: Pipelines */}
      {tab === 'pipelines' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['Pipeline Name', 'Type', 'Source → Destination', 'Records', 'Error Rate', 'Last Run', 'Status', ''].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : i === 7 ? 'pr-6 text-right' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dashboardData?.pipelines.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => {
                    const currentStatus = localStatuses[p.id] || p.status;
                    return (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-4 pl-6">
                          <p className="font-bold text-white text-sm">{p.name}</p>
                          <p className="text-[10px] text-gray-500 font-mono mt-0.5">{p.id} · {p.owner}</p>
                        </td>
                        <td className="py-4 px-4"><Badge variant="outline" className="text-[10px] bg-white/5 border-white/10 text-gray-300">{p.type.replace('_', ' ')}</Badge></td>
                        <td className="py-4 px-4">
                          <p className="text-xs text-gray-300 truncate max-w-[150px]">{p.source}</p>
                          <p className="text-[10px] text-gray-500">→ {p.destination}</p>
                        </td>
                        <td className="py-4 px-4 text-white font-bold">{p.recordsProcessed.toLocaleString()}</td>
                        <td className="py-4 px-4">
                          <span className={cn('font-bold', p.errorRate > 5 ? 'text-red-400' : p.errorRate > 0 ? 'text-amber-400' : 'text-emerald-400')}>
                            {p.errorRate}%
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs text-gray-400">{fmtRel(p.lastRunTime)}</td>
                        <td className="py-4 px-4">
                          <Badge variant="outline" className={cn('text-[10px] px-2', statusColor[currentStatus])}>
                            {currentStatus}
                          </Badge>
                        </td>
                        <td className="py-4 pr-6 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {currentStatus === 'Running' ? (
                              <Button size="sm" variant="outline" onClick={() => handlePause(p.id)} className="h-7 text-[11px] border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
                                <Pause className="w-3 h-3 mr-1" /> Pause
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => handleRestart(p.id)} className="h-7 text-[11px] border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
                                <Play className="w-3 h-3 mr-1" /> Run
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* TAB: Sources */}
      {tab === 'sources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? <div className="flex justify-center p-16 col-span-full"><Spinner size="lg" /></div> : 
            dashboardData?.dataSources.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map(s => (
              <Card key={s.id} className="p-5 border-white/[0.06] bg-surface-dark hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <Database className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white">{s.name}</p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{s.type}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn('text-[10px]', statusColor[s.connectionStatus])}>
                    {s.connectionStatus}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-black/20 rounded-lg p-2.5 border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase">Total Size</p>
                    <p className="text-sm font-bold text-white mt-0.5">{formatBytes(s.dataSizeMB * 1024 * 1024)}</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-2.5 border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase">Records</p>
                    <p className="text-sm font-bold text-white mt-0.5">{(s.totalRecords / 1000000).toFixed(1)}M</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 flex items-center gap-1"><Activity className="w-3.5 h-3.5" /> {s.ingestionRatePerSec} req/s</span>
                  <span className="text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Sync: {fmtRel(s.lastSync)}</span>
                </div>
              </Card>
            ))
          }
        </div>
      )}

      {/* TAB: Queries */}
      {tab === 'queries' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['Query ID', 'Name / User', 'Bytes Processed', 'Execution Time', 'Started', 'Status', ''].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : i === 6 ? 'pr-6 text-right' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dashboardData?.recentQueries.filter(q => q.queryName.toLowerCase().includes(search.toLowerCase()) || q.user.toLowerCase().includes(search.toLowerCase())).map(q => {
                    const currentStatus = localStatuses[q.id] || q.status;
                    return (
                      <tr key={q.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-4 pl-6 font-mono text-xs text-indigo-300">{q.id}</td>
                        <td className="py-4 px-4">
                          <p className="font-bold text-white text-sm">{q.queryName}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{q.user}</p>
                        </td>
                        <td className="py-4 px-4 font-mono text-xs text-gray-300">{formatBytes(q.bytesProcessed)}</td>
                        <td className="py-4 px-4">
                          <span className={cn('font-bold', q.executionTimeMs > 10000 ? 'text-amber-400' : 'text-emerald-400')}>
                            {q.executionTimeMs > 0 ? `${(q.executionTimeMs / 1000).toFixed(2)}s` : '-'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs text-gray-400">{fmtRel(q.startTime)}</td>
                        <td className="py-4 px-4">
                          <Badge variant="outline" className={cn('text-[10px] px-2', statusColor[currentStatus])}>
                            {currentStatus}
                          </Badge>
                        </td>
                        <td className="py-4 pr-6 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {(currentStatus === 'Running' || currentStatus === 'Queued') && (
                              <Button size="sm" variant="outline" onClick={() => handleCancel(q.id)} className="h-7 text-[11px] border-red-500/30 text-red-400 hover:bg-red-500/10">
                                <XCircle className="w-3 h-3 mr-1" /> Kill
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* TAB: Dashboards */}
      {tab === 'dashboards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? <div className="flex justify-center p-16 col-span-full"><Spinner size="lg" /></div> : 
            dashboardData?.dashboards.filter(d => d.title.toLowerCase().includes(search.toLowerCase())).map(d => (
              <Card key={d.id} className="p-5 border-white/[0.06] bg-surface-dark hover:bg-white/[0.02] transition-colors group">
                <div className="flex justify-between items-start mb-3">
                  <Badge variant="outline" className="text-[10px] bg-white/5 border-white/10 text-gray-300">
                    {d.category}
                  </Badge>
                  <Badge variant="outline" className={cn('text-[10px]', statusColor[d.status])}>
                    {d.status}
                  </Badge>
                </div>
                <h3 className="font-bold text-white text-base mb-1 group-hover:text-indigo-400 transition-colors cursor-pointer">{d.title}</h3>
                <p className="text-[10px] text-gray-500 font-mono mb-4">ID: {d.id}</p>
                
                <div className="flex items-center justify-between mt-auto text-xs border-t border-white/[0.04] pt-3">
                  <span className="text-gray-400 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> {d.viewsLast7Days} views (7d)</span>
                  <span className="text-gray-500 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> {fmtRel(d.lastUpdated)}</span>
                </div>
              </Card>
            ))
          }
        </div>
      )}
    </div>
  );
}
