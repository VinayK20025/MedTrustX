'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { 
  Truck, Navigation, MapPin, Wrench, Users,
  Search, RefreshCw, AlertCircle, Clock, Activity,
  Fuel, Zap, ArrowRight, ShieldAlert, Map,
  ChevronRight, MoreHorizontal, CheckCircle2, Siren,
  TrendingUp, TrendingDown, Phone
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { 
  useFleetDashboard, 
  useDispatchVehicle 
} from '../hooks/useFleet';

type Tab = 'fleet' | 'missions' | 'tracking';

const statusColor: Record<string, string> = {
  'Available': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'On Mission': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30 animate-pulse',
  'Maintenance': 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  'Out of Service': 'text-gray-400 bg-white/5 border-white/10',
  'Transporting': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  'Emergency': 'text-rose-500 bg-rose-600/20 border-rose-600/40 font-black animate-pulse',
};

const fmtDate = (iso: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function FleetDashboard() {
  const { data, isLoading, isRefetching, refetch } = useFleetDashboard();
  const dispatch = useDispatchVehicle();

  const [tab, setTab] = useState<Tab>('fleet');
  const [search, setSearch] = useState('');

  const dbData = data?.data;
  const metrics = dbData?.metrics;

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'fleet', label: 'Ambulance Fleet', icon: Truck },
    { key: 'missions', label: 'Active Missions', icon: Navigation },
    { key: 'tracking', label: 'Live Tracking', icon: MapPin },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Truck className="w-7 h-7 text-indigo-400" /> Emergency Fleet Control
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Telematics Integration · Mission Dispatch · Maintenance Orchestration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} /> Refresh
          </Button>
          <Button variant="outline" className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-bold">
             <Siren className="w-4 h-4 mr-2 animate-pulse" /> Emergency Dispatch
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Fleet', value: metrics?.totalVehicles, color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: Truck },
          { label: 'Available', value: metrics?.availableVehicles, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
          { label: 'Active Missions', value: metrics?.activeMissions, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Navigation },
          { label: 'Avg Response (min)', value: metrics?.averageResponseTimeMinutes, color: 'text-rose-400', bg: 'bg-rose-500/10', icon: Clock },
          { label: 'Fleet Uptime', value: `${metrics?.fleetUptimePercent}%`, color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: Activity },
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

      {/* TAB: Fleet */}
      {tab === 'fleet' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {isLoading ? <div className="flex justify-center p-16 col-span-full"><Spinner size="lg" /></div> : 
             dbData?.vehicles.filter(v => v.licensePlate.toLowerCase().includes(search.toLowerCase())).map(v => (
               <Card key={v.id} className="p-5 border-white/[0.06] bg-surface-dark flex flex-col group hover:border-indigo-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className="text-[9px] bg-white/5 border-white/10 text-indigo-300 font-mono">
                      {v.type}
                    </Badge>
                    <Badge variant="outline" className={cn('text-[9px] px-1.5', statusColor[v.status])}>
                      {v.status}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-white text-base mb-1 group-hover:text-indigo-400 transition-colors leading-tight">{v.licensePlate}</h3>
                  <p className="text-[11px] text-gray-500 mb-4 flex items-center gap-1">
                     <MapPin className="w-3 h-3" /> {v.currentLocation.address}
                  </p>
                  
                  <div className="bg-black/20 p-3 rounded-xl border border-white/5 mb-4 grid grid-cols-2 gap-4">
                     <div>
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                           <Fuel className="w-2.5 h-2.5" /> Fuel
                        </p>
                        <p className={cn("text-xs font-bold font-mono", v.fuelLevelPercent < 30 ? "text-rose-400" : "text-emerald-400")}>
                           {v.fuelLevelPercent}%
                        </p>
                     </div>
                     <div>
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                           <Wrench className="w-2.5 h-2.5" /> Maintenance
                        </p>
                        <p className="text-[10px] text-white font-mono">{fmtDate(v.lastMaintenanceDate)}</p>
                     </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                     <span className="text-[10px] text-gray-600 font-mono">{v.id}</span>
                     <Button size="sm" variant="ghost" className="h-7 text-[11px] text-indigo-400 hover:bg-white/5">
                        Vehicle Log <ArrowRight className="w-3 h-3 ml-2" />
                     </Button>
                  </div>
               </Card>
             ))
           }
        </div>
      )}

      {/* TAB: Missions */}
      {tab === 'missions' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['Mission ID', 'Vehicle / Driver', 'Priority', 'Origin → Destination', 'Started', 'Status'].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dbData?.activeMissions.filter(m => m.id.toLowerCase().includes(search.toLowerCase())).map(m => (
                    <tr key={m.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6">
                         <p className="font-bold text-white text-sm">{m.id}</p>
                      </td>
                      <td className="py-4 px-4 text-xs text-white">
                         <p className="font-semibold text-indigo-300">{m.vehicleId}</p>
                         <p className="text-[10px] text-gray-500 font-mono">Driver: {m.driverId}</p>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[9px] px-1.5', statusColor[m.priority])}>
                          {m.priority}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-xs text-white flex items-center gap-2 mt-1">
                         <span className="text-gray-400">{m.origin}</span>
                         <ArrowRight className="w-3 h-3 text-gray-700" />
                         <span className="text-indigo-400 font-medium">{m.destination}</span>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-400 font-mono">{fmtDate(m.startTime)}</td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[9px] px-1.5', statusColor[m.status])}>
                          {m.status}
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

      {/* TAB: Tracking */}
      {tab === 'tracking' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
           <Card className="lg:col-span-2 p-0 border-white/[0.06] bg-black/40 overflow-hidden relative flex items-center justify-center">
              {/* Mock Map Visualization */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                 <Map className="w-full h-full text-indigo-500" />
              </div>
              <div className="relative z-10 text-center p-8">
                 <div className="p-4 bg-indigo-500/10 rounded-full mb-4 mx-auto w-fit">
                    <Zap className="w-10 h-10 text-indigo-400 animate-pulse" />
                 </div>
                 <h2 className="text-xl font-bold text-white mb-2">Live Telematics Stream Active</h2>
                 <p className="text-sm text-gray-500 max-w-sm mb-6 mx-auto leading-relaxed">
                   Visualizing real-time GPS and patient vitals telemetry across 12 active ambulance units.
                 </p>
                 <div className="flex gap-4 justify-center">
                    <Button variant="outline" className="border-white/10 text-gray-400">Expand Map View</Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-500 px-8">Sync Sat-Comm</Button>
                 </div>
              </div>
              
              {/* Floating Map Indicators */}
              <div className="absolute top-4 right-4 space-y-2">
                 <div className="p-2 bg-surface-dark border border-white/10 rounded-lg flex items-center gap-2 shadow-2xl">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-[10px] text-white font-mono">AMB-001: Emergency Mode</span>
                 </div>
                 <div className="p-2 bg-surface-dark border border-white/10 rounded-lg flex items-center gap-2 shadow-2xl">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-white font-mono">AMB-002: Idle (HQ)</span>
                 </div>
              </div>
           </Card>
           
           <div className="space-y-4">
              <Card className="p-5 border-white/[0.06] bg-surface-dark flex flex-col">
                 <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                   <ShieldAlert className="w-4 h-4 text-rose-400" /> Maintenance Alerts
                 </h3>
                 <div className="space-y-3">
                    {dbData?.maintenanceAlerts.map((alert, i) => (
                      <div key={i} className="p-3 bg-rose-500/5 rounded-xl border border-rose-500/10 group hover:border-rose-500/30 transition-colors">
                         <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold text-rose-400 font-mono uppercase">{alert.vehicleId}</span>
                            <span className="text-[9px] text-gray-500 font-mono">Due: {fmtDate(alert.dueDate)}</span>
                         </div>
                         <p className="text-xs text-white leading-tight font-medium">{alert.issue}</p>
                      </div>
                    ))}
                 </div>
              </Card>
              
              <Card className="p-5 border-white/[0.06] bg-surface-dark flex flex-col flex-1">
                 <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                   <TrendingUp className="w-4 h-4 text-indigo-400" /> Dispatch Performance
                 </h3>
                 <div className="space-y-4 flex-1 flex flex-col justify-center">
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px]">
                          <span className="text-gray-500">Target Response Time (8m)</span>
                          <span className="text-emerald-400 font-bold">92%</span>
                       </div>
                       <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: '92%' }} />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px]">
                          <span className="text-gray-500">Payer Authorization Sync</span>
                          <span className="text-indigo-400 font-bold">100%</span>
                       </div>
                       <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{ width: '100%' }} />
                       </div>
                    </div>
                 </div>
              </Card>
           </div>
        </div>
      )}
    </div>
  );
}
