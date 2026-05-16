'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { 
  Utensils, Apple, ClipboardList, Activity, Flame,
  Search, RefreshCw, AlertCircle, Clock, 
  ArrowRight, Users, ChevronRight, TrendingUp,
  Beef, Soup, Coffee, ShieldAlert, Heart,
  Scale, FileText, CheckCircle2, MoreHorizontal
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { 
  useNutritionDashboard, 
  useUpdateOrderStatus 
} from '../hooks/useNutrition';

type Tab = 'orders' | 'assessments' | 'kitchen';

const statusColor: Record<string, string> = {
  'Pending': 'text-gray-400 bg-white/5 border-white/10',
  'In Preparation': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30 animate-pulse',
  'Out for Delivery': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Delivered': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Consumed': 'text-emerald-500 bg-emerald-600/10 border-emerald-600/30 font-bold',
  'High': 'text-rose-400 bg-rose-500/10 border-rose-500/30 font-bold',
  'Moderate': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Low': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
};

const dietIcon = (type: string) => {
  switch (type) {
    case 'NPO': return <ShieldAlert className="w-4 h-4 text-rose-500" />;
    case 'Diabetic': return <Activity className="w-4 h-4 text-indigo-400" />;
    case 'Clear Liquid': return <Soup className="w-4 h-4 text-cyan-400" />;
    case 'Regular': return <Beef className="w-4 h-4 text-emerald-400" />;
    default: return <Coffee className="w-4 h-4 text-gray-400" />;
  }
};

const fmtDate = (iso: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function NutritionDashboard() {
  const { data, isLoading, isRefetching, refetch } = useNutritionDashboard();
  const updateOrder = useUpdateOrderStatus();

  const [tab, setTab] = useState<Tab>('orders');
  const [search, setSearch] = useState('');

  const dbData = data?.data;
  const metrics = dbData?.metrics;

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'orders', label: 'Dietary Orders', icon: ClipboardList },
    { key: 'assessments', label: 'Nutritional Assessment', icon: Scale },
    { key: 'kitchen', label: 'Kitchen Operations', icon: Flame },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Utensils className="w-7 h-7 text-emerald-400" /> Nutrition Control Hub
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Clinical Dietetics · Meal Logistics · Nutritional Risk Orchestration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} /> Refresh
          </Button>
          <Button variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
             New Assessment
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Active Orders', value: metrics?.totalActiveOrders, color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: ClipboardList },
          { label: 'NPO Patients', value: metrics?.npoPatientCount, color: 'text-rose-400', bg: 'bg-rose-500/10', icon: ShieldAlert },
          { label: 'Malnutrition Risk', value: `${metrics?.malnutritionRiskPercent}%`, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Scale },
          { label: 'On-Time Delivery', value: `${metrics?.mealDeliveryOnTimePercent}%`, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
          { label: 'Pending Assessment', value: metrics?.highRiskAssessmentsPending, color: 'text-rose-400', bg: 'bg-rose-500/10', icon: AlertCircle },
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

      {/* TAB: Orders */}
      {tab === 'orders' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {isLoading ? <div className="flex justify-center p-16 col-span-full"><Spinner size="lg" /></div> : 
             dbData?.activeOrders.filter(o => o.patientName.toLowerCase().includes(search.toLowerCase())).map(o => (
               <Card key={o.id} className="p-5 border-white/[0.06] bg-surface-dark flex flex-col group hover:border-emerald-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                       {dietIcon(o.dietType)}
                       <Badge variant="outline" className="text-[9px] bg-white/5 border-white/10 text-emerald-400 font-mono">
                         {o.dietType}
                       </Badge>
                    </div>
                    <Badge variant="outline" className={cn('text-[9px] px-1.5', statusColor[o.status])}>
                      {o.status}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-white text-base mb-1 group-hover:text-emerald-400 transition-colors leading-tight">{o.patientName}</h3>
                  <p className="text-[11px] text-gray-500 mb-4">Room {o.roomNumber} · {o.mealTime}</p>
                  
                  <div className="bg-black/20 p-3 rounded-xl border border-white/5 mb-4 flex-1">
                     <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-rose-400" /> Dietary Restrictions
                     </p>
                     <div className="flex flex-wrap gap-1">
                        {o.restrictions.map(r => (
                          <span key={r} className="text-[10px] bg-rose-500/5 text-rose-400 px-2 py-0.5 rounded border border-rose-500/10">
                             {r}
                          </span>
                        ))}
                     </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                     <span className="text-[10px] text-gray-600 font-mono">{o.id}</span>
                     <p className="text-[9px] text-gray-500 font-mono">Ordered: {fmtDate(o.orderedAt)}</p>
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
                    {['Patient / Case', 'Weight / BMI', 'Risk Level', 'Last Assessment', 'Recommended Supplements', 'Actions'].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dbData?.highRiskAssessments.map(a => (
                    <tr key={a.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6">
                         <p className="font-bold text-white text-sm">{a.patientId}</p>
                      </td>
                      <td className="py-4 px-4 text-xs text-white">
                         {a.weightKg}kg / BMI {a.bmi}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[9px] px-1.5', statusColor[a.riskLevel])}>
                          {a.riskLevel} Risk
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-400 font-mono">{fmtDate(a.lastAssessmentDate)}</td>
                      <td className="py-4 px-4">
                         <div className="flex flex-wrap gap-1">
                            {a.recommendedSupplements.map(s => (
                              <Badge key={s} className="bg-indigo-500/10 text-indigo-400 text-[8px] border-indigo-500/20 px-1.5 py-0">
                                {s}
                              </Badge>
                            ))}
                         </div>
                      </td>
                      <td className="py-4 px-4">
                         <Button size="sm" variant="ghost" className="h-7 text-[10px] text-emerald-400 hover:bg-emerald-500/10">
                           Full Review <ArrowRight className="w-3 h-3 ml-1.5" />
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

      {/* TAB: Kitchen */}
      {tab === 'kitchen' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Card className="p-6 border-white/[0.06] bg-surface-dark flex flex-col">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Apple className="w-5 h-5 text-emerald-400" /> Today's Menu & Meal Planning
              </h3>
              <div className="space-y-4">
                 {dbData?.todaysMenu.map(plan => (
                   <div key={plan.id} className="p-4 bg-black/20 rounded-2xl border border-white/5 space-y-4">
                      <div className="flex justify-between items-center">
                         <p className="text-sm font-bold text-white">{plan.day}'s Feature Menu</p>
                         <Badge className="bg-emerald-500/10 text-emerald-400 text-[9px]">Standard Menu</Badge>
                      </div>
                      <div className="space-y-3">
                         {plan.menuItems.map((item, i) => (
                           <div key={i} className="flex justify-between items-center p-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                              <div>
                                 <p className="text-xs text-white font-medium">{item.name}</p>
                                 <p className="text-[10px] text-gray-600">Protein: {item.proteins}g</p>
                              </div>
                              <p className="text-xs font-bold text-indigo-400 font-mono">{item.calories} kcal</p>
                           </div>
                         ))}
                      </div>
                   </div>
                 ))}
              </div>
              <Button className="mt-6 w-full bg-emerald-600 hover:bg-emerald-500 h-11 text-sm shadow-lg shadow-emerald-900/40">
                 Cycle Menu Management <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
           </Card>
           
           <Card className="p-8 border-white/[0.06] bg-surface-dark flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-emerald-500/10 rounded-full mb-4">
                 <Flame className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Kitchen Operational Analytics</h2>
              <p className="text-sm text-gray-500 max-w-sm mb-8 leading-relaxed">
                Visualizing food production metrics, kitchen hygiene compliance, and meal delivery latencies.
              </p>
              <div className="grid grid-cols-2 gap-4 w-full mb-8">
                 <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Meal Satisfaction</p>
                    <p className="text-sm font-bold text-emerald-400">4.8 / 5.0</p>
                 </div>
                 <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Food Waste %</p>
                    <p className="text-sm font-bold text-rose-400">4.2%</p>
                 </div>
              </div>
              <div className="flex gap-4 w-full">
                 <Button variant="outline" className="flex-1 border-white/10 text-gray-400">Inventory Log</Button>
                 <Button className="flex-1 bg-emerald-600 hover:bg-emerald-500">Hygiene Audit</Button>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
}
