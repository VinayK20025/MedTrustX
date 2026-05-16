'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { 
  Gavel, ClipboardList, AlertTriangle, ShieldCheck, BookCheck,
  Search, RefreshCw, Activity, ShieldAlert, Clock, Calendar,
  ArrowRight, ExternalLink, Filter, TrendingUp, Info,
  CheckCircle, MoreHorizontal, FileText
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { 
  useComplianceDashboard, 
  useReportNonConformance 
} from '../hooks/useCompliance';

type Tab = 'audits' | 'risks' | 'non-conformance';

const severityColor: Record<string, string> = {
  'Low': 'text-gray-400 bg-white/5 border-white/10',
  'Medium': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'High': 'text-rose-400 bg-rose-500/10 border-rose-500/30 font-bold',
  'Critical': 'text-rose-500 bg-rose-600/20 border-rose-600/40 font-black animate-pulse',
};

const statusColor: Record<string, string> = {
  'Scheduled': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  'In Progress': 'text-amber-400 bg-amber-500/10 border-amber-500/30 animate-pulse',
  'Completed': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Delayed': 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  'Open': 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  'Mitigating': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Resolved': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
};

const fmtDate = (iso: string) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export function ComplianceDashboard() {
  const { data, isLoading, isRefetching, refetch } = useComplianceDashboard();
  const reportNC = useReportNonConformance();

  const [tab, setTab] = useState<Tab>('audits');
  const [search, setSearch] = useState('');

  const dbData = data?.data;
  const metrics = dbData?.metrics;

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'audits', label: 'Compliance Audits', icon: ClipboardList },
    { key: 'risks', label: 'Risk Register', icon: AlertTriangle },
    { key: 'non-conformance', label: 'Non-Conformance', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Gavel className="w-7 h-7 text-indigo-400" /> Compliance Governance
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Regulatory Oversight · Institutional Risk · Corrective Actions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} /> Refresh
          </Button>
          <Button variant="outline" className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10">
             New Risk Incident
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Risk Score', value: metrics?.overallRiskScore, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Activity },
          { label: 'Audit Progress', value: `${metrics?.auditCompletionRate}%`, color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: ClipboardList },
          { label: 'Open NCs', value: metrics?.openNonConformances, color: 'text-rose-400', bg: 'bg-rose-500/10', icon: ShieldAlert },
          { label: 'Training Rate', value: `${metrics?.trainingCompliancePercent}%`, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: BookCheck },
          { label: 'Deadlines', value: metrics?.upcomingRegulatoryDeadlines, color: 'text-amber-300', bg: 'bg-amber-500/10', icon: Clock },
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

      {/* TAB: Audits */}
      {tab === 'audits' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['Audit Title', 'Department', 'Auditor', 'Timeline', 'Compliance', 'Status'].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dbData?.recentAudits.filter(a => a.title.toLowerCase().includes(search.toLowerCase())).map(a => (
                    <tr key={a.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6 font-bold text-white text-sm">{a.title}</td>
                      <td className="py-4 px-4 text-xs text-white">{a.department}</td>
                      <td className="py-4 px-4 text-xs text-gray-400">{a.auditor}</td>
                      <td className="py-4 px-4">
                        <p className="text-[10px] text-gray-500">From: {fmtDate(a.startDate)}</p>
                        <p className="text-[10px] text-gray-500">To: {fmtDate(a.endDate)}</p>
                      </td>
                      <td className="py-4 px-4">
                        {a.complianceScore ? (
                          <span className={cn("font-bold", a.complianceScore >= 90 ? "text-emerald-400" : "text-amber-400")}>{a.complianceScore}%</span>
                        ) : <span className="text-gray-600">-</span>}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[9px] px-1.5', statusColor[a.status])}>
                          {a.status}
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

      {/* TAB: Risks */}
      {tab === 'risks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? <div className="flex justify-center p-16 col-span-full"><Spinner size="lg" /></div> : 
            dbData?.criticalRisks.filter(r => r.title.toLowerCase().includes(search.toLowerCase())).map(r => (
              <Card key={r.id} className="p-5 border-white/[0.06] bg-surface-dark flex flex-col group border-l-4 border-l-rose-500/30">
                 <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className="text-[9px] bg-white/5 border-white/10 text-gray-400 font-mono">
                      {r.id}
                    </Badge>
                    <Badge variant="outline" className={cn('text-[9px]', severityColor[r.level])}>
                      {r.level} Risk
                    </Badge>
                 </div>
                 <h3 className="font-bold text-white text-base mb-1 group-hover:text-indigo-400 transition-colors">{r.title}</h3>
                 <p className="text-[11px] text-gray-500 mb-4">{r.category} · Owner: {r.owner}</p>
                 
                 <div className="bg-black/20 p-3 rounded-xl border border-white/5 mb-4 flex-1">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> Mitigation</p>
                    <p className="text-xs text-gray-300 leading-relaxed italic line-clamp-3">"{r.mitigationPlan}"</p>
                 </div>
                 
                 <div className="flex items-center justify-between text-[10px] text-gray-500 pt-3 border-t border-white/[0.04]">
                    <span>Last Reviewed: {fmtDate(r.lastReviewDate)}</span>
                    <Button size="sm" variant="ghost" className="h-6 text-[10px] text-indigo-400 hover:bg-white/5">
                       Full Register <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                 </div>
              </Card>
            ))
          }
        </div>
      )}

      {/* TAB: Non-Conformance */}
      {tab === 'non-conformance' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
           {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['NC ID', 'Description', 'Source', 'Severity', 'Target Resolution', 'Status'].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dbData?.pendingNonConformances.filter(nc => nc.description.toLowerCase().includes(search.toLowerCase())).map(nc => (
                    <tr key={nc.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6 font-mono text-rose-400 text-xs">{nc.id}</td>
                      <td className="py-4 px-4 max-w-xs">
                        <p className="text-white text-xs leading-relaxed">{nc.description}</p>
                        <p className="text-[10px] text-gray-500 mt-1 italic">Found: {fmtDate(nc.dateFound)}</p>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-400">{nc.source}</td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[9px]', severityColor[nc.severity])}>
                          {nc.severity}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-xs text-white font-mono">{fmtDate(nc.targetResolution)}</td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[9px] px-1.5', statusColor[nc.status])}>
                          {nc.status}
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
    </div>
  );
}
