'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { 
  Skull, MoveDown, Box, MoveUp, Stethoscope,
  Search, RefreshCw, AlertCircle, Clock, 
  ArrowRight, Users, ChevronRight, TrendingUp,
  Thermometer, ShieldAlert, FileText, CheckCircle2,
  Filter, Plus, Info, Scale, Gavel, FileWarning
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { 
  useMortuaryDashboard, 
  useUpdateChamber 
} from '../hooks/useMortuary';

type Tab = 'intake' | 'storage' | 'release';

const deceasedStatusColor: Record<string, string> = {
  'Awaiting Intake': 'text-amber-400 bg-amber-500/10 border-amber-500/30 animate-pulse',
  'Stored': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  'Autopsy in Progress': 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  'Ready for Release': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 font-bold',
  'Released': 'text-gray-400 bg-white/5 border-white/10',
};

const chamberStatusColor: Record<string, string> = {
  'Available': 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
  'Occupied': 'text-indigo-400 border-indigo-500/30 bg-indigo-500/5',
  'Maintenance': 'text-rose-400 border-rose-500/30 bg-rose-500/5',
  'Reserved': 'text-amber-400 border-amber-500/30 bg-amber-500/5',
};

const fmtDate = (iso: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function MortuaryDashboard() {
  const { data, isLoading, isRefetching, refetch } = useMortuaryDashboard();
  const updateChamber = useUpdateChamber();

  const [tab, setTab] = useState<Tab>('intake');
  const [search, setSearch] = useState('');

  const dbData = data?.data;
  const metrics = dbData?.metrics;

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'intake', label: 'Intake / Registry', icon: MoveDown },
    { key: 'storage', label: 'Storage Management', icon: Box },
    { key: 'release', label: 'Release / Burial', icon: MoveUp },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Skull className="w-7 h-7 text-indigo-400" /> Mortuary Command
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Anatomical Logistics · Post-mortem Coordination · Statutory Compliance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} /> Refresh
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-900/40">
             <Plus className="w-4 h-4 mr-2" /> New Intake
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Current Occupancy', value: metrics?.currentOccupancy, color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: Box },
          { label: 'Available Chambers', value: metrics?.availableChambers, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
          { label: 'Pending Autopsies', value: metrics?.pendingAutopsiesCount, color: 'text-rose-500', bg: 'bg-rose-600/20', icon: Stethoscope },
          { label: 'Releases Today', value: metrics?.releasesTodayCount, color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: MoveUp },
          { label: 'Storage Capacity', value: `${((metrics?.currentOccupancy || 0) / (metrics?.totalCapacity || 1) * 100).toFixed(0)}%`, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: TrendingUp },
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

      {/* TAB: Intake */}
      {tab === 'intake' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {isLoading ? <div className="flex justify-center p-16 col-span-full"><Spinner size="lg" /></div> : 
             dbData?.recentIntakes.filter(d => d.name.toLowerCase().includes(search.toLowerCase())).map(d => (
               <Card key={d.id} className="p-5 border-white/[0.06] bg-surface-dark flex flex-col group hover:border-indigo-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className={cn('text-[9px] px-1.5', deceasedStatusColor[d.status])}>
                      {d.status}
                    </Badge>
                    <div className="flex gap-1">
                       {d.policeCase && <Badge className="bg-rose-600/20 text-rose-500 border-rose-600/40 text-[8px] h-4">POLICE</Badge>}
                       {d.autopsyRequested && <Badge className="bg-amber-600/20 text-amber-500 border-amber-600/40 text-[8px] h-4">AUTOPSY</Badge>}
                    </div>
                  </div>
                  <h3 className="font-bold text-white text-base mb-1 group-hover:text-indigo-400 transition-colors leading-tight">{d.name}</h3>
                  <p className="text-[11px] text-gray-500 mb-4">{d.gender} · DOD: {fmtDate(d.dateOfDeath)} {d.timeOfDeath}</p>
                  
                  <div className="bg-black/20 p-3 rounded-xl border border-white/5 mb-4 flex-1">
                     <p className="text-[10px] text-gray-400 flex items-center gap-2">
                        <Info className="w-3.5 h-3.5 text-gray-600" /> 
                        {d.chamberId ? `Allocated to Chamber ${d.chamberId}` : 'Awaiting chamber allocation'}
                     </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                     <span className="text-[10px] text-gray-600 font-mono">{d.id}</span>
                     <Button size="sm" variant="ghost" className="h-7 text-[11px] text-indigo-400 hover:bg-indigo-500/10">
                        View Registry <ArrowRight className="w-3 h-3 ml-2" />
                     </Button>
                  </div>
               </Card>
             ))
           }
        </div>
      )}

      {/* TAB: Storage */}
      {tab === 'storage' && (
        <Card className="p-6 border-white/[0.06] bg-surface-dark min-h-[400px]">
           <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {isLoading ? <div className="flex justify-center p-16 col-span-full"><Spinner size="lg" /></div> : (
                dbData?.activeStorage.map(chamber => (
                  <div key={chamber.id} className={cn('p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer hover:scale-105', 
                    chamberStatusColor[chamber.status])}>
                     <p className="text-[10px] font-bold uppercase tracking-widest">{chamber.id}</p>
                     <Box className="w-6 h-6 opacity-40" />
                     <div className="flex flex-col items-center">
                        <p className="text-[8px] font-semibold">{chamber.status}</p>
                        <div className="flex items-center gap-1 mt-1">
                           <Thermometer className="w-2.5 h-2.5" />
                           <span className="text-[9px] font-mono">{chamber.temperatureCelsius}°C</span>
                        </div>
                     </div>
                  </div>
                ))
              )}
           </div>
           
           <div className="mt-12 flex flex-wrap gap-6 pt-6 border-t border-white/[0.04]">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-indigo-500/10 rounded-2xl">
                    <ShieldAlert className="w-6 h-6 text-indigo-400" />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-white">Chamber Telemetry</h4>
                    <p className="text-[10px] text-gray-500">Real-time thermal monitoring across all bays.</p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-rose-500/10 rounded-2xl">
                    <Scale className="w-6 h-6 text-rose-400" />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-white">Capacity Alert</h4>
                    <p className="text-[10px] text-gray-500">Auto-notification to management at 90% occupancy.</p>
                 </div>
              </div>
           </div>
        </Card>
      )}

      {/* TAB: Release */}
      {tab === 'release' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Card className="p-6 border-white/[0.06] bg-surface-dark flex flex-col">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <MoveUp className="w-5 h-5 text-emerald-400" /> Ready for Release
              </h3>
              <div className="space-y-4">
                 {dbData?.pendingReleases.map(d => (
                   <div key={d.id} className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex items-center justify-between group hover:border-emerald-500/30 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-emerald-500/10 transition-colors">
                            <FileText className="w-5 h-5 text-emerald-400" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-white">{d.name}</p>
                            <p className="text-[10px] text-gray-500 font-mono">{d.id} · DOD: {fmtDate(d.dateOfDeath)}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <Badge variant="outline" className="text-[9px] bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
                            DOCS READY
                         </Badge>
                         <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-500 text-[11px]">
                            Process Release
                         </Button>
                      </div>
                   </div>
                 ))}
              </div>
           </Card>

           <Card className="p-8 border-white/[0.06] bg-surface-dark flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-indigo-500/10 rounded-full mb-4">
                 <Gavel className="w-10 h-10 text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Legal & Statutory Clearance</h2>
              <p className="text-sm text-gray-500 max-w-sm mb-8 leading-relaxed">
                Visualizing institutional compliance for burial permits, police clearances, and forensic release authorizations.
              </p>
              <div className="grid grid-cols-2 gap-4 w-full mb-8">
                 <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Police Cases</p>
                    <p className="text-sm font-bold text-rose-400">3 Pending</p>
                 </div>
                 <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Permit Success</p>
                    <p className="text-sm font-bold text-emerald-400">100% YTD</p>
                 </div>
              </div>
              <div className="flex flex-col gap-3 w-full">
                 <Button className="w-full bg-indigo-600 hover:bg-indigo-500 h-11 text-sm shadow-lg shadow-indigo-900/40">
                    Statutory Reporting Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                 </Button>
                 <Button variant="outline" className="w-full border-white/10 text-gray-400 h-11">
                    Forensic Coordination Hub
                 </Button>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
}
