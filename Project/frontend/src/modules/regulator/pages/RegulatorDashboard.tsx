'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { 
  Landmark, Send, FileBadge, ShieldCheck, BellRing,
  Search, RefreshCw, AlertCircle, Clock, 
  ArrowRight, Users, ChevronRight, TrendingUp,
  FileText, CheckCircle2, MoreHorizontal, Filter,
  Building2, ExternalLink, Calendar, AlertTriangle,
  History, Download, Zap, Eye
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { 
  useRegulatorDashboard, 
  useAcknowledgeDirective 
} from '../hooks/useRegulator';

type Tab = 'submissions' | 'licenses' | 'directives';

const statusColor: Record<string, string> = {
  'Approved': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Received': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  'Sent': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  'Draft': 'text-gray-400 bg-white/5 border-white/10',
  'Query Raised': 'text-amber-400 bg-amber-500/10 border-amber-500/30 animate-pulse',
  'Rejected': 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  'Active': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Expiring Soon': 'text-amber-500 bg-amber-600/10 border-amber-600/30 font-bold animate-pulse',
  'Expired': 'text-rose-500 bg-rose-600/10 border-rose-600/30',
};

const priorityColor: Record<string, string> = {
  'Immediate Action': 'text-rose-500 bg-rose-600/20 border-rose-600/40 font-black animate-pulse',
  'High': 'text-rose-400 bg-rose-500/10 border-rose-500/30 font-bold',
  'Medium': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Low': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
};

const fmtDate = (iso: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function RegulatorDashboard() {
  const { data, isLoading, isRefetching, refetch } = useRegulatorDashboard();
  const acknowledge = useAcknowledgeDirective();

  const [tab, setTab] = useState<Tab>('submissions');
  const [search, setSearch] = useState('');

  const dbData = data?.data;
  const metrics = dbData?.metrics;

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'submissions', label: 'Statutory Submissions', icon: Send },
    { key: 'licenses', label: 'Institutional Licenses', icon: FileBadge },
    { key: 'directives', label: 'Regulatory Directives', icon: BellRing },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Landmark className="w-7 h-7 text-indigo-400" /> Regulator Compliance Hub
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Ministerial Gateway · Statutory Reporting · Licensing & Audit Oversight
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} /> Refresh
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-900/40">
             <Plus className="w-4 h-4 mr-2" /> New Submission
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Submissions', value: metrics?.totalSubmissionsYTD, color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: Send },
          { label: 'Active Queries', value: metrics?.pendingRegulatoryQueries, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: History },
          { label: 'Institutional Licenses', value: metrics?.activeLicensesCount, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: FileBadge },
          { label: 'Open Directives', value: metrics?.unacknowledgedDirectives, color: 'text-rose-500', bg: 'bg-rose-600/20', icon: BellRing },
          { label: 'Compliance Score', value: `${metrics?.complianceScorePercent}%`, color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: ShieldCheck },
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

      {/* TAB: Submissions */}
      {tab === 'submissions' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['Submission ID / Title', 'Regulator', 'Category', 'Submitted At', 'Status', 'Actions'].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dbData?.recentSubmissions.filter(s => s.title.toLowerCase().includes(search.toLowerCase())).map(s => (
                    <tr key={s.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6">
                         <p className="font-bold text-white text-sm">{s.title}</p>
                         <p className="text-[10px] text-gray-600">{s.id}</p>
                      </td>
                      <td className="py-4 px-4 text-xs text-white">
                         <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                            {s.body}
                         </div>
                      </td>
                      <td className="py-4 px-4">
                         <Badge variant="outline" className="text-[9px] border-white/10 text-gray-500 font-mono">
                           {s.category}
                         </Badge>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-400 font-mono">
                         {fmtDate(s.submittedAt)}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[9px] px-1.5', statusColor[s.status])}>
                          {s.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-right pr-6">
                         <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-500 hover:text-white">
                               <Download className="w-3.5 h-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-indigo-400 hover:bg-indigo-500/10">
                               <Eye className="w-3.5 h-3.5" />
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

      {/* TAB: Licenses */}
      {tab === 'licenses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {isLoading ? <div className="flex justify-center p-16 col-span-full"><Spinner size="lg" /></div> : 
             dbData?.expiringLicenses.map(l => (
               <Card key={l.id} className="p-6 border-white/[0.06] bg-surface-dark flex flex-col group hover:border-indigo-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-6">
                     <div className={cn('p-3 rounded-2xl', l.status === 'Expiring Soon' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-400')}>
                        <FileBadge className="w-6 h-6" />
                     </div>
                     <Badge variant="outline" className={cn('text-[9px] px-1.5', statusColor[l.status])}>
                       {l.status}
                     </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1 leading-tight">{l.type}</h3>
                  <p className="text-[11px] text-gray-500 mb-6">{l.issuedBy}</p>
                  
                  <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-3 mb-6">
                     <div className="flex justify-between text-[10px]">
                        <span className="text-gray-500 uppercase tracking-widest font-bold">Valid From</span>
                        <span className="text-white font-mono">{new Date(l.validFrom).toLocaleDateString()}</span>
                     </div>
                     <div className="flex justify-between text-[10px]">
                        <span className="text-gray-500 uppercase tracking-widest font-bold">Valid Until</span>
                        <span className={cn('font-mono font-bold', l.status === 'Expiring Soon' ? 'text-amber-500' : 'text-emerald-400')}>
                           {new Date(l.validUntil).toLocaleDateString()}
                        </span>
                     </div>
                  </div>
                  
                  <Button className="mt-auto w-full bg-black/40 border border-white/10 hover:bg-white/5 h-11 text-xs">
                     Renewal Workflow <Zap className="w-3.5 h-3.5 ml-2 text-amber-500" />
                  </Button>
               </Card>
             ))
           }
        </div>
      )}

      {/* TAB: Directives */}
      {tab === 'directives' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Card className="p-6 border-white/[0.06] bg-surface-dark flex flex-col">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <BellRing className="w-5 h-5 text-rose-400" /> Active Regulatory Directives
              </h3>
              <div className="space-y-4">
                 {dbData?.activeDirectives.map(dir => (
                   <div key={dir.id} className="p-5 bg-black/20 rounded-2xl border border-white/5 space-y-4 group hover:border-rose-500/30 transition-colors">
                      <div className="flex justify-between items-start">
                         <div className="flex items-center gap-3">
                            <Badge variant="outline" className={cn('text-[9px] px-1.5', priorityColor[dir.priority])}>
                               {dir.priority}
                            </Badge>
                            <span className="text-[10px] text-gray-600 font-mono">{dir.id}</span>
                         </div>
                         <p className="text-[9px] text-gray-500">{fmtDate(dir.receivedAt)}</p>
                      </div>
                      <div>
                         <h4 className="text-sm font-bold text-white mb-1 group-hover:text-rose-400 transition-colors">{dir.title}</h4>
                         <p className="text-[11px] text-gray-500 italic">Issued by: {dir.body}</p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
                         <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-rose-500" />
                            <span className="text-[10px] text-rose-400 font-bold uppercase tracking-tighter">Deadline: {fmtDate(dir.deadline || '')}</span>
                         </div>
                         {dir.acknowledged ? (
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">Acknowledged</Badge>
                         ) : (
                            <Button size="sm" className="h-7 text-[10px] bg-rose-600 hover:bg-rose-500"
                                    onClick={() => acknowledge.mutate(dir.id)}>
                               Acknowledge Receipt
                            </Button>
                         )}
                      </div>
                   </div>
                 ))}
              </div>
           </Card>

           <Card className="p-8 border-white/[0.06] bg-surface-dark flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-indigo-500/10 rounded-full mb-4">
                 <ShieldCheck className="w-10 h-10 text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Institutional Compliance Score</h2>
              <p className="text-sm text-gray-500 max-w-sm mb-8 leading-relaxed">
                Real-time mapping of institutional performance against MoH and international regulatory standards.
              </p>
              <div className="grid grid-cols-2 gap-4 w-full mb-8">
                 <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Submissions Success</p>
                    <p className="text-sm font-bold text-emerald-400">99.2%</p>
                 </div>
                 <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Active Directives</p>
                    <p className="text-sm font-bold text-rose-400">{dbData?.metrics.unacknowledgedDirectives}</p>
                 </div>
              </div>
              <div className="flex flex-col gap-3 w-full">
                 <Button className="w-full bg-indigo-600 hover:bg-indigo-500 h-11 text-sm shadow-lg shadow-indigo-900/40">
                    Generate Global Compliance Report <Download className="w-4 h-4 ml-2" />
                 </Button>
                 <Button variant="outline" className="w-full border-white/10 text-gray-400 h-11">
                    Regulatory Audit Registry
                 </Button>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
}
