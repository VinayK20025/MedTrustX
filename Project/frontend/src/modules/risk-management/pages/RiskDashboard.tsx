'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { 
  ShieldCheck, List, ClipboardCheck, HeartHandshake, Gavel,
  Search, RefreshCw, AlertCircle, Clock, 
  ArrowRight, Users, ChevronRight, TrendingUp,
  Target, ShieldAlert, BarChart3, Plus,
  FileText, CheckCircle2, DollarSign, Briefcase
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { 
  useRiskDashboard, 
  useUpdateRiskStatus 
} from '../hooks/useRisk';

type Tab = 'register' | 'assessments' | 'mitigation';

const levelColor: Record<string, string> = {
  'Extreme': 'text-rose-600 bg-rose-600/20 border-rose-600/40 font-black animate-pulse',
  'High': 'text-rose-400 bg-rose-500/10 border-rose-500/30 font-bold',
  'Medium': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Low': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Very Low': 'text-emerald-500 bg-emerald-600/10 border-emerald-600/30',
};

const statusColor: Record<string, string> = {
  'Identified': 'text-gray-400 bg-white/5 border-white/10',
  'Assessed': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  'Mitigating': 'text-amber-400 bg-amber-500/10 border-amber-500/30 animate-pulse',
  'Accepted': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  'Residual': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
};

const fmtDate = (iso: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function RiskDashboard() {
  const { data, isLoading, isRefetching, refetch } = useRiskDashboard();
  const updateRisk = useUpdateRiskStatus();

  const [tab, setTab] = useState<Tab>('register');
  const [search, setSearch] = useState('');

  const dbData = data?.data;
  const metrics = dbData?.metrics;

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'register', label: 'Enterprise Register', icon: List },
    { key: 'assessments', label: 'Risk Assessments', icon: ClipboardCheck },
    { key: 'mitigation', label: 'Mitigation Strategies', icon: HeartHandshake },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-emerald-400" /> Enterprise Risk Control
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Institutional Risk Governance · Strategic Mitigation · Legal & Insurance Sync
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} /> Refresh
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/40">
             <Plus className="w-4 h-4 mr-2" /> Add Risk Entry
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Register Entries', value: metrics?.totalRisksInRegister, color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: List },
          { label: 'Extreme Risks', value: metrics?.extremeRisksCount, color: 'text-rose-500', bg: 'bg-rose-600/20', icon: ShieldAlert },
          { label: 'Overdue Actions', value: metrics?.overdueMitigationActions, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Clock },
          { label: 'Risk Reduction', value: `${metrics?.averageRiskReductionPercent}%`, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: Target },
          { label: 'Insurance Adequacy', value: `${metrics?.insuranceCoverageAdequacyPercent}%`, color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: ShieldCheck },
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
          placeholder={`Search ${tab}...`}
          className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-emerald-500/50" 
        />
      </div>

      {/* TAB: Register */}
      {tab === 'register' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {isLoading ? <div className="flex justify-center p-16 col-span-full"><Spinner size="lg" /></div> : 
             dbData?.topRisks.filter(r => r.title.toLowerCase().includes(search.toLowerCase())).map(r => (
               <Card key={r.id} className="p-5 border-white/[0.06] bg-surface-dark flex flex-col group hover:border-emerald-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className={cn('text-[9px] px-1.5', levelColor[r.level])}>
                      {r.level} Risk
                    </Badge>
                    <Badge variant="outline" className={cn('text-[9px] px-1.5', statusColor[r.status])}>
                      {r.status}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-white text-base mb-1 group-hover:text-emerald-400 transition-colors leading-tight">{r.title}</h3>
                  <p className="text-[11px] text-gray-500 mb-4">{r.category} · Owner: {r.owner}</p>
                  
                  <div className="bg-black/20 p-3 rounded-xl border border-white/5 mb-4 grid grid-cols-2 gap-4">
                     <div>
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Inherent Score</p>
                        <p className="text-sm font-bold text-rose-400 font-mono">{r.inherentScore}</p>
                     </div>
                     <div>
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Residual Score</p>
                        <p className="text-sm font-bold text-emerald-400 font-mono">{r.residualScore}</p>
                     </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                     <span className="text-[10px] text-gray-600 font-mono">{r.id}</span>
                     <Button size="sm" variant="ghost" className="h-7 text-[11px] text-emerald-400 hover:bg-emerald-500/10">
                        Risk Profile <ArrowRight className="w-3 h-3 ml-2" />
                     </Button>
                  </div>
               </Card>
             ))
           }
        </div>
      )}

      {/* TAB: Assessments */}
      {tab === 'assessments' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['Risk ID / Case', 'Category', 'Level', 'Status', 'Risk Heatmap', 'Actions'].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dbData?.topRisks.map(r => (
                    <tr key={r.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6">
                         <p className="font-bold text-white text-sm">{r.title}</p>
                         <p className="text-[10px] text-gray-600">{r.id}</p>
                      </td>
                      <td className="py-4 px-4 text-xs text-white">
                         {r.category}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[9px] px-1.5', levelColor[r.level])}>
                          {r.level}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[9px] px-1.5', statusColor[r.status])}>
                          {r.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                         <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(v => (
                              <div key={v} className={cn('w-4 h-2 rounded-full', v <= (r.inherentScore / 5) ? 'bg-rose-500/50' : 'bg-white/5')} />
                            ))}
                         </div>
                      </td>
                      <td className="py-4 px-4">
                         <Button size="sm" variant="ghost" className="h-7 text-[10px] text-emerald-400 hover:bg-emerald-500/10">
                           Re-Assess <RefreshCw className="w-3 h-3 ml-1.5" />
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

      {/* TAB: Mitigation */}
      {tab === 'mitigation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Card className="p-6 border-white/[0.06] bg-surface-dark flex flex-col">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-emerald-400" /> Mitigation Action Plans
              </h3>
              <div className="space-y-4">
                 {dbData?.mitigationOverview.map(plan => (
                   <div key={plan.id} className="p-4 bg-black/20 rounded-2xl border border-white/5 space-y-4">
                      <div className="flex justify-between items-center">
                         <div>
                            <p className="text-sm font-bold text-white">Plan {plan.id}</p>
                            <p className="text-[10px] text-gray-500 font-mono text-emerald-400">Strategy: {plan.strategy}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-xs font-bold text-white">${plan.budgetAllocated.toLocaleString()}</p>
                            <p className="text-[9px] text-gray-600 uppercase">Budget Allocated</p>
                         </div>
                      </div>
                      <div className="space-y-2">
                         {plan.actions.map((action, i) => (
                           <div key={i} className="flex justify-between items-center p-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                              <div className="flex items-center gap-2">
                                 {action.status === 'Completed' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Clock className="w-3.5 h-3.5 text-amber-500" />}
                                 <p className="text-[11px] text-white">{action.description}</p>
                              </div>
                              <p className="text-[9px] text-gray-600 font-mono">{fmtDate(action.dueDate)}</p>
                           </div>
                         ))}
                      </div>
                   </div>
                 ))}
              </div>
              <Button className="mt-6 w-full bg-emerald-600 hover:bg-emerald-500 h-11 text-sm shadow-lg shadow-emerald-900/40">
                 Mitigation Board <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
           </Card>
           
           <Card className="p-8 border-white/[0.06] bg-surface-dark flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-emerald-500/10 rounded-full mb-4">
                 <Gavel className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Legal & Insurance Governance</h2>
              <p className="text-sm text-gray-500 max-w-sm mb-8 leading-relaxed">
                Visualizing institutional liability coverage, insurance premium efficiency, and active legal risk exposures.
              </p>
              <div className="grid grid-cols-2 gap-4 w-full mb-8">
                 <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Active Litigation</p>
                    <p className="text-sm font-bold text-rose-400">4 Cases</p>
                 </div>
                 <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Premium Efficiency</p>
                    <p className="text-sm font-bold text-emerald-400">+12.4%</p>
                 </div>
              </div>
              <div className="flex gap-4 w-full">
                 <Button variant="outline" className="flex-1 border-white/10 text-gray-400">Policy Registry</Button>
                 <Button className="flex-1 bg-indigo-600 hover:bg-indigo-500">Legal Audit</Button>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
}
