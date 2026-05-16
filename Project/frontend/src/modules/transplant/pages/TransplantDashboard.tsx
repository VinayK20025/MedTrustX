'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { 
  Activity, ClipboardList, HeartPulse, GitMerge, Truck,
  Search, RefreshCw, AlertCircle, Clock, 
  ArrowRight, Users, ChevronRight, TrendingUp,
  Droplets, Zap, ShieldCheck, Calendar,
  MoreHorizontal, Filter, Plus, ExternalLink,
  Target, Info, MapPin, Scale
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { 
  useTransplantDashboard, 
  useProposeMatch 
} from '../hooks/useTransplant';

type Tab = 'waitlist' | 'matching' | 'logistics';

const statusColor: Record<string, string> = {
  'Waitlisted': 'text-gray-400 bg-white/5 border-white/10',
  'Matching': 'text-amber-400 bg-amber-500/10 border-amber-500/30 animate-pulse',
  'Scheduled': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30 font-bold',
  'Procurement': 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  'Post-Transplant': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  'Completed': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Confirmed': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Proposed': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Available': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Reserved': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
};

const organIcon = (type: string) => {
  switch (type) {
    case 'Heart': return <HeartPulse className="w-4 h-4 text-rose-400" />;
    case 'Kidney': return <Droplets className="w-4 h-4 text-indigo-400" />;
    case 'Liver': return <Activity className="w-4 h-4 text-amber-400" />;
    default: return <Activity className="w-4 h-4 text-gray-400" />;
  }
};

const fmtDate = (iso: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export function TransplantDashboard() {
  const { data, isLoading, isRefetching, refetch } = useTransplantDashboard();
  const propose = useProposeMatch();

  const [tab, setTab] = useState<Tab>('waitlist');
  const [search, setSearch] = useState('');

  const dbData = data?.data;
  const metrics = dbData?.metrics;

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'waitlist', label: 'Waiting List', icon: ClipboardList },
    { key: 'matching', label: 'Donor Matching', icon: GitMerge },
    { key: 'logistics', label: 'Organ Logistics', icon: Truck },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Activity className="w-7 h-7 text-indigo-400" /> Transplant Command Hub
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Regional Waitlist Management · HLA Matching · Institutional Organ Procurement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} /> Refresh
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-900/40">
             <Plus className="w-4 h-4 mr-2" /> Add Recipient
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Waitlist Volume', value: metrics?.totalWaitlisted, color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: ClipboardList },
          { label: 'Active Matches', value: metrics?.activeMatches, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Target },
          { label: 'Completed YTD', value: metrics?.completedTransplantsYTD, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
          { label: 'Avg Wait (Days)', value: metrics?.averageWaitTimeDays, color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: Clock },
          { label: 'Survival Rate', value: `${metrics?.organSurvivalRatePercent}%`, color: 'text-rose-400', bg: 'bg-rose-500/10', icon: HeartPulse },
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

      {/* TAB: Waitlist */}
      {tab === 'waitlist' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['Recipient / ID', 'Organ Needed', 'Blood / HLA', 'Priority', 'Wait Time', 'Status', 'Actions'].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dbData?.topWaitlist.filter(r => r.name.toLowerCase().includes(search.toLowerCase())).map(r => (
                    <tr key={r.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6">
                         <p className="font-bold text-white text-sm">{r.name}</p>
                         <p className="text-[10px] text-gray-600">{r.id} · {r.patientId}</p>
                      </td>
                      <td className="py-4 px-4 text-xs text-white">
                         <div className="flex items-center gap-2">
                            {organIcon(r.organNeeded)}
                            {r.organNeeded}
                         </div>
                      </td>
                      <td className="py-4 px-4">
                         <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-white">{r.bloodType}</span>
                            <span className="text-[9px] text-gray-500 font-mono">{r.hlaTyping}</span>
                         </div>
                      </td>
                      <td className="py-4 px-4">
                         <Badge variant="outline" className={cn('text-[9px] px-1.5', r.priority === 'Critical' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30')}>
                           {r.priority}
                         </Badge>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-400 font-mono">
                         {Math.floor((Date.now() - new Date(r.waitlistEntryDate).getTime()) / 86400000)} Days
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[9px] px-1.5', statusColor[r.status])}>
                          {r.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-right pr-6">
                         <Button size="sm" variant="ghost" className="h-7 text-[10px] text-indigo-400 hover:bg-indigo-500/10">
                            Matching Dossier <ChevronRight className="w-3 h-3 ml-1.5" />
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

      {/* TAB: Matching */}
      {tab === 'matching' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <Card className="lg:col-span-2 border-white/[0.06] bg-surface-dark flex flex-col">
              <div className="p-6 bg-black/40 border-b border-white/[0.04] flex justify-between items-center">
                 <h3 className="text-lg font-bold text-white flex items-center gap-2">
                   <GitMerge className="w-5 h-5 text-indigo-400" /> Active Matching Queue
                 </h3>
                 <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-400">
                    {dbData?.recentMatches.length} Matches Found
                 </Badge>
              </div>
              <div className="p-0 overflow-x-auto">
                 <table className="w-full text-sm">
                    <thead className="bg-white/[0.02] border-b border-white/[0.04]">
                       <tr>
                          {['Recipient', 'DonorSource', 'Compatibility', 'MatchScore', 'Status'].map((h, i) => (
                             <th key={i} className="py-3 px-4 text-left text-gray-500 uppercase text-[9px] tracking-widest">{h}</th>
                          ))}
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                       {dbData?.recentMatches.map(m => (
                         <tr key={m.id} className="hover:bg-white/[0.01] transition-colors group">
                            <td className="py-4 px-4">
                               <p className="text-sm font-bold text-white">REC-001</p>
                               <p className="text-[10px] text-gray-500">James Wilson</p>
                            </td>
                            <td className="py-4 px-4">
                               <p className="text-sm font-bold text-white">DON-991</p>
                               <p className="text-[10px] text-gray-500">Deceased Donor</p>
                            </td>
                            <td className="py-4 px-4">
                               <p className="text-[11px] text-gray-400 max-w-[150px] leading-tight">{m.compatibilityDetails}</p>
                            </td>
                            <td className="py-4 px-4">
                               <div className="flex items-center gap-2">
                                  <div className="flex-1 h-1 w-12 bg-white/5 rounded-full overflow-hidden">
                                     <div className="h-full bg-emerald-500" style={{ width: `${m.matchScore}%` }} />
                                  </div>
                                  <span className="text-[10px] font-bold text-emerald-400">{m.matchScore}%</span>
                               </div>
                            </td>
                            <td className="py-4 px-4">
                               <Badge className={cn('text-[9px]', statusColor[m.status])}>{m.status}</Badge>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
              <Button className="m-6 bg-indigo-600 hover:bg-indigo-500 h-11 shadow-lg shadow-indigo-900/40">
                 Run AI Matching Algorithm <Zap className="w-4 h-4 ml-2" />
              </Button>
           </Card>

           <Card className="p-6 border-white/[0.06] bg-surface-dark flex flex-col">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-rose-400" /> Available Organs
              </h3>
              <div className="space-y-4">
                 {dbData?.availableOrgans.map(donor => (
                   <div key={donor.id} className="p-4 bg-black/20 rounded-2xl border border-white/5 space-y-4 group hover:border-indigo-500/30 transition-colors">
                      <div className="flex justify-between items-start">
                         <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-[9px] bg-white/5 text-gray-400 border-white/10 font-mono">{donor.id}</Badge>
                            <Badge className={cn('text-[9px]', statusColor[donor.status])}>{donor.status}</Badge>
                         </div>
                         <MapPin className="w-3.5 h-3.5 text-gray-600" />
                      </div>
                      <div>
                         <p className="text-sm font-bold text-white flex items-center gap-2">
                            {organIcon(donor.organType)} {donor.organType}
                         </p>
                         <p className="text-[10px] text-gray-500 mt-0.5">Type: {donor.type} · Blood: {donor.bloodType}</p>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                         <p className="text-[10px] text-gray-600 italic">Loc: {donor.location}</p>
                         <Button size="sm" variant="ghost" className="h-7 text-[10px] text-indigo-400 hover:bg-indigo-500/10">
                            Propose <ArrowRight className="w-3 h-3 ml-1.5" />
                         </Button>
                      </div>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      )}

      {/* TAB: Logistics */}
      {tab === 'logistics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Card className="p-8 border-white/[0.06] bg-surface-dark flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-indigo-500/10 rounded-full mb-4">
                 <Truck className="w-10 h-10 text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Organ Transport & Logistics</h2>
              <p className="text-sm text-gray-500 max-w-sm mb-8 leading-relaxed">
                Real-time tracking of institutional organ procurement teams, transport telemetry, and surgical theater readiness.
              </p>
              <div className="grid grid-cols-2 gap-4 w-full mb-8 max-w-lg">
                 <div className="p-4 bg-black/20 rounded-2xl border border-white/5 text-left">
                    <p className="text-[10px] text-gray-500 uppercase mb-1 font-bold">Transit Time</p>
                    <p className="text-sm font-bold text-indigo-400">01:42:00</p>
                    <p className="text-[9px] text-gray-600">Heart #DON-995</p>
                 </div>
                 <div className="p-4 bg-black/20 rounded-2xl border border-white/5 text-left">
                    <p className="text-[10px] text-gray-500 uppercase mb-1 font-bold">Procurement Team</p>
                    <p className="text-sm font-bold text-emerald-400">On-Site</p>
                    <p className="text-[9px] text-gray-600">Bay State General</p>
                 </div>
              </div>
              <Button className="w-full max-w-lg bg-indigo-600 hover:bg-indigo-500 h-11 text-sm shadow-lg shadow-indigo-900/30">
                 Open Logistics Tracker <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
           </Card>

           <Card className="p-6 border-white/[0.06] bg-surface-dark flex flex-col">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Regulatory & Ethical Compliance
              </h3>
              <div className="space-y-4">
                 {[
                   { label: 'Organ Procurement Agreement', status: 'Verified', body: 'Regional Transplant Board' },
                   { label: 'Ethical Committee Approval', status: 'Finalized', body: 'Institutional Ethics Board' },
                   { label: 'Waitlist Priority Audit', status: 'Compliant', body: 'Internal Governance' },
                 ].map((c, i) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-4">
                         <div className="p-2 rounded-lg bg-white/5">
                            <Scale className="w-4 h-4 text-gray-500" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-white">{c.label}</p>
                            <p className="text-[10px] text-gray-500 italic">{c.body}</p>
                         </div>
                      </div>
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[9px]">
                         {c.status}
                      </Badge>
                   </div>
                 ))}
              </div>
              <Button variant="outline" className="mt-8 w-full border-white/10 text-gray-400 h-11">
                 View Compliance Dashboard <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
           </Card>
        </div>
      )}
    </div>
  );
}
