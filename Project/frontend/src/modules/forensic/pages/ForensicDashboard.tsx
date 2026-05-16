'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { 
  Fingerprint, Briefcase, ShieldAlert, FileText, Scale,
  Search, RefreshCw, AlertCircle, Clock, 
  ArrowRight, Users, ChevronRight, TrendingUp,
  Gavel, Microscope, Database, FileWarning,
  CheckCircle2, Plus, Calendar, ExternalLink,
  Lock, Share2, ClipboardList
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { 
  useForensicDashboard, 
  useUpdateCase 
} from '../hooks/useForensic';

type Tab = 'cases' | 'evidence' | 'legal';

const caseStatusColor: Record<string, string> = {
  'Open': 'text-amber-400 bg-amber-500/10 border-amber-500/30 animate-pulse',
  'Under Investigation': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  'Evidence Pending': 'text-rose-400 bg-rose-500/10 border-rose-500/30 font-bold',
  'Closed': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Archived': 'text-gray-400 bg-white/5 border-white/10',
};

const priorityColor: Record<string, string> = {
  'Immediate': 'text-rose-500 bg-rose-600/20 border-rose-600/40 font-black animate-pulse',
  'Urgent': 'text-rose-400 bg-rose-500/10 border-rose-500/30 font-bold',
  'Routine': 'text-gray-400 bg-white/5 border-white/10',
  'Statutory': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
};

const fmtDate = (iso: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function ForensicDashboard() {
  const { data, isLoading, isRefetching, refetch } = useForensicDashboard();
  const updateCase = useUpdateCase();

  const [tab, setTab] = useState<Tab>('cases');
  const [search, setSearch] = useState('');

  const dbData = data?.data;
  const metrics = dbData?.metrics;

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'cases', label: 'Case Registry', icon: Briefcase },
    { key: 'evidence', label: 'Evidence Control', icon: ShieldAlert },
    { key: 'legal', label: 'Court & Reports', icon: Scale },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Fingerprint className="w-7 h-7 text-indigo-400" /> Forensic Command Hub
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Medico-Legal Investigation · Chain of Custody · Expert Testimony Orchestration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} /> Refresh
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-900/40">
             <Plus className="w-4 h-4 mr-2" /> New Forensic Case
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Active Cases', value: metrics?.totalActiveCases, color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: Briefcase },
          { label: 'Pending Exams', value: metrics?.pendingExamsCount, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Microscope },
          { label: 'Custody Items', value: metrics?.evidenceItemsInCustody, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: Lock },
          { label: 'Reports (Mo)', value: metrics?.reportsFinalizedThisMonth, color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: FileText },
          { label: 'Avg Turnaround', value: `${metrics?.averageTurnaroundDays} Days`, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Clock },
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

      {/* TAB: Cases */}
      {tab === 'cases' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['Case ID / Subject', 'Type', 'Priority', 'Examined By', 'Status', 'Actions'].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dbData?.recentCases.filter(c => c.subjectName.toLowerCase().includes(search.toLowerCase())).map(c => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6">
                         <div className="flex flex-col">
                            <p className="font-bold text-white text-sm">{c.subjectName}</p>
                            <p className="text-[10px] text-gray-600">{c.id} · Police: {c.policeCaseId}</p>
                         </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-white">
                         <Badge variant="outline" className="text-[9px] border-white/10 text-gray-500 font-mono">
                           {c.caseType}
                         </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[9px] px-1.5', priorityColor[c.priority])}>
                          {c.priority}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-400 italic">
                         {c.examiningOfficer}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[9px] px-1.5', caseStatusColor[c.status])}>
                          {c.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-right pr-6">
                         <Button size="sm" variant="ghost" className="h-7 text-[10px] text-indigo-400 hover:bg-indigo-500/10">
                            Open Case File <ChevronRight className="w-3 h-3 ml-1.5" />
                         </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* TAB: Evidence */}
      {tab === 'evidence' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <Card className="lg:col-span-1 p-6 border-white/[0.06] bg-surface-dark flex flex-col">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" /> Evidence Custody
              </h3>
              <div className="space-y-4 flex-1">
                 {dbData?.evidenceAlerts.map(e => (
                   <div key={e.id} className="p-4 bg-black/20 rounded-2xl border border-white/5 space-y-3 group hover:border-emerald-500/30 transition-colors">
                      <div className="flex justify-between items-start">
                         <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono">
                            {e.id}
                         </Badge>
                         <p className="text-[9px] text-gray-500">{fmtDate(e.collectedAt)}</p>
                      </div>
                      <div>
                         <p className="text-sm font-bold text-white">{e.type}</p>
                         <p className="text-[11px] text-gray-500">{e.description}</p>
                      </div>
                      <div className="pt-2 flex items-center justify-between">
                         <div className="flex items-center gap-1.5">
                            <Database className="w-3.5 h-3.5 text-gray-600" />
                            <span className="text-[10px] text-gray-400 uppercase tracking-tighter">Loc: {e.secureStorageLocation}</span>
                         </div>
                         <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-gray-500 hover:text-white">
                            <Share2 className="w-3 h-3" />
                         </Button>
                      </div>
                   </div>
                 ))}
              </div>
              <Button className="mt-6 w-full bg-emerald-600 hover:bg-emerald-500 h-11 text-sm shadow-lg shadow-emerald-900/40">
                 Chain of Custody Audit <ClipboardList className="w-4 h-4 ml-2" />
              </Button>
           </Card>

           <Card className="lg:col-span-2 p-8 border-white/[0.06] bg-surface-dark flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-indigo-500/10 rounded-full mb-4">
                 <Microscope className="w-10 h-10 text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Forensic Laboratory Sync</h2>
              <p className="text-sm text-gray-500 max-w-sm mb-8 leading-relaxed">
                Visualizing institutional lab capacity, DNA sequencing queues, and toxicology turnaround metrics.
              </p>
              <div className="grid grid-cols-2 gap-4 w-full mb-8 max-w-lg">
                 <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">DNA Queue</p>
                    <p className="text-sm font-bold text-indigo-400">12 Samples</p>
                 </div>
                 <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Tox Turnaround</p>
                    <p className="text-sm font-bold text-emerald-400">48 Hours</p>
                 </div>
              </div>
              <div className="flex gap-4 w-full max-w-lg">
                 <Button variant="outline" className="flex-1 border-white/10 text-gray-400 h-11">Lab Integration Setup</Button>
                 <Button className="flex-1 bg-indigo-600 hover:bg-indigo-500 h-11 shadow-lg shadow-indigo-900/30">Release Samples</Button>
              </div>
           </Card>
        </div>
      )}

      {/* TAB: Legal */}
      {tab === 'legal' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Card className="p-6 border-white/[0.06] bg-surface-dark flex flex-col">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" /> Upcoming Court Appearances
              </h3>
              <div className="space-y-4">
                 {dbData?.upcomingCourtDates.map(s => (
                   <div key={s.id} className="p-5 bg-amber-500/5 rounded-2xl border border-amber-500/10 flex items-center justify-between group hover:border-amber-500/30 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-amber-500/10 transition-colors text-amber-400">
                            <Gavel className="w-6 h-6" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-white">{s.courtName}</p>
                            <p className="text-[10px] text-gray-500">Case: {s.caseId} · Role: {s.witnessRole}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-xs font-bold text-white">{new Date(s.appearanceDate).toLocaleDateString()}</p>
                         <Badge variant="outline" className="text-[9px] mt-1 bg-amber-500/10 text-amber-400 border-amber-500/30">
                            {s.status}
                         </Badge>
                      </div>
                   </div>
                 ))}
              </div>
              <Button className="mt-6 w-full bg-black/40 border border-white/10 hover:bg-white/5 h-11 text-xs">
                 Expert Witness Schedule <ExternalLink className="w-3.5 h-3.5 ml-2" />
              </Button>
           </Card>

           <Card className="p-6 border-white/[0.06] bg-surface-dark flex flex-col">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" /> Medico-Legal Reports Queue
              </h3>
              <div className="space-y-4">
                 {[
                   { title: 'Injury Certificate #882', status: 'Draft', author: 'Dr. Sarah Connor' },
                   { title: 'Post-Mortem Analysis - CX001', status: 'Finalized', author: 'Dr. Hannibal Lecter' },
                 ].map((r, i) => (
                   <div key={i} className="p-4 border-b border-white/[0.02] flex items-center justify-between group hover:bg-white/[0.01]">
                      <div className="flex items-center gap-4">
                         <div className="p-2 rounded-lg bg-white/5">
                            <FileText className="w-4 h-4 text-gray-500" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-white">{r.title}</p>
                            <p className="text-[10px] text-gray-500">Author: {r.author}</p>
                         </div>
                      </div>
                      <Badge variant="outline" className={cn('text-[9px]', r.status === 'Finalized' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400')}>
                         {r.status}
                      </Badge>
                   </div>
                 ))}
              </div>
              <Button className="mt-auto w-full bg-indigo-600 hover:bg-indigo-500 h-11 text-sm shadow-lg shadow-indigo-900/40">
                 Finalize Pending Reports <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
           </Card>
        </div>
      )}
    </div>
  );
}
