'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Spinner } from '@/components/ui/Spinner';
import { Search, ShieldCheck, Filter, FileText, CheckCircle2, AlertTriangle, Eye, XCircle, RefreshCw, Hand } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useDpoDashboard, useUpdateConsentStatus } from '../hooks/useDpoAnalytics';
import type { ConsentRecord } from '../types/dpo.types';

export function DpoConsentPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});
  
  const { data: dashboardData, isLoading, isRefetching, refetch } = useDpoDashboard();
  const consentMutation = useUpdateConsentStatus();
  
  const consents: ConsentRecord[] = dashboardData?.data?.consentRecords || [];
  
  const filtered = consents.filter(c => 
    c.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = async (id: string, newStatus: string) => {
    setLocalStatuses(prev => ({ ...prev, [id]: newStatus }));
    try {
      await consentMutation.mutateAsync({ id, status: newStatus });
    } catch (e) {
      setLocalStatuses(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const activeCount = consents.filter(c => c.status === 'Active').length;
  const withdrawnCount = consents.filter(c => c.status === 'Withdrawn').length;
  const expiredCount = consents.filter(c => c.status === 'Expired').length;

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] h-full flex flex-col">
      <Breadcrumbs items={[{ label: 'Data Protection' }, { label: 'Consent Management' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Consent Management Service</h1>
          <p className="text-gray-400 mt-1 text-sm">Centralized registry for HIPAA, GDPR, and enterprise privacy consent mandates</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5" onClick={() => refetch()} disabled={isLoading || isRefetching}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isRefetching && "animate-spin")} /> Refresh
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white border-none shadow-lg shadow-indigo-900/20">
            <FileText className="w-4 h-4 mr-2" /> Export Audit Log
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Consents', value: isLoading ? '-' : activeCount.toLocaleString(), color: 'text-success-light', bg: 'bg-success/10', icon: CheckCircle2 },
          { label: 'Recently Withdrawn', value: isLoading ? '-' : withdrawnCount.toLocaleString(), color: 'text-warning-light', bg: 'bg-warning/10', icon: AlertTriangle },
          { label: 'Expired Agreements', value: isLoading ? '-' : expiredCount.toLocaleString(), color: 'text-emergency-light', bg: 'bg-emergency/10', icon: XCircle },
          { label: 'Total Tracked', value: isLoading ? '-' : consents.length.toLocaleString(), color: 'text-blue-400', bg: 'bg-blue-500/10', icon: ShieldCheck },
        ].map((stat, i) => (
          <Card key={i} className="p-5 border-white/[0.06] bg-surface-dark flex items-center justify-between hover:bg-white/[0.02] transition-colors">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>
                {isLoading ? <Spinner size="sm" className="mt-2" /> : stat.value}
              </p>
            </div>
            <div className={`p-3 rounded-xl shadow-lg ${stat.bg}`}><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
          </Card>
        ))}
      </div>

      <Card className="flex-1 border-white/[0.06] shadow-glass bg-surface-dark flex flex-col relative overflow-hidden">
        <div className="p-5 border-b border-white/[0.04] bg-gradient-to-r from-indigo-900/20 to-transparent flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Patient Name, MRN or Category..." 
              className="pl-10 bg-black/40 border-white/10 text-white placeholder:text-gray-600 focus:bg-black/60 transition-colors"
            />
          </div>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Filter className="w-4 h-4 mr-2" /> Filters
          </Button>
        </div>
        
        <div className="flex-1 overflow-auto relative min-h-[400px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-dark/50 backdrop-blur-sm z-20">
              <Spinner size="lg" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <FileText className="w-12 h-12 text-gray-600 mb-4" />
              <h3 className="text-lg font-bold text-white">No Consents Found</h3>
              <p className="text-gray-400 text-sm mt-2 max-w-md">There are no consent records matching your current search criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-black/40 sticky top-0 backdrop-blur-md z-10 shadow-sm">
                <tr>
                  <th className="py-4 pl-6 text-gray-400 font-semibold uppercase text-[11px] tracking-wider">Data Subject</th>
                  <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-[11px] tracking-wider">Processing Category</th>
                  <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-[11px] tracking-wider">Purpose & Scope</th>
                  <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-[11px] tracking-wider">Lifecycle Status</th>
                  <th className="py-4 pr-6 text-gray-400 font-semibold uppercase text-[11px] tracking-wider text-right">Audit Trail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map(consent => {
                  const status = localStatuses[consent.id] || consent.status;
                  return (
                    <tr key={consent.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-5 pl-6 align-top">
                        <p className="font-bold text-white text-[15px]">{consent.patientName}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] text-gray-400 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10">{consent.mrn}</span>
                          <span className="text-[10px] text-indigo-400 uppercase tracking-wide">{consent.subjectType}</span>
                        </div>
                      </td>
                      <td className="py-5 px-4 align-top">
                        <p className="text-gray-300 font-medium">{consent.category}</p>
                        <p className="text-xs text-indigo-400 font-mono mt-1.5 bg-indigo-500/10 inline-block px-2 py-0.5 rounded">Policy: {consent.version}</p>
                      </td>
                      <td className="py-5 px-4 align-top max-w-xs">
                        <p className="text-gray-200 font-medium mb-1">{consent.purpose}</p>
                        <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2" title={consent.scope}>{consent.scope}</p>
                      </td>
                      <td className="py-5 px-4 align-top">
                        <div className="flex flex-col gap-2 items-start">
                          <Badge variant="outline" className={cn(
                            "border-none px-3 py-1 shadow-inner",
                            status === 'Active' ? 'text-success-light bg-success/15 shadow-success/10' :
                            status === 'Withdrawn' ? 'text-warning-light bg-warning/15 shadow-warning/10' :
                            status === 'Pending' ? 'text-blue-400 bg-blue-500/15 shadow-blue-500/10' :
                            'text-emergency-light bg-emergency/15 shadow-emergency/10'
                          )}>
                            {status.toUpperCase()}
                          </Badge>
                          <div className="text-[10px] text-gray-500 flex flex-col gap-0.5">
                            <span>Since: {new Date(consent.consentDate).toLocaleDateString()}</span>
                            {consent.expiryDate && <span>Exp: {new Date(consent.expiryDate).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-5 pr-6 text-right align-middle">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {status === 'Active' && (
                            <Button size="sm" variant="outline" className="h-8 border-warning/30 text-warning-light hover:bg-warning/10" onClick={() => handleStatusChange(consent.id, 'Withdrawn')}>
                              <Hand className="w-3.5 h-3.5 mr-1.5" /> Revoke
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="h-8 border-white/10 text-gray-400 hover:bg-white/5">
                            <Eye className="w-4 h-4 mr-1.5" /> Receipt
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
