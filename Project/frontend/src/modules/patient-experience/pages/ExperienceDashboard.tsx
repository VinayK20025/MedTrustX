'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { 
  Heart, ClipboardList, MessageSquare, LifeBuoy, BarChart3,
  Search, RefreshCw, Star, Smile, Frown, Meh,
  AlertTriangle, Clock, ArrowRight, UserPlus, 
  ChevronRight, MoreHorizontal, CheckCircle2, TrendingUp,
  Activity, Coffee, Languages, ShieldAlert
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { 
  useExperienceDashboard, 
  useUpdateGrievance 
} from '../hooks/useExperience';

type Tab = 'surveys' | 'grievances' | 'requests';

const statusColor: Record<string, string> = {
  'Received': 'text-gray-400 bg-white/5 border-white/10',
  'Assigned': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  'Investigating': 'text-amber-400 bg-amber-500/10 border-amber-500/30 animate-pulse',
  'Resolved': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Closed': 'text-emerald-500 bg-emerald-600/10 border-emerald-600/30 font-bold',
  'Pending': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'In Progress': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  'Fulfilled': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
};

const priorityColor: Record<string, string> = {
  'Urgent': 'text-rose-500 bg-rose-600/20 border-rose-600/40 font-black animate-pulse',
  'High': 'text-rose-400 bg-rose-500/10 border-rose-500/30 font-bold',
  'Medium': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Low': 'text-gray-400 bg-white/5 border-white/10',
};

const fmtDate = (iso: string) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export function ExperienceDashboard() {
  const { data, isLoading, isRefetching, refetch } = useExperienceDashboard();
  const updateGrievance = useUpdateGrievance();

  const [tab, setTab] = useState<Tab>('surveys');
  const [search, setSearch] = useState('');

  const dbData = data?.data;
  const metrics = dbData?.metrics;

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'surveys', label: 'Satisfaction Surveys', icon: ClipboardList },
    { key: 'grievances', label: 'Grievance Tracking', icon: MessageSquare },
    { key: 'requests', label: 'Patient Requests', icon: LifeBuoy },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Heart className="w-7 h-7 text-rose-400" /> Patient Experience Hub
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Service Excellence · Feedback Orchestration · Patient Advocacy
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} /> Refresh
          </Button>
          <Button variant="outline" className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10">
             Log Feedback
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Avg NPS Score', value: metrics?.averageNpsScore, color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: TrendingUp },
          { label: 'Sentiment Score', value: `${metrics?.sentimentScorePercent}%`, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: Smile },
          { label: 'Active Grievances', value: metrics?.activeGrievancesCount, color: 'text-rose-400', bg: 'bg-rose-500/10', icon: AlertTriangle },
          { label: 'Avg Resolution', value: `${metrics?.averageResolutionTimeHours}h`, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Clock },
          { label: 'Survey Completion', value: `${metrics?.surveyCompletionRatePercent}%`, color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: ClipboardList },
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
              tab === t.key ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30' : 'text-gray-400 hover:text-white hover:bg-white/5')}>
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
          className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-rose-500/50" 
        />
      </div>

      {/* TAB: Surveys */}
      {tab === 'surveys' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {isLoading ? <div className="flex justify-center p-16 col-span-full"><Spinner size="lg" /></div> : 
             dbData?.recentSurveys.filter(s => s.patientName.toLowerCase().includes(search.toLowerCase())).map(s => (
               <Card key={s.id} className="p-5 border-white/[0.06] bg-surface-dark flex flex-col group hover:border-rose-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-1">
                       <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                       <span className="font-bold text-white text-sm">{s.score}/5</span>
                    </div>
                    <Badge variant="outline" className="text-[9px] bg-white/5 border-white/10 text-gray-500 font-mono">
                      {s.id}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-white text-base mb-1 group-hover:text-rose-400 transition-colors leading-tight">{s.patientName}</h3>
                  <p className="text-[11px] text-gray-500 mb-4">Admitted: {fmtDate(s.admissionDate)} · Discharged: {fmtDate(s.dischargeDate)}</p>
                  
                  <div className="bg-black/20 p-3 rounded-xl border border-white/5 mb-4 flex-1">
                     <p className="text-xs text-gray-300 italic line-clamp-3">"{s.comments}"</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-auto pt-3 border-t border-white/[0.04]">
                     {s.tags.map(tag => (
                       <Badge key={tag} className="bg-rose-500/10 text-rose-400 text-[8px] border-rose-500/20 px-1.5 py-0">
                          {tag}
                       </Badge>
                     ))}
                  </div>
               </Card>
             ))
           }
        </div>
      )}

      {/* TAB: Grievances */}
      {tab === 'grievances' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['Case Details', 'Category', 'Priority', 'Recieved', 'Status', 'Actions'].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dbData?.activeGrievances.filter(g => g.patientName.toLowerCase().includes(search.toLowerCase())).map(g => (
                    <tr key={g.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6">
                         <p className="font-bold text-white text-sm">{g.patientName}</p>
                         <p className="text-[10px] text-gray-600 line-clamp-1 max-w-[200px]">{g.description}</p>
                      </td>
                      <td className="py-4 px-4 text-xs text-white">
                         <Badge variant="outline" className="text-[9px] bg-white/5 border-white/10 text-gray-400">{g.category}</Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[9px] px-1.5', priorityColor[g.priority])}>
                          {g.priority}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-400 font-mono">{fmtDate(g.receivedDate)}</td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[9px] px-1.5', statusColor[g.status])}>
                          {g.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                         <Button size="sm" variant="ghost" className="h-7 text-[10px] text-rose-400 hover:bg-rose-500/10">
                           Investigate <ArrowRight className="w-3 h-3 ml-1.5" />
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

      {/* TAB: Requests */}
      {tab === 'requests' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Card className="p-6 border-white/[0.06] bg-surface-dark flex flex-col">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-indigo-400" /> Patient Service Requests
              </h3>
              <div className="space-y-4">
                 {dbData?.pendingRequests.map(req => (
                   <div key={req.id} className="p-4 bg-black/20 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-rose-500/30 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className={cn("p-2.5 rounded-xl bg-white/5 group-hover:bg-rose-500/10 transition-colors")}>
                            {req.requestType === 'Meal' ? <Coffee className="w-5 h-5 text-amber-400" /> : 
                             req.requestType === 'Advocacy' ? <ShieldAlert className="w-5 h-5 text-rose-400" /> : 
                             <Languages className="w-5 h-5 text-indigo-400" />}
                         </div>
                         <div>
                            <p className="text-sm font-bold text-white">{req.requestType} Request</p>
                            <p className="text-[10px] text-gray-500 font-mono">Room {req.roomNumber} · {req.patientId}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <Badge variant="outline" className={cn('text-[9px] px-1.5 block mb-1', statusColor[req.status])}>
                            {req.status}
                         </Badge>
                         <p className="text-[10px] text-gray-600 font-mono">May 13, 04:35</p>
                      </div>
                   </div>
                 ))}
              </div>
           </Card>
           
           <Card className="p-8 border-white/[0.06] bg-surface-dark flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-rose-500/10 rounded-full mb-4">
                 <Smile className="w-10 h-10 text-rose-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Institutional Sentiment Analysis</h2>
              <p className="text-sm text-gray-500 max-w-sm mb-8 leading-relaxed">
                Aggregating real-time feedback across all touchpoints to measure the institutional "Pulse" and identify care gaps.
              </p>
              <div className="flex items-center gap-6 w-full max-w-xs mx-auto mb-8">
                 <div className="flex-1 flex flex-col items-center">
                    <TrendingUp className="w-5 h-5 text-emerald-400 mb-1" />
                    <p className="text-lg font-bold text-white">86%</p>
                    <p className="text-[9px] text-gray-600 uppercase">Positive</p>
                 </div>
                 <div className="w-px h-10 bg-white/5" />
                 <div className="flex-1 flex flex-col items-center">
                    <Activity className="w-5 h-5 text-indigo-400 mb-1" />
                    <p className="text-lg font-bold text-white">12.4k</p>
                    <p className="text-[9px] text-gray-600 uppercase">Data Points</p>
                 </div>
              </div>
              <Button className="w-full bg-rose-600 hover:bg-rose-500 h-11 text-sm shadow-lg shadow-rose-900/40">
                 Generate Sentiment Report <BarChart3 className="w-4 h-4 ml-2" />
              </Button>
           </Card>
        </div>
      )}
    </div>
  );
}
