'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { 
  Activity, Users, Target, ShieldAlert, Globe,
  Search, RefreshCw, Play, Pause, AlertTriangle, CheckCircle, TrendingUp
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { 
  usePopHealthDashboard, 
  useUpdateCampaignStatus
} from '../hooks/usePopHealth';

type Tab = 'cohorts' | 'campaigns' | 'surveillance';

const riskColor: Record<string, string> = {
  'Low': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Moderate': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'High': 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  'Critical': 'text-rose-500 bg-rose-600/10 border-rose-600/30 animate-pulse',
};

const statusColor: Record<string, string> = {
  'Active': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Draft': 'text-gray-400 bg-gray-500/10 border-gray-500/30',
  'Completed': 'text-success-light bg-success/10 border-success/30',
  'Suspended': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
};

const severityColor: Record<string, string> = {
  'Endemic': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Outbreak': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Pandemic Alert': 'text-rose-500 bg-rose-600/10 border-rose-600/30 animate-pulse',
};

const fmtDate = (iso: string) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export function PopHealthDashboard() {
  const { data, isLoading, isRefetching, refetch } = usePopHealthDashboard();
  const updateCampaign = useUpdateCampaignStatus();

  const [tab, setTab] = useState<Tab>('cohorts');
  const [search, setSearch] = useState('');

  const [localCampaignStatus, setLocalCampaignStatus] = useState<Record<string, string>>({});

  const dbData = data?.data;
  const metrics = dbData?.metrics;

  const handleUpdateCampaign = (id: string, newStatus: string) => {
    setLocalCampaignStatus(p => ({ ...p, [id]: newStatus }));
    updateCampaign.mutate({ campaignId: id, status: newStatus });
  };

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'cohorts', label: 'Patient Cohorts', icon: Users },
    { key: 'campaigns', label: 'Intervention Campaigns', icon: Target },
    { key: 'surveillance', label: 'Epidemiology & Surveillance', icon: Globe },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Activity className="w-7 h-7 text-indigo-400" /> Population Health Hub
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Risk Stratification · Community Interventions · Disease Surveillance
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Monitored Patients', value: metrics?.totalMonitoredPatients?.toLocaleString(), color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: Users },
          { label: 'High Risk Cohorts', value: metrics?.highRiskCohorts, color: 'text-rose-400', bg: 'bg-rose-500/10', icon: AlertTriangle },
          { label: 'Active Campaigns', value: metrics?.activeCampaigns, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: Target },
          { label: 'Overall Engagement', value: `${metrics?.overallEngagement || 0}%`, color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: CheckCircle },
          { label: 'Surveillance Alerts', value: metrics?.surveillanceAlerts, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: ShieldAlert },
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

      {/* TAB: Cohorts */}
      {tab === 'cohorts' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['Cohort Name & Desc', 'Primary Condition', 'Patients', 'Avg Age', 'Risk Level', 'Tags'].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dbData?.cohorts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.primaryCondition.toLowerCase().includes(search.toLowerCase())).map(cohort => (
                    <tr key={cohort.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6">
                        <p className="font-bold text-white text-sm">{cohort.name}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5 max-w-[300px] truncate">{cohort.description}</p>
                      </td>
                      <td className="py-4 px-4 text-sm font-medium text-indigo-300">{cohort.primaryCondition}</td>
                      <td className="py-4 px-4 font-mono text-white">{cohort.patientCount.toLocaleString()}</td>
                      <td className="py-4 px-4 text-gray-300">{cohort.averageAge}</td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[10px] px-2', riskColor[cohort.riskLevel])}>
                          {cohort.riskLevel}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-1 flex-wrap max-w-[200px]">
                          {cohort.tags.map(tag => (
                            <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-gray-400">{tag}</span>
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

      {/* TAB: Campaigns */}
      {tab === 'campaigns' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['Campaign Title', 'Type & Target', 'Timeline', 'Engagement', 'Conversion', 'Status', ''].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : i === 6 ? 'pr-6 text-right' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dbData?.campaigns.filter(c => c.title.toLowerCase().includes(search.toLowerCase())).map(c => {
                    const currentStatus = localCampaignStatus[c.id] || c.status;
                    return (
                      <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-4 pl-6">
                          <p className="font-bold text-white text-sm">{c.title}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{c.owner}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-xs font-semibold text-indigo-300">{c.type}</p>
                          <p className="text-[10px] text-gray-500 font-mono mt-0.5">Target: {c.targetCohortId}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-[10px] text-gray-400">Start: {fmtDate(c.startDate)}</p>
                          <p className="text-[10px] text-gray-500">End: {fmtDate(c.endDate)}</p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full w-16">
                              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(c.engagementRate, 100)}%` }} />
                            </div>
                            <span className="text-[10px] text-white font-mono">{c.engagementRate}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full w-16">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(c.conversionRate, 100)}%` }} />
                            </div>
                            <span className="text-[10px] text-white font-mono">{c.conversionRate}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline" className={cn('text-[10px] px-2', statusColor[currentStatus])}>
                            {currentStatus}
                          </Badge>
                        </td>
                        <td className="py-4 pr-6 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {currentStatus === 'Draft' && (
                              <Button size="sm" variant="outline" onClick={() => handleUpdateCampaign(c.id, 'Active')} className="h-7 text-[11px] border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
                                <Play className="w-3 h-3 mr-1" /> Launch
                              </Button>
                            )}
                            {currentStatus === 'Active' && (
                              <Button size="sm" variant="outline" onClick={() => handleUpdateCampaign(c.id, 'Suspended')} className="h-7 text-[11px] border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
                                <Pause className="w-3 h-3 mr-1" /> Suspend
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

      {/* TAB: Surveillance */}
      {tab === 'surveillance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? <div className="flex justify-center p-16 col-span-full"><Spinner size="lg" /></div> : 
            dbData?.surveillance.filter(s => s.diseaseName.toLowerCase().includes(search.toLowerCase())).map(s => (
              <Card key={s.id} className="p-5 border-white/[0.06] bg-surface-dark hover:bg-white/[0.02] transition-colors group flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <Badge variant="outline" className={cn('text-[10px]', severityColor[s.severity])}>
                    {s.severity}
                  </Badge>
                  <span className="text-[10px] text-gray-500 font-mono">{s.id}</span>
                </div>
                <h3 className="font-bold text-white text-base mb-1 group-hover:text-rose-400 transition-colors">{s.diseaseName}</h3>
                
                <div className="mt-4 grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-black/20 rounded-lg p-2.5 border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase">Active Cases</p>
                    <p className="text-xl font-bold text-rose-300 mt-0.5">{s.activeCases.toLocaleString()}</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-2.5 border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase">Weekly Trend</p>
                    <p className="text-sm font-bold text-white mt-0.5 flex items-center gap-1">
                      {s.weeklyTrend > 0 ? <TrendingUp className="w-3 h-3 text-rose-400" /> : <TrendingUp className="w-3 h-3 text-emerald-400 rotate-180" />}
                      {s.weeklyTrend > 0 ? '+' : ''}{s.weeklyTrend}%
                    </p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-[10px] text-gray-500 uppercase mb-1">Affected Regions</p>
                  <div className="flex flex-wrap gap-1">
                    {s.affectedRegions.map(r => (
                      <span key={r} className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-gray-300">{r}</span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs border-t border-white/[0.04] pt-3 mt-auto">
                  <span className="text-gray-400">Outbreak Prob: <span className="font-bold text-white">{s.outbreakProbability}%</span></span>
                  <span className="text-gray-500">Updated: {fmtDate(s.lastUpdated)}</span>
                </div>
              </Card>
            ))
          }
        </div>
      )}
    </div>
  );
}
