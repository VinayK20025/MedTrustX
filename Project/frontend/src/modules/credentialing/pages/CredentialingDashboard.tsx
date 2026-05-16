'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { 
  FileSignature, Users, ShieldCheck, FileSearch, RotateCw,
  Search, RefreshCw, CheckCircle, AlertTriangle, Clock,
  Calendar, Shield, ShieldAlert, UserCheck, BadgeCheck,
  FileText, ExternalLink, ArrowRight
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { 
  useCredentialingDashboard, 
  useVerifyCredential 
} from '../hooks/useCredentialing';

type Tab = 'staff' | 'renewals' | 'verification';

const statusColor: Record<string, string> = {
  'Active': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Credentialed': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Provisional': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Pending': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Expired': 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  'Suspended': 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  'Lapsed': 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  'In Review': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30 animate-pulse',
};

const fmtDate = (iso: string) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export function CredentialingDashboard() {
  const { data, isLoading, isRefetching, refetch } = useCredentialingDashboard();
  const verify = useVerifyCredential();

  const [tab, setTab] = useState<Tab>('staff');
  const [search, setSearch] = useState('');

  const dbData = data?.data;
  const metrics = dbData?.metrics;

  const handleVerify = (id: string) => {
    verify.mutate(id);
  };

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'staff', label: 'Medical Staff Roster', icon: Users },
    { key: 'renewals', label: 'Upcoming Renewals', icon: RotateCw },
    { key: 'verification', label: 'Primary Source Verification', icon: FileSearch },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FileSignature className="w-7 h-7 text-indigo-400" /> Medical Staff Credentialing
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Primary Source Verification · Privileging · Compliance Monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} /> Refresh
          </Button>
          <Button variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
             New Application
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Credentialed Staff', value: metrics?.totalCredentialedStaff, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: BadgeCheck },
          { label: 'Pending Apps', value: metrics?.pendingApplications, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Clock },
          { label: 'Critical Renewals', value: metrics?.expiringWithin30Days, color: 'text-rose-400', bg: 'bg-rose-500/10', icon: ShieldAlert },
          { label: 'PSV Success', value: `${metrics?.verificationSuccessRate}%`, color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: UserCheck },
          { label: 'Avg Process Days', value: metrics?.averageProcessingDays, color: 'text-indigo-300', bg: 'bg-indigo-500/10', icon: Calendar },
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

      {/* TAB: Staff */}
      {tab === 'staff' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['Staff Member', 'Specialty & NPI', 'Credential Status', 'Next Review', 'Privileges', ''].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : i === 5 ? 'pr-6 text-right' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dbData?.recentStaff.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map(s => (
                    <tr key={s.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6">
                         <p className="font-bold text-white text-sm">{s.name}</p>
                         <p className="text-[10px] text-gray-500 font-mono">ID: {s.id}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-xs text-white">{s.specialty}</p>
                        <p className="text-[10px] text-gray-500 font-mono">NPI: {s.npi}</p>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[10px] px-2', statusColor[s.status])}>
                          {s.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-400 font-mono">{fmtDate(s.recredentialingDate)}</td>
                      <td className="py-4 px-4">
                         <div className="flex flex-wrap gap-1">
                           {s.privileges.slice(0, 2).map(p => (
                             <span key={p} className="text-[9px] text-gray-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">{p}</span>
                           ))}
                           {s.privileges.length > 2 && <span className="text-[9px] text-gray-600">+{s.privileges.length-2}</span>}
                         </div>
                      </td>
                      <td className="py-4 pr-6 text-right">
                        <Button size="sm" variant="ghost" className="h-7 text-[11px] text-indigo-400 hover:bg-white/5">
                          Open Profile <ExternalLink className="w-3 h-3 ml-1.5" />
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

      {/* TAB: Renewals */}
      {tab === 'renewals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? <div className="flex justify-center p-16 col-span-full"><Spinner size="lg" /></div> : 
            dbData?.expiringCredentials.filter(c => c.staffName.toLowerCase().includes(search.toLowerCase())).map((c, i) => (
              <Card key={i} className="p-5 border-white/[0.06] bg-surface-dark flex flex-col border-l-4 border-l-rose-500/50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white text-base">{c.staffName}</h3>
                  <Badge variant="outline" className="text-[10px] bg-rose-500/10 border-rose-500/30 text-rose-400">
                    Expiring Soon
                  </Badge>
                </div>
                <p className="text-sm text-indigo-300 font-medium mb-4">{c.type}</p>
                <div className="flex items-center justify-between text-xs mt-auto">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="font-mono">{fmtDate(c.expiryDate)}</span>
                  </div>
                  <Button size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-500 text-xs">
                    Notify Staff
                  </Button>
                </div>
              </Card>
            ))
          }
        </div>
      )}

      {/* TAB: Verification */}
      {tab === 'verification' && (
        <Card className="p-8 border-white/[0.06] bg-surface-dark flex flex-col items-center text-center">
           <div className="p-4 bg-indigo-500/10 rounded-full mb-4">
             <FileSearch className="w-10 h-10 text-indigo-400" />
           </div>
           <h2 className="text-xl font-bold text-white mb-2">Primary Source Verification (PSV)</h2>
           <p className="text-gray-400 max-w-lg mb-8 text-sm">
             Initiate direct verification requests with issuing boards, NPDB, and licensing authorities. All requests are logged for regulatory compliance.
           </p>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
             <Button variant="outline" className="h-12 border-white/10 hover:bg-white/5 text-gray-300">
               Batch NPDB Query
             </Button>
             <Button variant="outline" className="h-12 border-white/10 hover:bg-white/5 text-gray-300">
               License Verification Link
             </Button>
           </div>
        </Card>
      )}
    </div>
  );
}
