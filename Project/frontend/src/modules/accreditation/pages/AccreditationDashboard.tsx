'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { 
  Award, Gavel, ScrollText, FileSearch, ClipboardList,
  Search, RefreshCw, CheckCircle, AlertTriangle, Clock,
  Calendar, ShieldCheck, FileText, ChevronRight, Download,
  BarChart, ExternalLink, Info, ArrowRight
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { 
  useAccreditationDashboard, 
  useUpdateStandardStatus 
} from '../hooks/useAccreditation';

type Tab = 'chapters' | 'standards' | 'surveys';

const statusColor: Record<string, string> = {
  'Compliant': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Partial': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Non-Compliant': 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  'Scheduled': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  'In Progress': 'text-amber-400 bg-amber-500/10 border-amber-500/30 animate-pulse',
  'Completed': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
};

const fmtDate = (iso: string) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export function AccreditationDashboard() {
  const { data, isLoading, isRefetching, refetch } = useAccreditationDashboard();
  const updateStatus = useUpdateStandardStatus();

  const [tab, setTab] = useState<Tab>('chapters');
  const [search, setSearch] = useState('');

  const dbData = data?.data;
  const metrics = dbData?.metrics;

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'chapters', label: 'Compliance Chapters', icon: BarChart },
    { key: 'standards', label: 'Standards Registry', icon: Gavel },
    { key: 'surveys', label: 'Surveys & Audits', icon: ClipboardList },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Award className="w-7 h-7 text-indigo-400" /> Accreditation Readiness Hub
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Standards Tracking · Evidence Management · Survey Preparedness
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} /> Refresh
          </Button>
          <Button variant="outline" className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
             Evidence Binder
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Overall Compliance', value: `${metrics?.overallCompliancePercent}%`, color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: ShieldCheck },
          { label: 'Verified Standards', value: `${metrics?.standardsVerified}/${metrics?.totalStandards}`, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle },
          { label: 'Pending Evidence', value: metrics?.pendingEvidence, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: ScrollText },
          { label: 'Next Survey', value: `${metrics?.daysToNextSurvey} Days`, color: 'text-rose-400', bg: 'bg-rose-500/10', icon: Clock },
          { label: 'Self Assessment', value: 'Complete', color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: FileSearch },
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

      {/* TAB: Chapters */}
      {tab === 'chapters' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? <div className="flex justify-center p-16 col-span-full"><Spinner size="lg" /></div> : 
            dbData?.chapters.filter(ch => ch.name.toLowerCase().includes(search.toLowerCase())).map((ch, i) => (
              <Card key={i} className="p-5 border-white/[0.06] bg-surface-dark flex flex-col group hover:border-indigo-500/30 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors leading-tight">{ch.name}</h3>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-white">{ch.compliance}%</span>
                  </div>
                </div>
                
                <div className="w-full bg-white/5 rounded-full h-1.5 mb-4 overflow-hidden">
                   <div className={cn("h-full rounded-full transition-all duration-500", ch.compliance >= 90 ? "bg-emerald-500" : ch.compliance >= 70 ? "bg-amber-500" : "bg-rose-500")} style={{ width: `${ch.compliance}%` }} />
                </div>
                
                <div className="flex items-center justify-between text-[10px] text-gray-500 mt-auto">
                   <span>{ch.standardsCount} Standards</span>
                   <Button size="sm" variant="ghost" className="h-6 text-[10px] text-gray-400 hover:text-white">
                      View Chapter <ArrowRight className="w-3 h-3 ml-1" />
                   </Button>
                </div>
              </Card>
            ))
          }
        </div>
      )}

      {/* TAB: Standards */}
      {tab === 'standards' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['Code', 'Standard Statement', 'Chapter', 'Evidence', 'Last Assessment', 'Status'].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dbData?.recentStandards.filter(s => s.code.toLowerCase().includes(search.toLowerCase()) || s.statement.toLowerCase().includes(search.toLowerCase())).map(s => (
                    <tr key={s.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6 font-mono text-indigo-300 text-xs">{s.code}</td>
                      <td className="py-4 px-4 max-w-md">
                        <p className="text-white text-xs leading-relaxed">{s.statement}</p>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-500">{s.chapter}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <ScrollText className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-white font-mono">{s.evidenceCount}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-400">{fmtDate(s.lastAssessmentDate)}</td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[9px] px-1.5', statusColor[s.status])}>
                          {s.status}
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

      {/* TAB: Surveys */}
      {tab === 'surveys' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? <div className="flex justify-center p-16 col-span-full"><Spinner size="lg" /></div> : 
            dbData?.upcomingSurveys.map(sur => (
              <Card key={sur.id} className="p-6 border-white/[0.06] bg-surface-dark flex flex-col group">
                 <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-indigo-500/10 rounded-xl">
                        <ClipboardList className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{sur.title}</h3>
                        <p className="text-xs text-gray-500 font-mono">{sur.body}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn('text-[10px]', statusColor[sur.status])}>
                      {sur.status}
                    </Badge>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                       <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Start Date</p>
                       <p className="text-sm font-bold text-white">{fmtDate(sur.startDate)}</p>
                    </div>
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                       <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">End Date</p>
                       <p className="text-sm font-bold text-white">{fmtDate(sur.endDate)}</p>
                    </div>
                 </div>

                 <div className="flex items-center justify-between border-t border-white/[0.04] pt-4 mt-auto">
                    <div className="flex items-center gap-2">
                       <Badge className={cn("text-[9px] uppercase", sur.type === 'Official' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20")}>
                         {sur.type}
                       </Badge>
                    </div>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-xs">
                       View Logistics <ArrowRight className="w-3 h-3 ml-2" />
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
