'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { 
  Workflow, GitBranch, ListChecks, Zap, BarChart3,
  Search, RefreshCw, PlayCircle, Clock, AlertCircle,
  Activity, CheckCircle2, MoreHorizontal, ArrowRight,
  ExternalLink, Layers, Cpu, Settings, Filter
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { 
  useWorkflowDashboard, 
  useClaimTask 
} from '../hooks/useWorkflow';

type Tab = 'definitions' | 'tasks' | 'automations';

const statusColor: Record<string, string> = {
  'Active': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Pending': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Claimed': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  'In Progress': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30 animate-pulse',
  'Completed': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Suspended': 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  'Escalated': 'text-rose-400 bg-rose-500/10 border-rose-500/30 font-bold',
  'Enabled': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
};

const priorityColor: Record<string, string> = {
  'Critical': 'text-rose-500 bg-rose-600/20 border-rose-600/40 font-black animate-pulse',
  'High': 'text-rose-400 bg-rose-500/10 border-rose-500/30 font-bold',
  'Medium': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Low': 'text-gray-400 bg-white/5 border-white/10',
};

const fmtDate = (iso: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function WorkflowDashboard() {
  const { data, isLoading, isRefetching, refetch } = useWorkflowDashboard();
  const claim = useClaimTask();

  const [tab, setTab] = useState<Tab>('definitions');
  const [search, setSearch] = useState('');

  const dbData = data?.data;
  const metrics = dbData?.metrics;

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'definitions', label: 'Process Models', icon: GitBranch },
    { key: 'tasks', label: 'Active Tasks', icon: ListChecks },
    { key: 'automations', label: 'Automation Rules', icon: Zap },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Workflow className="w-7 h-7 text-indigo-400" /> Workflow Orchestration
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Process Lifecycle Management · Task Automation · System Integration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} /> Refresh
          </Button>
          <Button variant="outline" className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
             Designer Console
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Active Instances', value: metrics?.totalActiveInstances, color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: Layers },
          { label: 'Pending Tasks', value: metrics?.pendingTasksCount, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: ListChecks },
          { label: 'Avg Latency (min)', value: metrics?.averageCompletionTimeMinutes, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: Clock },
          { label: 'Auto-Success', value: `${metrics?.automationSuccessRatePercent}%`, color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: Activity },
          { label: 'Escalations', value: metrics?.escalatedTasksCount, color: 'text-rose-400', bg: 'bg-rose-500/10', icon: AlertCircle },
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
          placeholder={`Filter ${tab}...`}
          className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-indigo-500/50" 
        />
      </div>

      {/* TAB: Definitions */}
      {tab === 'definitions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {isLoading ? <div className="flex justify-center p-16 col-span-full"><Spinner size="lg" /></div> : 
             dbData?.definitions.filter(d => d.name.toLowerCase().includes(search.toLowerCase())).map(d => (
               <Card key={d.id} className="p-5 border-white/[0.06] bg-surface-dark flex flex-col group hover:border-indigo-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className="text-[9px] bg-white/5 border-white/10 text-indigo-300 font-mono">
                      {d.version}
                    </Badge>
                    <Badge variant="outline" className={cn('text-[9px] px-1.5', statusColor[d.status])}>
                      {d.status}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-white text-base mb-1 group-hover:text-indigo-400 transition-colors leading-tight">{d.name}</h3>
                  <p className="text-[11px] text-gray-500 mb-4">{d.category} Workflow · {d.id}</p>
                  
                  <div className="bg-black/20 p-3 rounded-xl border border-white/5 mb-4 flex-1">
                     <div className="flex justify-between text-[10px] text-gray-500 mb-2">
                        <span>Active Instances</span>
                        <span className="text-white font-bold">{d.activeInstances}</span>
                     </div>
                     <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min((d.activeInstances / 200) * 100, 100)}%` }} />
                     </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                     <span className="text-[10px] text-gray-500">Modified: {fmtDate(d.lastModified)}</span>
                     <Button size="sm" variant="ghost" className="h-7 text-[11px] text-indigo-400 hover:bg-white/5">
                        Open Process <PlayCircle className="w-3 h-3 ml-2" />
                     </Button>
                  </div>
               </Card>
             ))
           }
        </div>
      )}

      {/* TAB: Tasks */}
      {tab === 'tasks' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['Task Name', 'Process Instance', 'Assignee', 'Created', 'Priority', 'Status'].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dbData?.activeTasks.filter(t => t.taskName.toLowerCase().includes(search.toLowerCase())).map(t => (
                    <tr key={t.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6">
                         <p className="font-bold text-white text-sm">{t.taskName}</p>
                         <p className="text-[10px] text-gray-500 font-mono">Task ID: {t.id}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-xs text-indigo-300">{t.processName}</p>
                        <p className="text-[10px] text-gray-600 font-mono">{t.instanceId}</p>
                      </td>
                      <td className="py-4 px-4 text-xs text-white">
                         {t.assignee || <span className="text-gray-600 italic">Unassigned</span>}
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-400 font-mono">{fmtDate(t.createdDate)}</td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[9px] px-1.5', priorityColor[t.priority])}>
                          {t.priority}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[9px] px-1.5', statusColor[t.status])}>
                          {t.status}
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

      {/* TAB: Automations */}
      {tab === 'automations' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Card className="p-6 border-white/[0.06] bg-surface-dark flex flex-col">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" /> Recent Automations
              </h3>
              <div className="space-y-4">
                {dbData?.recentAutomations.map(auto => (
                  <div key={auto.id} className="p-4 bg-black/20 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-amber-500/30 transition-colors">
                     <div className="flex flex-col">
                       <h4 className="text-sm font-bold text-white">{auto.name}</h4>
                       <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-500">Trigger: {auto.trigger}</span>
                          <ArrowRight className="w-3 h-3 text-gray-700" />
                          <span className="text-[10px] text-indigo-400 font-medium">Action: {auto.action}</span>
                       </div>
                     </div>
                     <div className="text-right">
                        <p className="text-xs font-bold text-white font-mono">{auto.executionCount}</p>
                        <p className="text-[9px] text-gray-600 uppercase tracking-tighter mt-1">Executions</p>
                     </div>
                  </div>
                ))}
              </div>
           </Card>
           
           <Card className="p-6 border-white/[0.06] bg-surface-dark flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-indigo-500/10 rounded-full mb-4">
                 <Cpu className="w-10 h-10 text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Automation Engine Status</h2>
              <p className="text-gray-400 max-w-sm mb-6 text-sm">
                Real-time event processing is active across all clinical and administrative clusters.
              </p>
              <div className="grid grid-cols-2 gap-4 w-full">
                 <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase">Throughput</p>
                    <p className="text-sm font-bold text-emerald-400">12k events/hr</p>
                 </div>
                 <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase">Uptime</p>
                    <p className="text-sm font-bold text-emerald-400">99.998%</p>
                 </div>
              </div>
              <Button variant="outline" className="mt-6 border-white/10 text-gray-400 hover:text-white w-full">
                 Configure Rule Set <Settings className="w-3 h-3 ml-2" />
              </Button>
           </Card>
        </div>
      )}
    </div>
  );
}
