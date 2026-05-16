'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { 
  TrendingUp, Target, Star, GraduationCap, MessageSquare,
  Search, RefreshCw, Award, Activity, ShieldCheck,
  ArrowRight, Users, ClipboardList, CheckCircle2, Info,
  TrendingDown, Minus, Filter, Heart
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { 
  usePerformanceDashboard, 
  useSubmitAppraisal 
} from '../hooks/usePerformance';

type Tab = 'appraisals' | 'kpis' | 'feedback';

const statusColor: Record<string, string> = {
  'Draft': 'text-gray-400 bg-white/5 border-white/10',
  'Self-Assessment': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  'Peer-Review': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  'Manager-Review': 'text-amber-400 bg-amber-500/10 border-amber-500/30 animate-pulse',
  'Completed': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
};

const ratingColor = (r: number) => {
  if (r >= 4.5) return 'text-emerald-400';
  if (r >= 3.5) return 'text-indigo-400';
  if (r >= 2.5) return 'text-amber-400';
  return 'text-rose-400';
};

const fmtDate = (iso: string) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export function PerformanceDashboard() {
  const { data, isLoading, isRefetching, refetch } = usePerformanceDashboard();
  const submit = useSubmitAppraisal();

  const [tab, setTab] = useState<Tab>('appraisals');
  const [search, setSearch] = useState('');

  const dbData = data?.data;
  const metrics = dbData?.metrics;

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'appraisals', label: 'Staff Appraisals', icon: ClipboardList },
    { key: 'kpis', label: 'Clinical KPIs', icon: Target },
    { key: 'feedback', label: '360° Feedback', icon: MessageSquare },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-indigo-400" /> Performance Management
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Clinical Excellence · Staff Appraisals · Continuous Professional Growth
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} /> Refresh
          </Button>
          <Button variant="outline" className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
             Initiate Appraisal
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Avg Staff Rating', value: metrics?.averageStaffRating, color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: Star },
          { label: 'KPI Achievement', value: `${metrics?.kpiTargetAchievementPercent}%`, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: Target },
          { label: 'Patient Satisfaction', value: `${metrics?.patientSatisfactionScore}/5`, color: 'text-rose-400', bg: 'bg-rose-500/10', icon: Heart },
          { label: 'Appraisal Rate', value: `${metrics?.appraisalCompletionRatePercent}%`, color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: ClipboardList },
          { label: 'Compliance', value: `${metrics?.trainingCompliancePercent}%`, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: ShieldCheck },
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

      {/* TAB: Appraisals */}
      {tab === 'appraisals' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['Staff Member', 'Period', 'Rating', 'Next Review', 'Status', 'Actions'].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dbData?.activeAppraisals.filter(a => a.staffName.toLowerCase().includes(search.toLowerCase())).map(a => (
                    <tr key={a.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold uppercase border border-indigo-500/30">
                               {a.staffName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                               <p className="font-bold text-white text-sm">{a.staffName}</p>
                               <p className="text-[10px] text-gray-500 font-mono">{a.staffId}</p>
                            </div>
                         </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-white">
                         {a.period}
                      </td>
                      <td className="py-4 px-4">
                        {a.overallRating ? (
                          <div className="flex items-center gap-1">
                             <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                             <span className={cn("font-bold text-xs", ratingColor(a.overallRating))}>{a.overallRating}/5</span>
                          </div>
                        ) : <span className="text-gray-600">-</span>}
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-400 font-mono">{fmtDate(a.nextReviewDate)}</td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[9px] px-1.5', statusColor[a.status])}>
                          {a.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                         <Button size="sm" variant="ghost" className="h-7 text-[10px] text-indigo-400 hover:text-indigo-300">
                           View Details <ArrowRight className="w-3 h-3 ml-1.5" />
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

      {/* TAB: KPIs */}
      {tab === 'kpis' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {isLoading ? <div className="flex justify-center p-16 col-span-full"><Spinner size="lg" /></div> : 
             dbData?.topClinicalKpis.filter(k => k.metricName.toLowerCase().includes(search.toLowerCase())).map(k => (
               <Card key={k.id} className="p-5 border-white/[0.06] bg-surface-dark flex flex-col group hover:border-indigo-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className="text-[9px] bg-white/5 border-white/10 text-gray-500 font-mono">
                      Clinical Quality
                    </Badge>
                    <div className={cn("p-1.5 rounded-lg", k.trend === 'Up' ? "bg-emerald-500/10" : k.trend === 'Down' ? "bg-rose-500/10" : "bg-white/5")}>
                       {k.trend === 'Up' ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> : k.trend === 'Down' ? <TrendingDown className="w-3.5 h-3.5 text-rose-400" /> : <Minus className="w-3.5 h-3.5 text-gray-500" />}
                    </div>
                  </div>
                  <h3 className="font-bold text-white text-base mb-1 group-hover:text-indigo-400 transition-colors leading-tight">{k.metricName}</h3>
                  <p className="text-[11px] text-gray-500 mb-4">{k.staffId} · Target: {k.targetValue}{k.unit}</p>
                  
                  <div className="mt-auto pt-4 flex flex-col gap-2">
                     <div className="flex justify-between items-end">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Current Performance</p>
                        <p className={cn("text-xl font-bold", k.currentValue >= k.targetValue ? "text-emerald-400" : "text-amber-400")}>
                           {k.currentValue}{k.unit}
                        </p>
                     </div>
                     <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all duration-1000", k.currentValue >= k.targetValue ? "bg-emerald-500" : "bg-amber-500")} 
                             style={{ width: `${Math.min((k.currentValue / k.targetValue) * 100, 100)}%` }} />
                     </div>
                  </div>
               </Card>
             ))
           }
        </div>
      )}

      {/* TAB: Feedback */}
      {tab === 'feedback' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Card className="p-6 border-white/[0.06] bg-surface-dark flex flex-col">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" /> Recent Stakeholder Feedback
              </h3>
              <div className="space-y-4">
                 {dbData?.recentFeedback.map(f => (
                   <div key={f.id} className="p-4 bg-black/20 rounded-2xl border border-white/5 group hover:border-indigo-500/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                         <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[9px] bg-indigo-500/10 border-indigo-500/30 text-indigo-400">
                               {f.source}
                            </Badge>
                            <span className="text-[10px] text-gray-600 font-mono">{fmtDate(f.date)}</span>
                         </div>
                         <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                               <Star key={i} className={cn("w-2.5 h-2.5", i < f.rating ? "text-amber-400 fill-amber-400" : "text-gray-700")} />
                            ))}
                         </div>
                      </div>
                      <p className="text-xs text-gray-300 italic leading-relaxed">"{f.comment}"</p>
                      <p className="text-[9px] text-gray-600 mt-3 uppercase tracking-widest font-bold">Ref: {f.staffId}</p>
                   </div>
                 ))}
              </div>
           </Card>
           
           <Card className="p-8 border-white/[0.06] bg-surface-dark flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-indigo-500/10 rounded-full mb-4">
                 <Award className="w-10 h-10 text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Clinical Excellence Recognition</h2>
              <p className="text-sm text-gray-500 max-w-sm mb-8 leading-relaxed">
                Celebrating staff who exceed clinical benchmarks and demonstrate exceptional patient care.
              </p>
              <div className="grid grid-cols-2 gap-4 w-full">
                 <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase">Top Performer</p>
                    <p className="text-sm font-bold text-emerald-400 mt-1">Dr. Elena Rostova</p>
                 </div>
                 <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase">Patient Choice</p>
                    <p className="text-sm font-bold text-rose-400 mt-1">Nurse Sarah Jenkins</p>
                 </div>
              </div>
              <Button className="mt-8 bg-indigo-600 hover:bg-indigo-500 px-8 h-11 text-sm shadow-lg shadow-indigo-900/40">
                 View Excellence Board <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
           </Card>
        </div>
      )}
    </div>
  );
}
