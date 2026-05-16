'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { 
  Store, Briefcase, FileText, Star, ShieldCheck,
  Search, RefreshCw, AlertCircle, Clock, 
  ArrowRight, Users, ChevronRight, TrendingUp,
  DollarSign, Package, Laptop, Activity,
  Calendar, CheckCircle2, MoreHorizontal, Filter,
  Building2, ExternalLink, Mail, Phone
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { 
  useVendorDashboard, 
  useUpdateVendorStatus 
} from '../hooks/useVendor';

type Tab = 'directory' | 'contracts' | 'performance';

const statusColor: Record<string, string> = {
  'Active': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Under Review': 'text-amber-400 bg-amber-500/10 border-amber-500/30 animate-pulse',
  'Onboarding': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  'Suspended': 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  'Expiring Soon': 'text-amber-500 bg-amber-600/10 border-amber-600/30 font-bold',
  'Expired': 'text-rose-500 bg-rose-600/10 border-rose-600/30',
};

const categoryIcon = (cat: string) => {
  switch (cat) {
    case 'Medical Supplies': return <Package className="w-4 h-4 text-emerald-400" />;
    case 'IT Services': return <Laptop className="w-4 h-4 text-indigo-400" />;
    case 'Pharmaceuticals': return <Activity className="w-4 h-4 text-rose-400" />;
    default: return <Briefcase className="w-4 h-4 text-gray-400" />;
  }
};

const fmtDate = (iso: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function VendorDashboard() {
  const { data, isLoading, isRefetching, refetch } = useVendorDashboard();
  const updateVendor = useUpdateVendorStatus();

  const [tab, setTab] = useState<Tab>('directory');
  const [search, setSearch] = useState('');

  const dbData = data?.data;
  const metrics = dbData?.metrics;

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'directory', label: 'Vendor Directory', icon: Briefcase },
    { key: 'contracts', label: 'Contract Registry', icon: FileText },
    { key: 'performance', label: 'SLA Performance', icon: Star },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Store className="w-7 h-7 text-indigo-400" /> Vendor Command Center
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Institutional Supply Chain · Contract Lifecycle · Vendor Performance Sync
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} /> Refresh
          </Button>
          <Button variant="outline" className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
             New Vendor Onboarding
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Active Vendors', value: metrics?.totalActiveVendors, color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: Building2 },
          { label: 'Expiring Contracts', value: metrics?.contractsExpiring90Days, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Calendar },
          { label: 'SLA Compliance', value: `${metrics?.averageSLACompliancePercent}%`, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
          { label: 'Critical Vendors', value: metrics?.criticalVendorsCount, color: 'text-rose-400', bg: 'bg-rose-500/10', icon: AlertCircle },
          { label: 'Pending Audits', value: metrics?.pendingAuditsCount, color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: ShieldCheck },
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

      {/* TAB: Directory */}
      {tab === 'directory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {isLoading ? <div className="flex justify-center p-16 col-span-full"><Spinner size="lg" /></div> : 
             dbData?.topVendors.filter(v => v.name.toLowerCase().includes(search.toLowerCase())).map(v => (
               <Card key={v.id} className="p-5 border-white/[0.06] bg-surface-dark flex flex-col group hover:border-indigo-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                       {categoryIcon(v.category)}
                       <Badge variant="outline" className="text-[9px] bg-white/5 border-white/10 text-gray-500 font-mono">
                         {v.category}
                       </Badge>
                    </div>
                    <Badge variant="outline" className={cn('text-[9px] px-1.5', statusColor[v.status])}>
                      {v.status}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-white text-base mb-1 group-hover:text-indigo-400 transition-colors leading-tight">{v.name}</h3>
                  <p className="text-[11px] text-gray-500 mb-4 flex items-center gap-2">
                     <Users className="w-3 h-3" /> {v.contactPerson}
                  </p>
                  
                  <div className="bg-black/20 p-3 rounded-xl border border-white/5 mb-4 space-y-2">
                     <div className="flex items-center justify-between">
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest">Rating</p>
                        <div className="flex items-center gap-0.5">
                           {[1, 2, 3, 4, 5].map(s => (
                             <Star key={s} className={cn('w-2.5 h-2.5', s <= Math.floor(v.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-700')} />
                           ))}
                           <span className="text-[10px] text-white ml-1">{v.rating}</span>
                        </div>
                     </div>
                     <div className="flex items-center justify-between">
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest">Last Audit</p>
                        <p className="text-[10px] text-white font-mono">{fmtDate(v.lastAuditDate)}</p>
                     </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                     <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-500 hover:text-white hover:bg-white/5">
                           <Mail className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-500 hover:text-white hover:bg-white/5">
                           <Phone className="w-3.5 h-3.5" />
                        </Button>
                     </div>
                     <Button size="sm" variant="ghost" className="h-7 text-[11px] text-indigo-400 hover:bg-white/5">
                        Vendor File <ExternalLink className="w-3 h-3 ml-2" />
                     </Button>
                  </div>
               </Card>
             ))
           }
        </div>
      )}

      {/* TAB: Contracts */}
      {tab === 'contracts' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['Contract ID / Title', 'Vendor', 'Value', 'Duration', 'SLA %', 'Status'].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dbData?.expiringContracts.map(c => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6">
                         <p className="font-bold text-white text-sm">{c.title}</p>
                         <p className="text-[10px] text-gray-600">{c.id}</p>
                      </td>
                      <td className="py-4 px-4 text-xs text-white">
                         <p className="font-semibold">{c.vendorName}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-xs font-bold text-emerald-400 font-mono">${c.value.toLocaleString()}</p>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-400 font-mono">
                         {new Date(c.startDate).getFullYear()} - {new Date(c.endDate).getFullYear()}
                      </td>
                      <td className="py-4 px-4">
                         <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 w-16 bg-white/5 rounded-full overflow-hidden">
                               <div className={cn('h-full transition-all', c.slaCompliancePercent > 95 ? 'bg-emerald-500' : 'bg-amber-500')} 
                                    style={{ width: `${c.slaCompliancePercent}%` }} />
                            </div>
                            <span className="text-[10px] text-white font-mono">{c.slaCompliancePercent}%</span>
                         </div>
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

      {/* TAB: Performance */}
      {tab === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Card className="p-6 border-white/[0.06] bg-surface-dark flex flex-col">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-indigo-400" /> Vendor Performance Scorecard
              </h3>
              <div className="space-y-4">
                 {dbData?.topVendors.map((vendor, i) => (
                   <div key={i} className="p-4 bg-black/20 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-indigo-500/10 transition-colors">
                            {categoryIcon(vendor.category)}
                         </div>
                         <div>
                            <p className="text-sm font-bold text-white">{vendor.name}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-tighter">SLA Compliance: {vendor.rating * 20}%</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                         <span className="text-sm font-bold text-white">{vendor.rating} / 5.0</span>
                      </div>
                   </div>
                 ))}
              </div>
              <Button className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 h-11 text-sm shadow-lg shadow-indigo-900/40">
                 Detailed SLA Audit <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
           </Card>
           
           <Card className="p-8 border-white/[0.06] bg-surface-dark flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-indigo-500/10 rounded-full mb-4">
                 <ShieldCheck className="w-10 h-10 text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Vendor Compliance & Audit</h2>
              <p className="text-sm text-gray-500 max-w-sm mb-8 leading-relaxed">
                Visualizing institutional vendor risk profiles, security audit statuses, and regulatory compliance (ISO, SOC2).
              </p>
              <div className="grid grid-cols-2 gap-4 w-full mb-8">
                 <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Pass Audit Rate</p>
                    <p className="text-sm font-bold text-emerald-400">94.2%</p>
                 </div>
                 <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Active Breaches</p>
                    <p className="text-sm font-bold text-rose-400">0</p>
                 </div>
              </div>
              <div className="flex gap-4 w-full">
                 <Button variant="outline" className="flex-1 border-white/10 text-gray-400">Audit Registry</Button>
                 <Button className="flex-1 bg-indigo-600 hover:bg-indigo-500">Compliance Sync</Button>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
}
