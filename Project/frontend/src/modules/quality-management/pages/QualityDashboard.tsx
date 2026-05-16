'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { 
  Target, LineChart, ShieldAlert, CheckCircle2, ListTodo,
  Search, RefreshCw, AlertCircle, Activity, ShieldCheck,
  TrendingUp, TrendingDown, Minus, ArrowRight, ClipboardCheck,
  Zap, Info, Filter, ExternalLink
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { 
  useQualityDashboard, 
  useReportIncident 
} from '../hooks/useQuality';

type Tab = 'indicators' | 'incidents' | 'projects';

const severityColor: Record<string, string> = {
  'Low': 'text-gray-400 bg-white/5 border-white/10',
  'Medium': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'High': 'text-rose-400 bg-rose-500/10 border-rose-500/30 font-bold',
  'Critical': 'text-rose-500 bg-rose-600/20 border-rose-600/40 font-black animate-pulse',
};

const statusColor: Record<string, string> = {
  'On Track': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Warning': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Critical': 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  'Resolved': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Investigating': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  'Open': 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  'Closed': 'text-gray-400 bg-white/5 border-white/10',
};

const fmtDate = (iso: string) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export function QualityDashboard() {
  const { data, isLoading, isRefetching, refetch } = useQualityDashboard();
  const reportIncident = useReportIncident();

  const [tab, setTab] = useState<Tab>('indicators');
  const [search, setSearch] = useState('');

  const dbData = data?.data;
  const metrics = dbData?.metrics;

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'indicators', label: 'Clinical Indicators', icon: LineChart },
    { key: 'incidents', label: 'Patient Safety Incidents', icon: ShieldAlert },
    { key: 'projects', label: 'QI Projects', icon: ListTodo },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Target className="w-7 h-7 text-emerald-400" /> Quality & Safety Command
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Continuous Improvement · Adverse Event Tracking · Regulatory Compliance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} /> Refresh
          </Button>
          <Button variant="outline" className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10">
             Log New Incident
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Compliance Score', value: `${metrics?.overallComplianceScore}%`, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: ClipboardCheck },
          { label: 'Incident Resolution', value: `${metrics?.incidentResolutionRate}%`, color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: ShieldCheck },
          { label: 'Active QI Projects', value: metrics?.activeQiProjects, color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: Zap },
          { label: 'Mortality Rate', value: `${metrics?.mortalityRatePercent}%`, color: 'text-gray-300', bg: 'bg-white/5', icon: Activity },
          { label: 'Readmission', value: `${metrics?.readmissionRatePercent}%`, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: AlertCircle },
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
              tab === t.key ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30' : 'text-gray-400 hover:text-white hover:bg-white/5')}>
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
          className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-emerald-500/50" 
        />
      </div>

      {/* TAB: Indicators */}
      {tab === 'indicators' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? <div className="flex justify-center p-16 col-span-full"><Spinner size="lg" /></div> : 
            dbData?.indicators.filter(ind => ind.name.toLowerCase().includes(search.toLowerCase())).map(ind => (
              <Card key={ind.id} className="p-5 border-white/[0.06] bg-surface-dark hover:bg-white/[0.02] transition-colors group flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-white text-base group-hover:text-emerald-400 transition-colors leading-tight">{ind.name}</h3>
                  <Badge variant="outline" className={cn('text-[10px]', statusColor[ind.status])}>
                    {ind.status}
                  </Badge>
                </div>
                
                <div className="flex items-end gap-3 mb-4">
                   <p className="text-3xl font-bold text-white leading-none">{ind.value}{ind.unit}</p>
                   <div className="flex items-center gap-1 mb-1">
                     {ind.trend === 'up' ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : ind.trend === 'down' ? <TrendingDown className="w-4 h-4 text-rose-400" /> : <Minus className="w-4 h-4 text-gray-500" />}
                     <span className={cn("text-[10px] font-bold uppercase tracking-widest", ind.trend === 'up' ? "text-emerald-400" : ind.trend === 'down' ? "text-rose-400" : "text-gray-500")}>{ind.trend}</span>
                   </div>
                </div>

                <div className="w-full bg-white/5 rounded-full h-1.5 mb-2 overflow-hidden">
                   <div className={cn("h-full rounded-full transition-all duration-500", ind.status === 'On Track' ? "bg-emerald-500" : ind.status === 'Warning' ? "bg-amber-500" : "bg-rose-500")} style={{ width: `${Math.min((ind.value / ind.target) * 100, 100)}%` }} />
                </div>
                
                <div className="flex items-center justify-between text-[10px] text-gray-500">
                  <span>Target: {ind.target}{ind.unit}</span>
                  <span>{((ind.value / ind.target) * 100).toFixed(1)}% of goal</span>
                </div>
                
                <Button size="sm" variant="ghost" className="h-7 text-[11px] text-emerald-400 hover:text-emerald-300 hover:bg-white/5 mt-4 w-fit">
                   View Trend History <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Card>
            ))
          }
        </div>
      )}

      {/* TAB: Incidents */}
      {tab === 'incidents' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['Incident ID', 'Type & Dept', 'Severity', 'Status', 'Date Reported', 'Reporter'].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dbData?.incidents.filter(inc => inc.type.toLowerCase().includes(search.toLowerCase())).map(inc => (
                    <tr key={inc.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6 font-mono text-emerald-400 text-xs">{inc.id}</td>
                      <td className="py-4 px-4">
                        <p className="font-bold text-white text-sm">{inc.type}</p>
                        <p className="text-[10px] text-gray-500">{inc.department}</p>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0', severityColor[inc.severity])}>
                          {inc.severity}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0', statusColor[inc.status])}>
                          {inc.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-400">{fmtDate(inc.dateReported)}</td>
                      <td className="py-4 px-4 text-xs text-gray-400">{inc.reporter}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* TAB: Projects */}
      {tab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? <div className="flex justify-center p-16 col-span-full"><Spinner size="lg" /></div> : 
            dbData?.projects.filter(prj => prj.title.toLowerCase().includes(search.toLowerCase())).map(prj => (
              <Card key={prj.id} className="p-5 border-white/[0.06] bg-surface-dark flex flex-col group">
                 <div className="flex justify-between items-start mb-2">
                   <h3 className="font-bold text-white text-base leading-tight group-hover:text-emerald-400 transition-colors">{prj.title}</h3>
                   <Badge variant="outline" className="text-[10px] bg-white/5 border-white/10 text-gray-500">
                     {prj.id}
                   </Badge>
                 </div>
                 <p className="text-[11px] text-gray-500 mb-4 italic">Leads: {prj.leads.join(', ')}</p>
                 
                 <div className="space-y-1 mb-4">
                   <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                     <span>Progress</span>
                     <span>{prj.progressPercent}%</span>
                   </div>
                   <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                     <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${prj.progressPercent}%` }} />
                   </div>
                 </div>

                 <div className="flex items-center justify-between text-[10px] text-gray-500 border-t border-white/[0.04] pt-3 mt-auto">
                    <span>Ends: {fmtDate(prj.targetCompletion)}</span>
                    <Badge variant="outline" className="text-[9px] h-4 bg-emerald-500/5 text-emerald-400 border-emerald-500/20 uppercase tracking-tighter">
                      {prj.status}
                    </Badge>
                 </div>
              </Card>
            ))
          }
        </div>
      )}
    </div>
  );
}
