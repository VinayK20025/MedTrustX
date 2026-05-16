'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { 
  Settings, Globe, Flag, Sliders, History,
  Search, RefreshCw, Terminal, Server, ShieldCheck,
  Zap, Clock, ArrowRight, Save, Filter, Plus,
  FileCode, UserCircle, Activity, Layout, Eye, Edit3
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { 
  useConfigDashboard, 
  useUpdateFlag 
} from '../hooks/useConfig';

type Tab = 'global' | 'flags' | 'audit';

const statusColor: Record<string, string> = {
  'Enabled': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Disabled': 'text-gray-400 bg-white/5 border-white/10',
  'Gradual Rollout': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30 animate-pulse',
  'Created': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  'Updated': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Deleted': 'text-rose-400 bg-rose-500/10 border-rose-500/30',
};

const fmtDate = (iso: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function ConfigDashboard() {
  const { data, isLoading, isRefetching, refetch } = useConfigDashboard();
  const updateFlag = useUpdateFlag();

  const [tab, setTab] = useState<Tab>('global');
  const [search, setSearch] = useState('');

  const dbData = data?.data;
  const metrics = dbData?.metrics;

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'global', label: 'Global Variables', icon: Globe },
    { key: 'flags', label: 'Feature Toggles', icon: Flag },
    { key: 'audit', label: 'Audit History', icon: History },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Settings className="w-7 h-7 text-indigo-400" /> Distributed Configuration
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Centralized Parameter Management · Feature Flags · Environment Sync
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} /> Refresh
          </Button>
          <Button variant="outline" className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
             <Plus className="w-4 h-4 mr-2" /> New Property
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Parameters', value: metrics?.totalConfigs, color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: Server },
          { label: 'Feature Flags', value: metrics?.activeFeatureFlags, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Flag },
          { label: 'Tenant Overrides', value: metrics?.pendingOverrides, color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: Sliders },
          { label: 'Health Score', value: `${metrics?.configHealthScorePercent}%`, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: ShieldCheck },
          { label: 'Last Sync', value: '4m ago', color: 'text-gray-400', bg: 'bg-white/5', icon: Clock },
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

      {/* TAB: Global */}
      {tab === 'global' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['Property Key', 'Value', 'Scope', 'Last Updated', 'Updated By', 'Actions'].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dbData?.recentConfigs.filter(c => c.key.toLowerCase().includes(search.toLowerCase())).map(c => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6">
                         <p className="font-mono text-indigo-400 text-xs font-bold uppercase">{c.key}</p>
                         <p className="text-[10px] text-gray-600 line-clamp-1 max-w-[250px]">{c.description}</p>
                      </td>
                      <td className="py-4 px-4">
                        <code className="text-xs bg-black/40 px-2 py-1 rounded border border-white/5 text-emerald-300 font-mono">
                          {c.value}
                        </code>
                        <span className="ml-2 text-[9px] text-gray-600 uppercase">[{c.type}]</span>
                      </td>
                      <td className="py-4 px-4 text-xs text-white">
                         <Badge variant="outline" className="text-[9px] bg-white/5 border-white/10 text-gray-400">{c.scope}</Badge>
                      </td>
                      <td className="py-4 px-4 text-[10px] text-gray-500 font-mono">{fmtDate(c.lastUpdated)}</td>
                      <td className="py-4 px-4 text-xs text-white flex items-center gap-2 mt-1">
                         <UserCircle className="w-3 h-3 text-indigo-400" /> {c.updatedBy}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                           <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-500 hover:text-white">
                             <Edit3 className="w-3.5 h-3.5" />
                           </Button>
                           <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-500 hover:text-white">
                             <History className="w-3.5 h-3.5" />
                           </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* TAB: Flags */}
      {tab === 'flags' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {isLoading ? <div className="flex justify-center p-16 col-span-full"><Spinner size="lg" /></div> : 
             dbData?.featureFlags.filter(f => f.name.toLowerCase().includes(search.toLowerCase())).map(f => (
               <Card key={f.id} className="p-5 border-white/[0.06] bg-surface-dark flex flex-col group hover:border-indigo-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className="text-[9px] bg-white/5 border-white/10 text-gray-500 font-mono">
                      {f.environment}
                    </Badge>
                    <Badge variant="outline" className={cn('text-[9px] px-1.5', statusColor[f.status])}>
                      {f.status}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-white text-base mb-1 group-hover:text-indigo-400 transition-colors leading-tight">{f.name}</h3>
                  <p className="text-[11px] text-gray-500 font-mono mb-4">{f.key}</p>
                  
                  {f.status === 'Gradual Rollout' && (
                    <div className="mb-4">
                       <div className="flex justify-between text-[10px] text-gray-500 mb-2 font-mono">
                          <span>Target Traffic</span>
                          <span className="text-white font-bold">{f.percentage}%</span>
                       </div>
                       <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${f.percentage}%` }} />
                       </div>
                    </div>
                  )}
                  
                  <div className="mt-auto pt-3 border-t border-white/[0.04] flex items-center justify-between gap-2">
                     <Button size="sm" variant="ghost" className="h-8 flex-1 text-[11px] text-gray-400 border border-white/5 hover:bg-white/5">
                        Configure
                     </Button>
                     <Button size="sm" variant="ghost" className="h-8 px-3 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/20">
                        {f.status === 'Enabled' ? 'Disable' : 'Enable'}
                     </Button>
                  </div>
               </Card>
             ))
           }
        </div>
      )}

      {/* TAB: Audit */}
      {tab === 'audit' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          <div className="p-6 border-b border-white/[0.04] flex items-center justify-between">
             <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" /> Operational Log
             </h3>
             <Button variant="ghost" size="sm" className="text-gray-500 text-xs">
                Export to JSON <FileCode className="w-3 h-3 ml-2" />
             </Button>
          </div>
          <div className="p-0">
             {dbData?.recentAudits.map((a, i) => (
               <div key={i} className="px-6 py-4 border-b border-white/[0.02] last:border-0 hover:bg-white/[0.01] transition-colors group flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className={cn("p-2 rounded-lg", a.action === 'Updated' ? "bg-amber-500/10" : "bg-cyan-500/10")}>
                        {a.action === 'Updated' ? <RotateCw className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4 text-cyan-400" />}
                     </div>
                     <div>
                        <p className="text-sm font-bold text-white flex items-center gap-2">
                           {a.user} <span className="text-[10px] font-normal text-gray-500 uppercase tracking-tighter tracking-widest">{a.action}</span>
                        </p>
                        <p className="text-xs text-indigo-400 font-mono mt-0.5">{a.key}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-xs text-gray-300 flex items-center gap-2 justify-end">
                        {a.oldValue && <span className="text-rose-400 line-through opacity-50 font-mono text-[10px]">{a.oldValue}</span>}
                        {a.oldValue && <ArrowRight className="w-3 h-3 text-gray-700" />}
                        <span className="text-emerald-400 font-mono">{a.newValue}</span>
                     </p>
                     <p className="text-[10px] text-gray-600 mt-1 font-mono">{fmtDate(a.timestamp)}</p>
                  </div>
               </div>
             ))}
          </div>
        </Card>
      )}
    </div>
  );
}
