'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { 
  Shield, Lock, ScrollText, Database, GitBranch,
  Search, RefreshCw, AlertCircle, Clock, Calendar,
  ShieldCheck, ShieldAlert, FileText, Info, ArrowRight,
  ClipboardList, ExternalLink, Activity, HardDrive, Filter
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { 
  useGovernanceDashboard, 
  useUpdatePolicyStatus 
} from '../hooks/useGovernance';

type Tab = 'policies' | 'privacy' | 'catalog';

const classificationColor: Record<string, string> = {
  'Restricted (PHI)': 'text-rose-400 bg-rose-500/10 border-rose-500/30 font-bold',
  'Confidential': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Internal': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  'Public': 'text-gray-400 bg-white/5 border-white/10',
};

const statusColor: Record<string, string> = {
  'Active': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Under Review': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Processing': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30 animate-pulse',
  'Pending': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Completed': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
};

const fmtDate = (iso: string) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export function DataGovernanceDashboard() {
  const { data, isLoading, isRefetching, refetch } = useGovernanceDashboard();
  const updatePolicy = useUpdatePolicyStatus();

  const [tab, setTab] = useState<Tab>('policies');
  const [search, setSearch] = useState('');

  const dbData = data?.data;
  const metrics = dbData?.metrics;

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'policies', label: 'Data Policies', icon: ScrollText },
    { key: 'privacy', label: 'Privacy Requests', icon: Lock },
    { key: 'catalog', label: 'Data Catalog & Quality', icon: Database },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Shield className="w-7 h-7 text-indigo-400" /> Data Governance Hub
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Policy Enforcement · Data Privacy (HIPAA/GDPR) · Quality & Stewardship
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} /> Refresh
          </Button>
          <Button variant="outline" className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
             Compliance Audit
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'PHI Compliance', value: `${metrics?.phiComplianceScore}%`, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: ShieldCheck },
          { label: 'Privacy Pending', value: metrics?.privacyRequestsPending, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Lock },
          { label: 'Data Quality', value: `${metrics?.dataQualityAverage}%`, color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: Activity },
          { label: 'Data Assets', value: metrics?.totalDataAssets, color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: HardDrive },
          { label: 'Unclassified', value: metrics?.unclassifiedAssetsCount, color: 'text-rose-400', bg: 'bg-rose-500/10', icon: ShieldAlert },
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

      {/* TAB: Policies */}
      {tab === 'policies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {isLoading ? <div className="flex justify-center p-16 col-span-full"><Spinner size="lg" /></div> : 
             dbData?.topPolicies.filter(p => p.title.toLowerCase().includes(search.toLowerCase())).map(p => (
               <Card key={p.id} className="p-5 border-white/[0.06] bg-surface-dark flex flex-col group hover:border-indigo-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className={cn('text-[9px] px-1.5', classificationColor[p.classification])}>
                      {p.classification}
                    </Badge>
                    <Badge variant="outline" className={cn('text-[9px] px-1.5', statusColor[p.status])}>
                      {p.status}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-white text-base mb-1 group-hover:text-indigo-400 transition-colors leading-tight">{p.title}</h3>
                  <p className="text-[11px] text-gray-500 mb-4">{p.category} Management · {p.owner}</p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4 mt-auto">
                    <div className="bg-black/20 p-2.5 rounded-xl border border-white/5">
                      <p className="text-[10px] text-gray-500 uppercase mb-0.5">Last Review</p>
                      <p className="text-xs font-bold text-white font-mono">{fmtDate(p.lastReviewed)}</p>
                    </div>
                    <div className="bg-black/20 p-2.5 rounded-xl border border-white/5">
                      <p className="text-[10px] text-gray-500 uppercase mb-0.5">Next Review</p>
                      <p className="text-xs font-bold text-indigo-400 font-mono">{fmtDate(p.nextReview)}</p>
                    </div>
                  </div>
                  
                  <Button size="sm" variant="ghost" className="h-7 text-[11px] text-gray-400 hover:text-white border border-white/5 hover:bg-white/5 w-full">
                    View Full Policy <ExternalLink className="w-3 h-3 ml-2" />
                  </Button>
               </Card>
             ))
           }
        </div>
      )}

      {/* TAB: Privacy */}
      {tab === 'privacy' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['Request ID', 'Patient ID', 'Request Type', 'Received Date', 'SLA Due Date', 'Status'].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dbData?.recentPrivacyRequests.filter(r => r.id.toLowerCase().includes(search.toLowerCase()) || r.patientId.toLowerCase().includes(search.toLowerCase())).map(r => (
                    <tr key={r.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6 font-mono text-indigo-400 text-xs">{r.id}</td>
                      <td className="py-4 px-4 font-bold text-white text-sm">{r.patientId}</td>
                      <td className="py-4 px-4 text-xs text-white">{r.type}</td>
                      <td className="py-4 px-4 text-xs text-gray-400 font-mono">{fmtDate(r.requestDate)}</td>
                      <td className="py-4 px-4">
                        <span className="text-xs text-rose-400 font-mono font-bold">{fmtDate(r.dueDate)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[9px] px-1.5', statusColor[r.status])}>
                          {r.status}
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

      {/* TAB: Catalog */}
      {tab === 'catalog' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Card className="p-6 border-white/[0.06] bg-surface-dark flex flex-col">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-indigo-400" /> System Lineage & Flow
              </h3>
              <div className="space-y-4">
                 {[
                   { from: 'EMR Core', to: 'Analytics Warehouse', data: 'Patient Clinical Records', risk: 'High (PHI)' },
                   { from: 'Laboratory Info System', to: 'Clinician Portal', data: 'Diagnostic Results', risk: 'High (PHI)' },
                   { from: 'IoT Hub', to: 'Telemetry Stream', data: 'Vitals Data', risk: 'Medium' }
                 ].map((flow, i) => (
                   <div key={i} className="p-4 bg-black/20 rounded-2xl border border-white/5 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">Flow</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-white font-bold">{flow.from}</span>
                          <ArrowRight className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-white font-bold">{flow.to}</span>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="text-xs text-indigo-300 font-medium">{flow.data}</p>
                         <p className="text-[10px] text-rose-400 mt-1 uppercase font-bold">{flow.risk}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </Card>
           
           <Card className="p-6 border-white/[0.06] bg-surface-dark flex flex-col">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" /> Data Quality Trends
              </h3>
              <div className="flex-1 min-h-[200px] flex items-end gap-2 pb-2">
                 {dbData?.dataQualityTrends.map((t, i) => (
                   <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="w-full bg-emerald-500/20 rounded-t-lg group-hover:bg-emerald-500/40 transition-colors relative" style={{ height: `${t.score * 2}px` }}>
                         <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">{t.score}%</span>
                      </div>
                      <span className="text-[8px] text-gray-600 font-mono rotate-45 mt-4">{fmtDate(t.date)}</span>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      )}
    </div>
  );
}
