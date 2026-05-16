'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { 
  Sparkles, LayoutGrid, CheckCircle2, Wind, Trash2,
  Search, RefreshCw, AlertCircle, Clock, 
  ArrowRight, Users, ChevronRight, TrendingUp,
  Droplets, ShieldAlert, History, Box, Info,
  CheckCircle, Loader2, AlertTriangle, ListChecks
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { 
  useHousekeepingDashboard, 
  useUpdateRoomStatus 
} from '../hooks/useHousekeeping';

type Tab = 'rooms' | 'tasks' | 'logistics';

const statusColor: Record<string, string> = {
  'Clean': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Dirty': 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  'In Progress': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30 animate-pulse',
  'Terminal Cleaning': 'text-amber-400 bg-amber-500/10 border-amber-500/30 font-bold',
  'Maintenance Down': 'text-gray-400 bg-white/5 border-white/10',
  'Pending': 'text-gray-400 bg-white/5 border-white/10',
  'Assigned': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  'Completed': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Verified': 'text-emerald-500 bg-emerald-600/10 border-emerald-600/30 font-bold',
};

const priorityColor: Record<string, string> = {
  'STAT': 'text-rose-500 bg-rose-600/20 border-rose-600/40 font-black animate-pulse',
  'Discharge': 'text-rose-400 bg-rose-500/10 border-rose-500/30 font-bold',
  'Isolation': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Routine': 'text-gray-400 bg-white/5 border-white/10',
};

const fmtDate = (iso: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function HousekeepingDashboard() {
  const { data, isLoading, isRefetching, refetch } = useHousekeepingDashboard();
  const updateRoom = useUpdateRoomStatus();

  const [tab, setTab] = useState<Tab>('rooms');
  const [search, setSearch] = useState('');

  const dbData = data?.data;
  const metrics = dbData?.metrics;

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'rooms', label: 'Ward Occupancy', icon: LayoutGrid },
    { key: 'tasks', label: 'Cleaning Tasks', icon: CheckCircle2 },
    { key: 'logistics', label: 'Linen & Waste', icon: Wind },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-indigo-400" /> Housekeeping Hub
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Facility Hygiene · Turn-around Orchestration · Infection Control Sync
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} /> Refresh
          </Button>
          <Button variant="outline" className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
             <ListChecks className="w-4 h-4 mr-2" /> Assign Rounds
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Avg Turn-around', value: `${metrics?.averageTurnoverTimeMinutes}m`, color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: Clock },
          { label: 'Clean Rooms', value: metrics?.cleanRoomCount, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
          { label: 'Dirty Rooms', value: metrics?.dirtyRoomCount, color: 'text-rose-400', bg: 'bg-rose-500/10', icon: AlertTriangle },
          { label: 'Active Staff', value: metrics?.activeStaffCount, color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: Users },
          { label: 'STAT Tasks', value: metrics?.pendingStatTasks, color: 'text-rose-400', bg: 'bg-rose-500/10', icon: AlertCircle },
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

      {/* TAB: Rooms */}
      {tab === 'rooms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {isLoading ? <div className="flex justify-center p-16 col-span-full"><Spinner size="lg" /></div> : 
             dbData?.rooms.filter(r => r.roomNumber.toLowerCase().includes(search.toLowerCase())).map(r => (
               <Card key={r.id} className="p-5 border-white/[0.06] bg-surface-dark flex flex-col group hover:border-indigo-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className="text-[9px] bg-white/5 border-white/10 text-gray-500 font-mono">
                      {r.ward}
                    </Badge>
                    <Badge variant="outline" className={cn('text-[9px] px-1.5', statusColor[r.status])}>
                      {r.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mb-1">
                     <h3 className="font-bold text-white text-lg group-hover:text-indigo-400 transition-colors leading-tight">Room {r.roomNumber}</h3>
                     {r.isIsolation && (
                       <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/30 text-[8px] animate-pulse">Isolation</Badge>
                     )}
                  </div>
                  <p className="text-[11px] text-gray-500 mb-4 flex items-center gap-1">
                     <Clock className="w-3 h-3" /> Last Cleaned: {fmtDate(r.lastCleanedAt)}
                  </p>
                  
                  <div className="bg-black/20 p-3 rounded-xl border border-white/5 mb-4 flex-1">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                           <Users className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                           <p className="text-[9px] text-gray-500 uppercase tracking-widest">Assigned Staff</p>
                           <p className="text-xs text-white font-medium">{r.assignedStaffId || 'Not Assigned'}</p>
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                     <span className="text-[10px] text-gray-600 font-mono">{r.id}</span>
                     <Button size="sm" variant="ghost" className="h-7 text-[11px] text-indigo-400 hover:bg-white/5">
                        Log Clean <ArrowRight className="w-3 h-3 ml-2" />
                     </Button>
                  </div>
               </Card>
             ))
           }
        </div>
      )}

      {/* TAB: Tasks */}
      {tab === 'tasks' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['Task ID', 'Location', 'Type', 'Priority', 'Requested', 'Status'].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dbData?.activeTasks.filter(t => t.location.toLowerCase().includes(search.toLowerCase())).map(t => (
                    <tr key={t.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6">
                         <p className="font-bold text-white text-sm">{t.id}</p>
                         <p className="text-[10px] text-gray-600">Assigned: {t.assignedTo || 'Pending'}</p>
                      </td>
                      <td className="py-4 px-4 text-xs text-white font-semibold">
                         {t.location}
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-400 font-mono">
                         {t.taskType}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[9px] px-1.5', priorityColor[t.priority])}>
                          {t.priority}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-400 font-mono">{fmtDate(t.requestedAt)}</td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[9px] px-1.5', statusColor[t.status])}>
                          {t.status}
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

      {/* TAB: Logistics */}
      {tab === 'logistics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Card className="p-6 border-white/[0.06] bg-surface-dark flex flex-col">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Wind className="w-5 h-5 text-indigo-400" /> Linen & Supplies Inventory
              </h3>
              <div className="space-y-4">
                 {dbData?.lowLinenStock.map((linen, i) => (
                   <div key={i} className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 flex items-center justify-between group hover:border-amber-500/30 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-amber-500/10 transition-colors">
                            <Box className="w-5 h-5 text-amber-400" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-white">{linen.itemName}</p>
                            <p className="text-[10px] text-gray-500 font-mono">{linen.id}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-xs font-bold text-amber-400">{linen.currentStock} {linen.unit}</p>
                         <p className="text-[10px] text-gray-600 uppercase tracking-tighter">Min: {linen.minRequired}</p>
                      </div>
                   </div>
                 ))}
              </div>
              <Button className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 h-10 text-xs">
                 Linen Supply Request <History className="w-3.5 h-3.5 ml-2" />
              </Button>
           </Card>
           
           <Card className="p-8 border-white/[0.06] bg-surface-dark flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-rose-500/10 rounded-full mb-4">
                 <Trash2 className="w-10 h-10 text-rose-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Waste Management Analytics</h2>
              <p className="text-sm text-gray-500 max-w-sm mb-8 leading-relaxed">
                Visualizing institutional waste streams, biohazard disposal compliance, and disposal efficiency.
              </p>
              <div className="grid grid-cols-2 gap-4 w-full mb-8">
                 <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Biohazard Disposal</p>
                    <p className="text-sm font-bold text-rose-400">12.4kg Today</p>
                 </div>
                 <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Disposal Compliance</p>
                    <p className="text-sm font-bold text-emerald-400">100%</p>
                 </div>
              </div>
              <div className="flex gap-4 w-full">
                 <Button variant="outline" className="flex-1 border-white/10 text-gray-400">Waste Log</Button>
                 <Button className="flex-1 bg-rose-600 hover:bg-rose-500">Hazmat Audit</Button>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
}
