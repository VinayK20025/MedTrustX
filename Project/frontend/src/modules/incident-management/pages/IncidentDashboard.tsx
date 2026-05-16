'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { 
  ShieldAlert, FileWarning, Search, GitBranch, BarChart3,
  RefreshCw, AlertCircle, Clock, ArrowRight,
  ChevronRight, TrendingUp, Filter, Plus,
  ShieldCheck, AlertTriangle, Scale, History,
  Info, CheckCircle2, MessageSquare, Clipboard
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { 
  useIncidentDashboard, 
  useReportIncident 
} from '../hooks/useIncident';

type Tab = 'reports' | 'rca' | 'investigations';

const severityColor: Record<string, string> = {
  'Sentinel': 'text-rose-600 bg-rose-600/20 border-rose-600/40 font-black animate-pulse',
  'Extreme': 'text-rose-500 bg-rose-500/10 border-rose-500/30 font-bold',
  'High': 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  'Medium': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Low': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
};

const statusColor: Record<string, string> = {
  'Reported': 'text-gray-400 bg-white/5 border-white/10',
  'Under Investigation': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  'RCA in Progress': 'text-amber-400 bg-amber-500/10 border-amber-500/30 animate-pulse',
  'Corrective Action': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  'Closed': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
};

const fmtDate = (iso: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function IncidentDashboard() {
  const { data, isLoading, isRefetching, refetch } = useIncidentDashboard();
  const reportIncident = useReportIncident();

  const [tab, setTab] = useState<Tab>('reports');
  const [search, setSearch] = useState('');

  const dbData = data?.data;
  const metrics = dbData?.metrics;

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'reports', label: 'Incident Reports', icon: FileWarning },
    { key: 'rca', label: 'Root Cause Analysis', icon: GitBranch },
    { key: 'investigations', label: 'Critical Investigations', icon: Search },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-rose-500" /> Incident Command Center
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Institutional Risk Management · Safety Quality Sync · RCA Orchestration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} /> Refresh
          </Button>
          <Button className="bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-900/40">
             <Plus className="w-4 h-4 mr-2" /> Report Incident
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Incidents', value: metrics?.totalIncidentsCount, color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: Clipboard },
          { label: 'Open Investigations', value: metrics?.openInvestigationsCount, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Search },
          { label: 'Closure Velocity', value: `${metrics?.averageTimeToClosureDays} Days`, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: Clock },
          { label: 'High Severity', value: metrics?.highSeverityAlertsCount, color: 'text-rose-500', bg: 'bg-rose-600/20', icon: ShieldAlert },
          { label: 'RCA Completion', value: `${metrics?.rcaCompletionRatePercent}%`, color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: ShieldCheck },
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
              tab === t.key ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30' : 'text-gray-400 hover:text-white hover:bg-white/5')}>
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
          className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-rose-500/50" 
        />
      </div>

      {/* TAB: Reports */}
      {tab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {isLoading ? <div className="flex justify-center p-16 col-span-full"><Spinner size="lg" /></div> : 
             dbData?.recentIncidents.filter(i => i.title.toLowerCase().includes(search.toLowerCase())).map(i => (
               <Card key={i.id} className="p-5 border-white/[0.06] bg-surface-dark flex flex-col group hover:border-rose-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className={cn('text-[9px] px-1.5', severityColor[i.severity])}>
                      {i.severity} Severity
                    </Badge>
                    <Badge variant="outline" className={cn('text-[9px] px-1.5', statusColor[i.status])}>
                      {i.status}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-white text-base mb-1 group-hover:text-rose-400 transition-colors leading-tight">{i.title}</h3>
                  <p className="text-[11px] text-gray-500 mb-4">{i.category} · {i.location}</p>
                  
                  <div className="bg-black/20 p-3 rounded-xl border border-white/5 mb-4 flex-1">
                     <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">
                        {i.description}
                     </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                     <div className="flex flex-col">
                        <span className="text-[10px] text-gray-600 font-mono">{i.id}</span>
                        <p className="text-[9px] text-gray-500">Reported: {fmtDate(i.reportedAt)}</p>
                     </div>
                     <Button size="sm" variant="ghost" className="h-7 text-[11px] text-rose-400 hover:bg-rose-500/10">
                        View Dossier <ArrowRight className="w-3 h-3 ml-2" />
                     </Button>
                  </div>
               </Card>
             ))
           }
        </div>
      )}

      {/* TAB: RCA */}
      {tab === 'rca' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['RCA ID / Incident', 'Methodology', 'Assigned Lead', 'Target Date', 'Recommendations'].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dbData?.pendingRCAs.map(r => (
                    <tr key={r.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6">
                         <p className="font-bold text-white text-sm">{r.id}</p>
                         <p className="text-[10px] text-gray-600">Ref: {r.incidentId}</p>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className="bg-indigo-500/10 text-indigo-400 text-[9px] border-indigo-500/30">
                           {r.methodology}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-xs text-white">
                         {r.assignedTo}
                      </td>
                      <td className="py-4 px-4 text-xs text-rose-400 font-mono font-bold">
                         {fmtDate(r.targetCompletionDate)}
                      </td>
                      <td className="py-4 px-4">
                         <div className="flex flex-col gap-1">
                            {r.recommendations.map((rec, i) => (
                              <p key={i} className="text-[10px] text-gray-500 flex items-start gap-1">
                                 <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 mt-0.5 shrink-0" /> {rec}
                              </p>
                            ))}
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

      {/* TAB: Investigations */}
      {tab === 'investigations' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Card className="p-6 border-white/[0.06] bg-surface-dark flex flex-col">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Search className="w-5 h-5 text-rose-400" /> Active Sentinel Events
              </h3>
              <div className="space-y-4">
                 {dbData?.criticalInvestigations.map((inv, i) => (
                   <div key={i} className="p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10 flex items-center justify-between group hover:border-rose-500/30 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-rose-500/10 transition-colors">
                            <AlertCircle className="w-5 h-5 text-rose-500" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-white">{inv.title}</p>
                            <p className="text-[10px] text-gray-500 font-mono">{inv.id} · {inv.location}</p>
                         </div>
                      </div>
                      <Badge variant="outline" className="text-[9px] bg-rose-500/20 text-rose-400 border-rose-500/40">
                         {inv.status}
                      </Badge>
                   </div>
                 ))}
              </div>
              <Button className="mt-6 w-full bg-black/40 border border-white/10 hover:bg-white/5 h-11 text-xs">
                 Open Full Investigation Registry <History className="w-3.5 h-3.5 ml-2" />
              </Button>
           </Card>
           
           <Card className="p-8 border-white/[0.06] bg-surface-dark flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-emerald-500/10 rounded-full mb-4">
                 <ShieldCheck className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Institutional Safety Analytics</h2>
              <p className="text-sm text-gray-500 max-w-sm mb-8 leading-relaxed">
                Bi-directional sync with institutional risk registers and clinical quality benchmarks (JCI, ISO).
              </p>
              <div className="grid grid-cols-2 gap-4 w-full mb-8">
                 <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Safety Index</p>
                    <p className="text-sm font-bold text-emerald-400">98.2 / 100</p>
                 </div>
                 <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Trend Analysis</p>
                    <p className="text-sm font-bold text-indigo-400">-14% vs LY</p>
                 </div>
              </div>
              <div className="flex gap-4 w-full">
                 <Button variant="outline" className="flex-1 border-white/10 text-gray-400">Audit Reports</Button>
                 <Button className="flex-1 bg-indigo-600 hover:bg-indigo-500">Risk Assessment</Button>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
}
