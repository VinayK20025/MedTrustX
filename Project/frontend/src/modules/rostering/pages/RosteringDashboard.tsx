'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { 
  Calendar, Clock, Users, PlaneTakeoff, BarChart3,
  Search, RefreshCw, Filter, Plus, UserPlus, 
  ChevronRight, MoreHorizontal, AlertCircle, TrendingUp,
  MapPin, Phone, Mail, FileText, CheckCircle2, ArrowRight
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { 
  useRosteringDashboard, 
  useUpdateShift 
} from '../hooks/useRostering';

type Tab = 'shifts' | 'leave' | 'analytics';

const shiftColor: Record<string, string> = {
  'Morning': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Evening': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  'Night': 'text-rose-400 bg-rose-500/10 border-rose-500/30 font-bold',
  'On-Call': 'text-rose-500 bg-rose-600/20 border-rose-600/40 font-black animate-pulse',
  'General': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
};

const leaveStatusColor: Record<string, string> = {
  'Pending': 'text-amber-400 bg-amber-500/10 border-amber-500/30 animate-pulse',
  'Approved': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Rejected': 'text-rose-400 bg-rose-500/10 border-rose-500/30',
};

const fmtDate = (iso: string) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export function RosteringDashboard() {
  const { data, isLoading, isRefetching, refetch } = useRosteringDashboard();
  const updateShift = useUpdateShift();

  const [tab, setTab] = useState<Tab>('shifts');
  const [search, setSearch] = useState('');

  const dbData = data?.data;
  const metrics = dbData?.metrics;

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'shifts', label: 'Shift Roster', icon: Clock },
    { key: 'leave', label: 'Leave Management', icon: PlaneTakeoff },
    { key: 'analytics', label: 'Staffing Insights', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Calendar className="w-7 h-7 text-indigo-400" /> Staff Roster Management
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Personnel Scheduling · Shift Optimization · Attendance Tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} /> Refresh
          </Button>
          <Button variant="outline" className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
             <UserPlus className="w-4 h-4 mr-2" /> Add Staff to Shift
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Staff on Duty', value: metrics?.totalStaffOnDuty, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: Users },
          { label: 'Open Shifts', value: metrics?.openShiftsCount, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Clock },
          { label: 'Overtime (Hrs)', value: metrics?.overtimeHoursTotal, color: 'text-rose-400', bg: 'bg-rose-500/10', icon: AlertCircle },
          { label: 'Absenteeism', value: `${metrics?.absenteeismRatePercent}%`, color: 'text-rose-400', bg: 'bg-rose-500/10', icon: TrendingUp },
          { label: 'Upcoming Leave', value: metrics?.upcomingLeavesCount, color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: PlaneTakeoff },
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

      {/* TAB: Shifts */}
      {tab === 'shifts' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['Staff Member', 'Department', 'Shift Type', 'Time Range', 'Actions'].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dbData?.currentShifts.filter(s => s.staffName.toLowerCase().includes(search.toLowerCase())).map(s => (
                    <tr key={s.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold uppercase border border-indigo-500/30">
                               {s.staffName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                               <p className="font-bold text-white text-sm">{s.staffName}</p>
                               <p className="text-[10px] text-gray-500 font-mono">{s.staffId}</p>
                            </div>
                         </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-white">
                         {s.department}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[9px] px-1.5', shiftColor[s.type])}>
                          {s.type}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                         <p className="text-xs text-white font-mono">{s.startTime} — {s.endTime}</p>
                         <p className="text-[9px] text-gray-500">Today, May 13</p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                           <Button size="sm" variant="ghost" className="h-7 text-[10px] text-gray-500 hover:text-white">
                             Reassign
                           </Button>
                           <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-500 hover:text-white">
                             <MoreHorizontal className="w-4 h-4" />
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

      {/* TAB: Leave */}
      {tab === 'leave' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {isLoading ? <div className="flex justify-center p-16 col-span-full"><Spinner size="lg" /></div> : 
             dbData?.pendingLeaveRequests.filter(l => l.staffName.toLowerCase().includes(search.toLowerCase())).map(l => (
               <Card key={l.id} className="p-5 border-white/[0.06] bg-surface-dark flex flex-col group hover:border-amber-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className="text-[9px] bg-white/5 border-white/10 text-indigo-300 font-mono">
                      {l.type} Leave
                    </Badge>
                    <Badge variant="outline" className={cn('text-[9px] px-1.5', leaveStatusColor[l.status])}>
                      {l.status}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-white text-base mb-1 group-hover:text-amber-400 transition-colors leading-tight">{l.staffName}</h3>
                  <p className="text-[11px] text-gray-500 mb-4 font-mono">{l.staffId}</p>
                  
                  <div className="bg-black/20 p-3 rounded-xl border border-white/5 mb-4 grid grid-cols-2 gap-4">
                     <div>
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-0.5">Start Date</p>
                        <p className="text-xs font-bold text-white font-mono">{fmtDate(l.startDate)}</p>
                     </div>
                     <div>
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-0.5">End Date</p>
                        <p className="text-xs font-bold text-white font-mono">{fmtDate(l.endDate)}</p>
                     </div>
                  </div>
                  
                  <div className="mt-auto pt-3 border-t border-white/[0.04] flex items-center justify-between gap-2">
                     <Button size="sm" variant="ghost" className="h-8 flex-1 text-[11px] text-rose-400 hover:bg-rose-500/10 border border-rose-500/20">
                        Reject
                     </Button>
                     <Button size="sm" variant="ghost" className="h-8 flex-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/20">
                        Approve
                     </Button>
                  </div>
               </Card>
             ))
           }
        </div>
      )}

      {/* TAB: Analytics */}
      {tab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Card className="p-6 border-white/[0.06] bg-surface-dark flex flex-col">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" /> Departmental Coverage
              </h3>
              <div className="space-y-6">
                 {dbData?.departmentalCoverage.map((dept, i) => (
                   <div key={i} className="space-y-2">
                      <div className="flex justify-between text-xs">
                         <span className="text-white font-semibold">{dept.department}</span>
                         <span className={cn("font-bold font-mono", dept.coveragePercent >= 95 ? "text-emerald-400" : "text-amber-400")}>{dept.coveragePercent}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                         <div className={cn("h-full rounded-full transition-all duration-1000", dept.coveragePercent >= 95 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]")} 
                              style={{ width: `${dept.coveragePercent}%` }} />
                      </div>
                   </div>
                 ))}
              </div>
              <div className="mt-8 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/20 flex items-center gap-4">
                 <AlertCircle className="w-6 h-6 text-indigo-400" />
                 <p className="text-xs text-gray-400 italic">
                    Coverage is calculated based on minimum safe staffing ratios per department.
                 </p>
              </div>
           </Card>
           
           <Card className="p-0 border-white/[0.06] bg-surface-dark overflow-hidden flex flex-col">
              <div className="p-6 border-b border-white/[0.04]">
                 <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" /> Staffing Optimization
                 </h3>
              </div>
              <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                 <div className="w-24 h-24 rounded-full border-4 border-indigo-500/20 flex items-center justify-center relative mb-6">
                    <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-2xl font-bold text-white">AI</span>
                 </div>
                 <h4 className="text-lg font-bold text-white mb-2">Automated Roster Generation</h4>
                 <p className="text-sm text-gray-500 max-w-sm mb-8 leading-relaxed">
                    Our AI engine is processing current patient load and staff availability to generate the optimal roster for June 2026.
                 </p>
                 <Button className="bg-indigo-600 hover:bg-indigo-500 px-8 h-11 text-sm shadow-lg shadow-indigo-900/40">
                    Review AI Suggestions <ArrowRight className="w-4 h-4 ml-2" />
                 </Button>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
}
