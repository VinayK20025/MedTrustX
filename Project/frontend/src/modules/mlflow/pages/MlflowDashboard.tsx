'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { 
  GitBranch, FlaskConical, Activity, BoxSelect, Database,
  Search, RefreshCw, Play, XCircle, Clock, CheckCircle,
  AlertTriangle, Tag, User, Terminal, ArrowRight, ExternalLink
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { 
  useMlflowDashboard, 
  useKillRun,
  useTransitionModelStage 
} from '../hooks/useMlflow';

type Tab = 'experiments' | 'runs' | 'models';

const statusColor: Record<string, string> = {
  'Active': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Completed': 'text-success-light bg-success/10 border-success/30',
  'Running': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30 animate-pulse',
  'Failed': 'text-danger-light bg-danger/10 border-danger/30',
  'Killed': 'text-gray-400 bg-gray-500/10 border-gray-500/30',
  'Ready': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Building': 'text-amber-400 bg-amber-500/10 border-amber-500/30 animate-pulse',
  'Production': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 font-bold',
  'Staging': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Archived': 'text-gray-400 bg-gray-500/10 border-gray-500/30',
  'None': 'text-gray-400 bg-gray-500/10 border-gray-500/30',
};

const fmtRel = (iso: string) => {
  if (!iso) return '-';
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'Just now';
  return m < 60 ? `${m}m ago` : m < 1440 ? `${Math.floor(m/60)}h ago` : `${Math.floor(m/1440)}d ago`;
};

export function MlflowDashboard() {
  const { data, isLoading, isRefetching, refetch } = useMlflowDashboard();
  const killRun = useKillRun();
  const transitionStage = useTransitionModelStage();

  const [tab, setTab] = useState<Tab>('experiments');
  const [search, setSearch] = useState('');

  const dbData = data?.data;
  const metrics = dbData?.metrics;

  const handleKillRun = (id: string) => {
    if (confirm('Are you sure you want to kill this run?')) {
      killRun.mutate(id);
    }
  };

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'experiments', label: 'Experiments', icon: FlaskConical },
    { key: 'runs', label: 'Recent Runs', icon: Activity },
    { key: 'models', label: 'Model Registry', icon: BoxSelect },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <GitBranch className="w-7 h-7 text-indigo-400" /> MLflow Tracking & MLOps
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Experiment Tracking · Model Lifecycle · Parameter Logging · Artifact Management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} /> Sync
          </Button>
          <Button variant="outline" className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
            <ExternalLink className="w-4 h-4 mr-2" /> Open MLflow UI
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Experiments', value: metrics?.totalExperiments, color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: FlaskConical },
          { label: 'Active Runs', value: metrics?.activeRuns, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: Activity },
          { label: 'Total Models', value: metrics?.totalModels, color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: BoxSelect },
          { label: 'In Production', value: metrics?.productionModels, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle },
          { label: 'Failed (24h)', value: metrics?.failedRunsLast24h, color: 'text-rose-400', bg: 'bg-rose-500/10', icon: AlertTriangle },
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
          placeholder={`Search ${tab}...`}
          className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-indigo-500/50" 
        />
      </div>

      {/* TAB: Experiments */}
      {tab === 'experiments' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['Experiment ID', 'Name', 'Artifact Location', 'Runs', 'Last Updated', 'Status'].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dbData?.experiments.filter(e => e.name.toLowerCase().includes(search.toLowerCase())).map(e => (
                    <tr key={e.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6 font-mono text-indigo-300 text-xs">{e.id}</td>
                      <td className="py-4 px-4 font-bold text-white text-sm">{e.name}</td>
                      <td className="py-4 px-4 font-mono text-[10px] text-gray-500 truncate max-w-[200px]">{e.artifactLocation}</td>
                      <td className="py-4 px-4 font-bold text-white">{e.runCount}</td>
                      <td className="py-4 px-4 text-xs text-gray-400">{fmtRel(e.lastUpdateTime)}</td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[10px] px-2', statusColor[e.status])}>
                          {e.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* TAB: Runs */}
      {tab === 'runs' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['Run Name', 'Experiment', 'Metrics', 'Parameters', 'Started', 'Status', ''].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : i === 6 ? 'pr-6 text-right' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dbData?.recentRuns.filter(r => r.runName.toLowerCase().includes(search.toLowerCase())).map(r => (
                    <tr key={r.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6">
                        <p className="font-bold text-white text-sm flex items-center gap-2">
                          <Terminal className="w-3 h-3 text-indigo-400" /> {r.runName}
                        </p>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{r.id}</p>
                      </td>
                      <td className="py-4 px-4 text-xs text-indigo-300 font-medium">{r.experimentName}</td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(r.metrics).map(([k, v]) => (
                            <span key={k} className="text-[10px] text-emerald-400 font-mono bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">
                              {k}: {v.toFixed(3)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(r.params).slice(0, 2).map(([k, v]) => (
                            <span key={k} className="text-[10px] text-gray-400 font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                              {k}: {v}
                            </span>
                          ))}
                          {Object.keys(r.params).length > 2 && <span className="text-[9px] text-gray-600">+{Object.keys(r.params).length - 2} more</span>}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-400">{fmtRel(r.startTime)}</td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[10px] px-2', statusColor[r.status])}>
                          {r.status}
                        </Badge>
                      </td>
                      <td className="py-4 pr-6 text-right">
                        {r.status === 'Running' && (
                          <Button size="sm" variant="outline" onClick={() => handleKillRun(r.id)} className="h-7 text-[11px] border-rose-500/30 text-rose-400 hover:bg-rose-500/10">
                            <XCircle className="w-3 h-3 mr-1" /> Kill
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* TAB: Models */}
      {tab === 'models' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? <div className="flex justify-center p-16 col-span-full"><Spinner size="lg" /></div> : 
            dbData?.registeredModels.filter(m => m.name.toLowerCase().includes(search.toLowerCase())).map(m => (
              <Card key={m.id} className="p-5 border-white/[0.06] bg-surface-dark hover:bg-white/[0.02] transition-colors group flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                      <BoxSelect className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base leading-tight group-hover:text-indigo-400 transition-colors">{m.name}</h3>
                      <p className="text-[10px] text-gray-500 font-mono">ID: {m.id}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-white/5 border-white/10 text-gray-400">
                    {m.latestVersions.length} Versions
                  </Badge>
                </div>
                
                <p className="text-[11px] text-gray-500 mb-4 line-clamp-2">{m.description}</p>
                
                <div className="space-y-2 mb-4 flex-1">
                  <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold">Latest Versions</p>
                  {m.latestVersions.map(v => (
                    <div key={v.version} className="flex items-center justify-between p-2 bg-black/20 rounded-lg border border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{v.version}</span>
                        <Badge variant="outline" className={cn('text-[9px] px-1.5 h-4', statusColor[v.stage])}>
                          {v.stage}
                        </Badge>
                      </div>
                      <span className="text-[9px] text-gray-500">{fmtRel(v.lastUpdated)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-xs border-t border-white/[0.04] pt-3 mt-auto">
                   <div className="flex items-center gap-1.5 text-gray-500">
                     <Tag className="w-3 h-3" />
                     {Object.keys(m.tags).length > 0 ? Object.values(m.tags)[0] : 'No compliance tags'}
                   </div>
                   <Button size="sm" variant="ghost" className="h-7 text-[11px] text-indigo-400 hover:text-indigo-300 hover:bg-white/5">
                     View Lineage <ArrowRight className="w-3 h-3 ml-1" />
                   </Button>
                </div>
              </Card>
            ))
          }
        </div>
      )}
    </div>
  );
}
