'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { 
  Briefcase, LogOut, FileCheck, GitMerge, UserCheck,
  Search, RefreshCw, AlertCircle, Clock, Calendar,
  TrendingUp, TrendingDown, ClipboardList, Box, 
  ArrowRight, Users, ChevronRight, Activity, 
  ShieldAlert, Info, ListTodo, MapPin
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { 
  useCaseDashboard, 
  useUpdateDischargeStatus 
} from '../hooks/useCase';

type Tab = 'discharge' | 'utilization' | 'referrals';

const statusColor: Record<string, string> = {
  'Planning': 'text-gray-400 bg-white/5 border-white/10',
  'Pending Approval': 'text-amber-400 bg-amber-500/10 border-amber-500/30 animate-pulse',
  'Transport Arranged': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  'Completed': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Approved': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Denied': 'text-rose-400 bg-rose-500/10 border-rose-500/30 font-bold',
  'Pending Review': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Accepted': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Initiated': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
};

const acuityColor: Record<string, string> = {
  'Critical': 'text-rose-500 bg-rose-600/20 border-rose-600/40 font-black animate-pulse',
  'High': 'text-rose-400 bg-rose-500/10 border-rose-500/30 font-bold',
  'Medium': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Low': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
};

const fmtDate = (iso: string) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export function CaseDashboard() {
  const { data, isLoading, isRefetching, refetch } = useCaseDashboard();
  const updateStatus = useUpdateDischargeStatus();

  const [tab, setTab] = useState<Tab>('discharge');
  const [search, setSearch] = useState('');

  const dbData = data?.data;
  const metrics = dbData?.metrics;

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'discharge', label: 'Discharge Planning', icon: LogOut },
    { key: 'utilization', label: 'Utilization Review', icon: FileCheck },
    { key: 'referrals', label: 'Social Referrals', icon: UserCheck },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-indigo-400" /> Case Management Control
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Care Transitions · Resource Utilization · Multidisciplinary Coordination
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} /> Refresh
          </Button>
          <Button variant="outline" className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
             <ListTodo className="w-4 h-4 mr-2" /> Rounds List
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Active Cases', value: metrics?.totalActiveCases, color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: Users },
          { label: 'Avg LOS (Days)', value: metrics?.averageLengthOfStayDays, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Clock },
          { label: 'Discharge Ready', value: metrics?.dischargeReadyCount, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: LogOut },
          { label: 'Pending Reviews', value: metrics?.pendingUtilizationReviews, color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: FileCheck },
          { label: 'High Readmit Risk', value: metrics?.readmissionRiskHighCount, color: 'text-rose-400', bg: 'bg-rose-500/10', icon: ShieldAlert },
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

      {/* TAB: Discharge */}
      {tab === 'discharge' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {isLoading ? <div className="flex justify-center p-16 col-span-full"><Spinner size="lg" /></div> : 
             dbData?.highAcuityCases.filter(c => c.patientName.toLowerCase().includes(search.toLowerCase())).map(c => (
               <Card key={c.id} className="p-5 border-white/[0.06] bg-surface-dark flex flex-col group hover:border-indigo-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className={cn('text-[9px] px-1.5', acuityColor[c.acuityLevel])}>
                      {c.acuityLevel} Acuity
                    </Badge>
                    <Badge variant="outline" className={cn('text-[9px] px-1.5', statusColor[c.status])}>
                      {c.status}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-white text-base mb-1 group-hover:text-indigo-400 transition-colors leading-tight">{c.patientName}</h3>
                  <p className="text-[11px] text-gray-500 mb-4">Admitted: {fmtDate(c.admissionDate)} · Est. Discharge: {fmtDate(c.estimatedDischargeDate)}</p>
                  
                  <div className="bg-black/20 p-3 rounded-xl border border-white/5 mb-4 flex-1">
                     <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Discharge Barriers
                     </p>
                     <div className="flex flex-wrap gap-1">
                        {c.barriersToDischarge.map(b => (
                          <span key={b} className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded border border-white/10">
                             {b}
                          </span>
                        ))}
                     </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                     <span className="text-[10px] text-gray-600 font-mono">{c.id}</span>
                     <Button size="sm" variant="ghost" className="h-7 text-[11px] text-indigo-400 hover:bg-white/5">
                        Transition Plan <ArrowRight className="w-3 h-3 ml-2" />
                     </Button>
                  </div>
               </Card>
             ))
           }
        </div>
      )}

      {/* TAB: Utilization */}
      {tab === 'utilization' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['Payer / Case', 'Authorized', 'Auth Remaining', 'Next Review', 'Status', 'Actions'].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dbData?.pendingReviews.filter(r => r.payerName.toLowerCase().includes(search.toLowerCase())).map(r => (
                    <tr key={r.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6">
                         <p className="font-bold text-white text-sm">{r.payerName}</p>
                         <p className="text-[10px] text-indigo-400 font-mono">Case: {r.caseId}</p>
                      </td>
                      <td className="py-4 px-4 text-xs text-white">
                         {r.authorizedDays} Days
                      </td>
                      <td className="py-4 px-4">
                         <div className="w-24 bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: '60%' }} />
                         </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-400 font-mono">{fmtDate(r.nextReviewDate)}</td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[9px] px-1.5', statusColor[r.status])}>
                          {r.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                         <Button size="sm" variant="ghost" className="h-7 text-[10px] text-gray-500 hover:text-white">
                           Review Docs
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

      {/* TAB: Referrals */}
      {tab === 'referrals' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Card className="p-6 border-white/[0.06] bg-surface-dark flex flex-col">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <GitMerge className="w-5 h-5 text-indigo-400" /> Active Placement & Referrals
              </h3>
              <div className="space-y-4">
                 {dbData?.activeReferrals.map(ref => (
                   <div key={ref.id} className="p-4 bg-black/20 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-indigo-500/10 transition-colors">
                            {ref.referralType === 'Social Work' ? <UserCheck className="w-5 h-5 text-indigo-400" /> : <MapPin className="w-5 h-5 text-emerald-400" />}
                         </div>
                         <div>
                            <p className="text-sm font-bold text-white">{ref.referralType}</p>
                            <p className="text-[10px] text-gray-500 font-mono">{ref.providerName || 'Pending Selection'} · {ref.caseId}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <Badge variant="outline" className={cn('text-[9px] px-1.5 block mb-1', statusColor[ref.status])}>
                            {ref.status}
                         </Badge>
                         <p className="text-[9px] text-gray-600 line-clamp-1 max-w-[150px]">{ref.notes}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </Card>
           
           <Card className="p-8 border-white/[0.06] bg-surface-dark flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-indigo-500/10 rounded-full mb-4">
                 <TrendingUp className="w-10 h-10 text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Institutional Throughput Analytics</h2>
              <p className="text-sm text-gray-500 max-w-sm mb-8 leading-relaxed">
                Visualizing hospital flow to optimize bed capacity and reduce average length of stay (LOS).
              </p>
              <div className="grid grid-cols-2 gap-4 w-full">
                 <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Discharge Rate</p>
                    <p className="text-sm font-bold text-emerald-400">14.2 / Day</p>
                 </div>
                 <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Delayed Discharges</p>
                    <p className="text-sm font-bold text-rose-400">4 Cases</p>
                 </div>
              </div>
              <Button className="mt-8 bg-indigo-600 hover:bg-indigo-500 w-full h-11 text-sm shadow-lg shadow-indigo-900/40">
                 View Transition Dashboard <BarChart3 className="w-4 h-4 ml-2" />
              </Button>
           </Card>
        </div>
      )}
    </div>
  );
}
