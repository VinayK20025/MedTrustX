'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { 
  ShieldCheck, FileCheck, CreditCard, History, PieChart,
  Search, RefreshCw, AlertCircle, Clock, 
  ArrowRight, Users, ChevronRight, TrendingUp, TrendingDown,
  DollarSign, Activity, Building2, Wallet,
  CheckCircle2, XCircle, FileText, ArrowUpRight,
  Filter, Plus, Zap, ShieldAlert, Scale,
  BarChart3, Globe, Landmark, FileWarning
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { 
  useInsuranceDashboard, 
  useVerifyEligibility 
} from '../hooks/useInsurance';

type Tab = 'claims' | 'eligibility' | 'payers' | 'denials';

const statusColor: Record<string, string> = {
  'Paid': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Reconciled': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  'Submitted': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  'Processing': 'text-amber-400 bg-amber-500/10 border-amber-500/30 animate-pulse',
  'Denied': 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  'Appealed': 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  'Pending': 'text-gray-400 bg-white/5 border-white/10',
  'Approved': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Rejected': 'text-rose-500 bg-rose-600/10 border-rose-600/30',
};

const fmtDate = (iso: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function InsuranceDashboard() {
  const { data, isLoading, isRefetching, refetch } = useInsuranceDashboard();
  const verify = useVerifyEligibility();

  const [tab, setTab] = useState<Tab>('claims');
  const [search, setSearch] = useState('');

  const dbData = data?.data;
  const metrics = dbData?.metrics;

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'claims', label: 'Claims Engine', icon: FileCheck },
    { key: 'eligibility', label: 'Eligibility Hub', icon: CreditCard },
    { key: 'denials', label: 'Denial Management', icon: Scale },
    { key: 'payers', label: 'Payer & TPA Sync', icon: PieChart },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-emerald-400" /> Revenue Cycle Command
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Institutional Payer & TPA Orchestration · Claims Lifecycle · Denials Governance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} /> Refresh
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/40">
             <Plus className="w-4 h-4 mr-2" /> Submit Claim
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Unbilled Receivables', value: `$${(metrics?.totalClaimsValue || 0).toLocaleString()}`, color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: Wallet },
          { label: 'Clean Claim Rate', value: `${metrics?.cleanClaimRatePercent}%`, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: Zap },
          { label: 'Reimbursed YTD', value: `$${(metrics?.totalReimbursedValue || 0).toLocaleString()}`, color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: DollarSign },
          { label: 'Denial Rate', value: `${metrics?.denialRatePercent}%`, color: 'text-rose-500', bg: 'bg-rose-600/20', icon: XCircle },
          { label: 'Pending Appeals', value: metrics?.pendingAppealsCount, color: 'text-orange-400', bg: 'bg-orange-500/10', icon: Scale },
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

      {/* TAB: Claims */}
      {tab === 'claims' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['Claim ID / Patient', 'Payer', 'Service Date', 'Remittance', 'Amount', 'Status', 'Actions'].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dbData?.recentClaims.filter(c => c.patientName.toLowerCase().includes(search.toLowerCase())).map(c => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6">
                         <p className="font-bold text-white text-sm">{c.patientName}</p>
                         <p className="text-[10px] text-gray-600">{c.id} · {c.patientId}</p>
                      </td>
                      <td className="py-4 px-4 text-xs text-white">
                         <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                            {c.payerName}
                         </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-400 font-mono">
                         {fmtDate(c.serviceDate)}
                      </td>
                      <td className="py-4 px-4">
                         {c.remittanceRef ? (
                            <div className="flex flex-col">
                               <p className="text-[10px] text-emerald-400 font-bold">${c.reimbursementAmount?.toLocaleString()}</p>
                               <p className="text-[8px] text-gray-500 font-mono">Ref: {c.remittanceRef}</p>
                            </div>
                         ) : <span className="text-gray-600">—</span>}
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-xs font-bold text-white font-mono">${c.amount.toLocaleString()}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                           <Badge variant="outline" className={cn('text-[9px] px-1.5 w-fit', statusColor[c.status])}>
                             {c.status}
                           </Badge>
                           {c.denialReason && <p className="text-[9px] text-rose-500 font-medium italic">{c.denialReason}</p>}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                         <Button size="sm" variant="ghost" className="h-7 text-[10px] text-emerald-400 hover:bg-emerald-500/10">
                           {c.status === 'Denied' ? 'Appeal' : 'Dossier'} <ArrowRight className="w-3 h-3 ml-1.5" />
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

      {/* TAB: Denials */}
      {tab === 'denials' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <Card className="lg:col-span-1 p-6 border-white/[0.06] bg-surface-dark flex flex-col">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <FileWarning className="w-5 h-5 text-rose-400" /> Denial Analytics
              </h3>
              <div className="space-y-6 flex-1">
                 {dbData?.denialAnalytics.map((da, i) => (
                   <div key={i} className="space-y-2 p-4 bg-black/20 rounded-2xl border border-white/5">
                      <div className="flex justify-between items-start">
                         <div>
                            <p className="text-xs font-bold text-white">{da.category}</p>
                            <p className="text-[10px] text-gray-500">{da.count} Claims Rejected</p>
                         </div>
                         {da.trend === 'up' ? <TrendingUp className="w-4 h-4 text-rose-500" /> : <TrendingDown className="w-4 h-4 text-emerald-500" />}
                      </div>
                      <div className="flex justify-between items-center pt-2">
                         <p className="text-sm font-bold text-rose-400 font-mono">${da.value.toLocaleString()}</p>
                         <p className="text-[9px] text-gray-600 uppercase font-bold">Total Exposure</p>
                      </div>
                   </div>
                 ))}
              </div>
              <Button className="mt-6 w-full bg-rose-600 hover:bg-rose-500 h-11 text-sm shadow-lg shadow-rose-900/40">
                 Finalize Appeals Board <Scale className="w-4 h-4 ml-2" />
              </Button>
           </Card>

           <Card className="lg:col-span-2 border-white/[0.06] bg-surface-dark overflow-hidden flex flex-col">
              <div className="p-6 bg-black/40 border-b border-white/[0.04] flex justify-between items-center">
                 <h3 className="text-lg font-bold text-white flex items-center gap-2">
                   <AlertCircle className="w-5 h-5 text-amber-400" /> Pending Remediation Queue
                 </h3>
                 <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400">
                    {dbData?.recentClaims.filter(c => c.status === 'Denied').length} Critical Denials
                 </Badge>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[500px]">
                 {dbData?.recentClaims.filter(c => c.status === 'Denied' || c.status === 'Appealed').map(c => (
                   <div key={c.id} className="p-4 border-b border-white/[0.02] flex items-center justify-between group hover:bg-white/[0.01]">
                      <div className="flex items-center gap-4">
                         <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
                            <ShieldAlert className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-white">{c.patientName}</p>
                            <p className="text-[10px] text-gray-500">{c.denialCategory} · Denied: {fmtDate(c.serviceDate)}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="text-right mr-4">
                            <p className="text-xs font-bold text-white">${c.amount.toLocaleString()}</p>
                            <p className="text-[9px] text-gray-600 uppercase">Exposure</p>
                         </div>
                         <Button size="sm" variant="outline" className="border-white/10 text-gray-400 hover:bg-white/5">
                            Resolve
                         </Button>
                      </div>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      )}

      {/* TAB: Eligibility */}
      {tab === 'eligibility' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Card className="p-6 border-white/[0.06] bg-surface-dark flex flex-col">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" /> Real-time Payer Verification
              </h3>
              <div className="space-y-4 mb-8">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] text-gray-500 uppercase font-semibold">Patient ID</label>
                       <Input placeholder="e.g. PAT-442" className="bg-black/20 border-white/10 text-white h-11" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] text-gray-500 uppercase font-semibold">Payer Gateway</label>
                       <Input placeholder="Select Payer..." className="bg-black/20 border-white/10 text-white h-11" />
                    </div>
                 </div>
                 <Button className="w-full bg-emerald-600 hover:bg-emerald-500 h-11 text-sm shadow-lg shadow-emerald-900/40">
                    Verify Global Eligibility <Zap className="w-4 h-4 ml-2" />
                 </Button>
              </div>
              
              <div className="border-t border-white/[0.04] pt-6 space-y-4">
                 <h4 className="text-[11px] text-gray-500 uppercase font-bold tracking-widest">Active Prior Auth Pool</h4>
                 <div className="space-y-3">
                   {dbData?.pendingAuthorizations.map(auth => (
                      <div key={auth.id} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
                         <div>
                            <p className="text-sm font-bold text-white">{auth.procedureCode}</p>
                            <p className="text-[10px] text-gray-500">Patient: {auth.patientId} · Payer: {auth.payerId}</p>
                         </div>
                         <Badge variant="outline" className={cn('text-[9px]', statusColor[auth.status])}>{auth.status}</Badge>
                      </div>
                   ))}
                 </div>
              </div>
           </Card>

           <Card className="p-8 border-white/[0.06] bg-surface-dark flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-indigo-500/10 rounded-full mb-4">
                 <Globe className="w-10 h-10 text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Institutional Payer Integration</h2>
              <p className="text-sm text-gray-500 max-w-sm mb-8 leading-relaxed">
                Bi-directional sync with private payers, government schemes (National Health), and Third Party Administrators (TPA).
              </p>
              <div className="grid grid-cols-2 gap-4 w-full mb-8">
                 <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Payer APIs Connected</p>
                    <p className="text-sm font-bold text-emerald-400">42 / 45</p>
                 </div>
                 <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Avg Verification</p>
                    <p className="text-sm font-bold text-indigo-400">1.2 Seconds</p>
                 </div>
              </div>
              <div className="flex gap-4 w-full">
                 <Button variant="outline" className="flex-1 border-white/10 text-gray-400">Connectivity Audit</Button>
                 <Button className="flex-1 bg-indigo-600 hover:bg-indigo-500">Payer Setup</Button>
              </div>
           </Card>
        </div>
      )}

      {/* TAB: Payers */}
      {tab === 'payers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {dbData?.topPayers.map(payer => (
             <Card key={payer.id} className="p-6 border-white/[0.06] bg-surface-dark flex flex-col group hover:border-emerald-500/30 transition-colors">
                <div className="flex justify-between items-start mb-6">
                   <div className="p-3 rounded-2xl bg-emerald-500/10">
                      {payer.type === 'Government Scheme' ? <Landmark className="w-6 h-6 text-emerald-400" /> : <Building2 className="w-6 h-6 text-emerald-400" />}
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] text-gray-600 uppercase font-bold tracking-tighter">Contract ID</p>
                      <p className="text-[10px] text-white font-mono">{payer.activeContractId}</p>
                   </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-1 leading-tight">{payer.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{payer.type} Network</p>
                {payer.tpaAssociated && (
                   <p className="text-[9px] text-indigo-400 font-bold uppercase mb-8 flex items-center gap-1">
                      <Globe className="w-2.5 h-2.5" /> TPA: {payer.tpaAssociated}
                   </p>
                )}
                
                <div className="space-y-6 flex-1">
                   <div>
                      <div className="flex justify-between text-[10px] text-gray-500 uppercase font-bold mb-2">
                         <span>Claim Approval Rate</span>
                         <span className="text-emerald-400">{payer.claimSuccessRatePercent}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-500 transition-all" style={{ width: `${payer.claimSuccessRatePercent}%` }} />
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/[0.04]">
                      <div>
                         <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Avg Turnaround</p>
                         <p className="text-sm font-bold text-white">{payer.averageReimbursementDays} Days</p>
                      </div>
                      <div>
                         <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Clean Rate</p>
                         <p className="text-sm font-bold text-indigo-400">98.1%</p>
                      </div>
                   </div>
                </div>
                
                <Button className="mt-8 w-full bg-black/40 border border-white/10 hover:bg-white/5 h-11 text-xs">
                   Payer Performance Dossier <ArrowUpRight className="w-3.5 h-3.5 ml-2" />
                </Button>
             </Card>
           ))}
        </div>
      )}
    </div>
  );
}
