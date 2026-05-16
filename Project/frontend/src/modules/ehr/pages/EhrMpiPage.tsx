'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Search, Link as LinkIcon, GitMerge, ShieldAlert, CheckCircle2, AlertTriangle, Users, FileSignature, Database, Activity, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useMpiRecords, useResolveMpiRecord } from '../hooks/useEhrAnalytics';
import type { MpiRecord } from '../types/ehr.types';

export function EhrMpiPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [localResolutions, setLocalResolutions] = useState<Record<string, string>>({});
  
  const { data: response, isLoading, isRefetching, refetch } = useMpiRecords();
  const resolveMutation = useResolveMpiRecord();
  
  const mpiRecords: MpiRecord[] = response?.data || [];

  const filtered = mpiRecords.filter(r => 
    r.mrn.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.firstName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleResolve = async (id: string, action: 'Merge' | 'Fix') => {
    setLocalResolutions(prev => ({ ...prev, [id]: 'Verified' }));
    try {
      await resolveMutation.mutateAsync({ id, action });
    } catch (e) {
      setLocalResolutions(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const totalIdentities = mpiRecords.length > 0 ? '1.2M' : '-'; // Simulated static metric
  const verifiedPercent = mpiRecords.length > 0 ? '98.5%' : '-';
  const potentialDupsCount = mpiRecords.filter(r => (localResolutions[r.id] || r.status) === 'Potential Duplicate').length;
  const errorCount = mpiRecords.filter(r => (localResolutions[r.id] || r.status) === 'Demographic Error').length;

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Master Patient Index (MPI)</h1>
          <p className="text-gray-400 mt-1 text-sm">Enterprise-wide unique patient identification and demographic reconciliation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-warning/30 text-warning-light hover:bg-warning/10 transition-colors">
            <GitMerge className="w-4 h-4 mr-2" /> Auto-Merge Duplicates
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-500 text-white border-none shadow-lg shadow-blue-900/20">
            <Users className="w-4 h-4 mr-2" /> Register New Identity
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Identities', value: totalIdentities, color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Database },
          { label: 'Verified Records', value: verifiedPercent, color: 'text-success-light', bg: 'bg-success/10', icon: CheckCircle2 },
          { label: 'Potential Duplicates', value: isLoading ? '-' : potentialDupsCount.toLocaleString(), color: 'text-warning-light', bg: 'bg-warning/10', icon: AlertTriangle },
          { label: 'Demographic Errors', value: isLoading ? '-' : errorCount.toLocaleString(), color: 'text-emergency-light', bg: 'bg-emergency/10', icon: ShieldAlert },
        ].map((stat, i) => (
          <Card key={i} className="p-5 border-white/[0.06] bg-surface-dark flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>
                {isLoading ? <Spinner size="sm" className="mt-2" /> : stat.value}
              </p>
            </div>
            <div className={`p-3 rounded-xl shadow-lg ${stat.bg} group-hover:scale-110 transition-transform`}><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
          </Card>
        ))}
      </div>

      <Card className="flex-1 border-white/[0.06] shadow-glass bg-surface-dark flex flex-col relative overflow-hidden">
        <div className="p-5 border-b border-white/[0.04] bg-gradient-to-r from-blue-900/10 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-4 w-full max-w-2xl">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by MRN, Name, or SSN..." 
                className="pl-10 bg-black/40 border-white/10 text-white placeholder:text-gray-600 focus:bg-black/60 transition-colors"
              />
            </div>
            <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isLoading || isRefetching} className="text-gray-400 hover:text-white">
              <RefreshCw className={cn("w-4 h-4", isRefetching && "animate-spin")} />
            </Button>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-gray-400 font-sans px-3.5 py-1.5 bg-white/5 rounded-full border border-white/10 shadow-inner">
            <Activity className="w-3.5 h-3.5 text-success-light animate-pulse" /> HL7 ADT Sync Active
          </div>
        </div>
        
        <div className="flex-1 overflow-auto relative min-h-[400px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-dark/50 backdrop-blur-sm z-20">
              <Spinner size="lg" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Database className="w-12 h-12 text-gray-600 mb-4" />
              <h3 className="text-lg font-bold text-white">No Records Found</h3>
              <p className="text-gray-400 text-sm mt-2 max-w-md">There are no MPI records matching your search criteria. Try a different MRN or name.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-black/40 sticky top-0 backdrop-blur-md z-10 shadow-sm">
                <tr>
                  <th className="py-4 pl-6 text-gray-400 font-semibold uppercase text-[11px] tracking-wider">Patient Name & DOB</th>
                  <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-[11px] tracking-wider">Global MRN</th>
                  <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-[11px] tracking-wider">Origin Facility</th>
                  <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-[11px] tracking-wider">MPI Status</th>
                  <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-[11px] tracking-wider">Confidence</th>
                  <th className="py-4 pr-6 text-gray-400 font-semibold uppercase text-[11px] tracking-wider text-right">Resolution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map(record => {
                  const currentStatus = localResolutions[record.id] || record.status;
                  return (
                    <tr key={record.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-5 pl-6">
                        <p className="font-bold text-white text-[15px]">{record.lastName}, {record.firstName}</p>
                        <p className="text-xs text-gray-500 font-mono mt-1">DOB: {record.dob} • {record.gender}</p>
                      </td>
                      <td className="py-5 px-4">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-blue-500/10 border border-blue-500/20">
                          <FileSignature className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-blue-200 font-mono font-semibold text-xs tracking-wide">{record.mrn}</span>
                        </div>
                      </td>
                      <td className="py-5 px-4 text-gray-400 font-medium">{record.facility}</td>
                      <td className="py-5 px-4">
                        <Badge variant="outline" className={cn(
                          "border-none px-3 py-1.5 shadow-inner transition-colors duration-500",
                          currentStatus === 'Verified' ? 'text-success-light bg-success/15 shadow-success/10' :
                          currentStatus === 'Potential Duplicate' ? 'text-warning-light bg-warning/15 shadow-warning/10 animate-pulse' :
                          'text-emergency-light bg-emergency/15 shadow-emergency/10'
                        )}>
                          {currentStatus}
                        </Badge>
                      </td>
                      <td className="py-5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-20 bg-black/60 rounded-full h-1.5 overflow-hidden shadow-inner">
                            <div className={cn("h-full rounded-full transition-all duration-1000", record.confidenceScore >= 95 ? 'bg-success-light' : 'bg-warning-light')} style={{ width: `${record.confidenceScore}%` }} />
                          </div>
                          <span className="text-xs font-bold text-gray-300">{record.confidenceScore}%</span>
                        </div>
                      </td>
                      <td className="py-5 pr-6 text-right align-middle">
                        {currentStatus === 'Verified' ? (
                          <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="outline" className="h-8 border-white/10 text-gray-400 hover:bg-white/5">
                              <LinkIcon className="w-4 h-4 mr-1.5" /> Linked IDs
                            </Button>
                          </div>
                        ) : currentStatus === 'Potential Duplicate' ? (
                          <div className="flex justify-end animate-in fade-in zoom-in duration-300">
                            <Button size="sm" variant="outline" onClick={() => handleResolve(record.id, 'Merge')} className="h-8 border-warning/40 text-warning-light hover:bg-warning/20 hover:border-warning/60 shadow-[0_0_10px_rgba(251,191,36,0.1)] transition-all">
                              <GitMerge className="w-4 h-4 mr-1.5" /> Review Merge
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end animate-in fade-in zoom-in duration-300">
                            <Button size="sm" variant="outline" onClick={() => handleResolve(record.id, 'Fix')} className="h-8 border-emergency/40 text-emergency-light hover:bg-emergency/20 hover:border-emergency/60 shadow-[0_0_10px_rgba(248,113,113,0.1)] transition-all">
                              <ShieldAlert className="w-4 h-4 mr-1.5" /> Fix Error
                            </Button>
                          </div>
                        )}
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
