'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { 
  Scale, MessageSquare, Heart, Users, ShieldCheck,
  Search, RefreshCw, AlertCircle, Clock, Calendar,
  UserCheck, ShieldAlert, FileText, Info, ArrowRight,
  ClipboardList, Handshake, Gavel
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { 
  useEthicsDashboard, 
  useSubmitConsultation 
} from '../hooks/useEthics';

type Tab = 'consultations' | 'committee' | 'coi';

const statusColor: Record<string, string> = {
  'New': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Active': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30 animate-pulse',
  'Deliberating': 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30',
  'Resolved': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
};

const priorityColor: Record<string, string> = {
  'Urgent': 'text-rose-400 bg-rose-500/10 border-rose-500/30 font-bold',
  'Routine': 'text-gray-400 bg-white/5 border-white/10',
};

const fmtDate = (iso: string) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export function EthicsDashboard() {
  const { data, isLoading, isRefetching, refetch } = useEthicsDashboard();
  const submit = useSubmitConsultation();

  const [tab, setTab] = useState<Tab>('consultations');
  const [search, setSearch] = useState('');

  const dbData = data?.data;
  const metrics = dbData?.metrics;

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'consultations', label: 'Clinical Consultations', icon: MessageSquare },
    { key: 'committee', label: 'Committee & Meetings', icon: Users },
    { key: 'coi', label: 'Conflict of Interest', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Scale className="w-7 h-7 text-indigo-400" /> Bioethics & Governance
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Clinical Consultation · Ethical Policy Management · Professional Integrity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} /> Refresh
          </Button>
          <Button variant="outline" className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
             Request Consultation
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active Consultations', value: metrics?.activeConsultations, color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: MessageSquare },
          { label: 'Avg Response (hrs)', value: metrics?.averageResponseTimeHours, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: Clock },
          { label: 'Committee Attendance', value: `${metrics?.committeeMeetingAttendancePercent}%`, color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: Users },
          { label: 'COI Compliance', value: `${metrics?.coiComplianceRatePercent}%`, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: ShieldCheck },
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

      {/* TAB: Consultations */}
      {tab === 'consultations' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['Case ID', 'Patient', 'Requestor & Dept', 'Reason', 'Priority', 'Status'].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dbData?.consultations.filter(c => c.patientName.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase())).map(c => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6 font-mono text-indigo-400 text-xs">{c.id}</td>
                      <td className="py-4 px-4 font-bold text-white text-sm">{c.patientName}</td>
                      <td className="py-4 px-4">
                        <p className="text-xs text-white">{c.requestor}</p>
                        <p className="text-[10px] text-gray-500">{c.department}</p>
                      </td>
                      <td className="py-4 px-4 max-w-xs">
                        <p className="text-xs text-gray-400 line-clamp-2">{c.reason}</p>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[9px]', priorityColor[c.priority])}>
                          {c.priority}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[9px] px-1.5', statusColor[c.status])}>
                          {c.status}
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

      {/* TAB: Committee */}
      {tab === 'committee' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {isLoading ? <div className="flex justify-center p-16 col-span-full"><Spinner size="lg" /></div> : (
             <>
               <Card className="p-6 border-white/[0.06] bg-surface-dark flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-400" /> Upcoming Meetings
                  </h3>
                  <div className="space-y-4">
                    {dbData?.upcomingMeetings.map((m, i) => (
                      <div key={i} className="p-4 bg-black/20 rounded-xl border border-white/5 group hover:border-indigo-500/30 transition-colors">
                        <p className="text-xs font-bold text-indigo-300 mb-1">{fmtDate(m.date)}</p>
                        <p className="text-sm font-bold text-white mb-1">{m.agenda}</p>
                        <p className="text-[10px] text-gray-500">{m.location}</p>
                      </div>
                    ))}
                  </div>
               </Card>
               <Card className="p-6 border-white/[0.06] bg-surface-dark flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Handshake className="w-5 h-5 text-emerald-400" /> Ethical Policies
                  </h3>
                  <div className="space-y-3">
                    {['DNR / Life-Sustaining Treatment', 'Organ Donation Protocol', 'Patient Privacy & AI', 'Informed Consent (Vulnerable Populations)'].map((p, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border-b border-white/[0.04] last:border-0 group">
                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{p}</span>
                        <Button size="sm" variant="ghost" className="h-7 text-[10px] text-indigo-400 hover:text-indigo-300">
                          View Policy <ArrowRight className="w-3 h-3 ml-1.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
               </Card>
             </>
           )}
        </div>
      )}

      {/* TAB: COI */}
      {tab === 'coi' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          <div className="p-8 flex flex-col items-center text-center">
             <div className="p-4 bg-indigo-500/10 rounded-full mb-4">
               <ShieldCheck className="w-10 h-10 text-indigo-400" />
             </div>
             <h2 className="text-xl font-bold text-white mb-2">Conflict of Interest Registry</h2>
             <p className="text-gray-400 max-w-md mb-8 text-sm">
               Transparent tracking of financial and professional disclosures for all medical and administrative staff.
             </p>
             
             {dbData?.coiAlerts.map((a, i) => (
               <div key={i} className="w-full max-w-xl p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl flex items-center gap-4 text-left mb-4">
                 <ShieldAlert className="w-6 h-6 text-rose-400 flex-shrink-0" />
                 <div>
                   <p className="text-sm font-bold text-white">Action Required: {a.staffName}</p>
                   <p className="text-xs text-gray-400">{a.issue}</p>
                 </div>
               </div>
             ))}
             
             <Button className="bg-indigo-600 hover:bg-indigo-500 mt-4 px-8">
               Submit New Disclosure
             </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
