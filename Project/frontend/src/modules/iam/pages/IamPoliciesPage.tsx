'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useIamDashboard, useTogglePolicy, useDeletePolicy } from '../hooks/useIamAnalytics';
import { ShieldAlert, AlertTriangle, Plus, Play, Pause, Trash2, ShieldCheck, BoxSelect, Terminal, FileCode2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { IAMPolicy } from '../types/iam.types';

export function IamPoliciesPage() {
  const { data, isLoading, isRefetching, refetch } = useIamDashboard({ timeframe: 'all' });
  const policies: IAMPolicy[] = data?.data?.policies || [];
  
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});
  const toggleMutation = useTogglePolicy();
  const deleteMutation = useDeletePolicy();

  const handleToggle = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'enforced' ? 'disabled' : 'enforced';
    setLocalStatuses(prev => ({ ...prev, [id]: nextStatus }));
    try {
      await toggleMutation.mutateAsync({ policyId: id, action: nextStatus as any });
    } catch (e) {
      setLocalStatuses(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleDelete = async (id: string) => {
    setLocalStatuses(prev => ({ ...prev, [id]: 'deleting' }));
    try {
      await deleteMutation.mutateAsync(id);
    } catch (e) {
      setLocalStatuses(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const activePolicies = policies.filter(p => (localStatuses[p.id] || p.status) === 'enforced').length;
  const auditPolicies = policies.filter(p => (localStatuses[p.id] || p.status) === 'audit_only').length;

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Terminal className="w-7 h-7 text-teal-400" /> OPA Policy Engine
          </h1>
          <p className="text-gray-400 mt-1">Configure and deploy Open Policy Agent (Rego) conditional access policies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5" onClick={() => refetch()} disabled={isLoading || isRefetching}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isRefetching && "animate-spin")} /> Refresh Engine
          </Button>
          <Button className="bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-900/20 border-none">
            <Plus className="w-4 h-4 mr-2" /> Compile New Policy
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Enforced Rego Policies', value: isLoading ? '-' : activePolicies, color: 'text-success-light', bg: 'bg-success/10', icon: ShieldCheck },
          { label: 'Audit Mode Policies', value: isLoading ? '-' : auditPolicies, color: 'text-warning-light', bg: 'bg-warning/10', icon: BoxSelect },
          { label: 'Engine Health', value: isLoading ? '-' : 'Optimal', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: ActivityIcon },
          { label: 'Execution Time', value: isLoading ? '-' : '1.2ms (Avg)', color: 'text-gray-300', bg: 'bg-white/5', icon: Terminal },
        ].map((stat, i) => (
          <Card key={i} className="p-5 border-white/[0.06] bg-surface-dark flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>
                {isLoading ? <Spinner size="sm" className="mt-2" /> : stat.value}
              </p>
            </div>
            <div className={`p-3 rounded-xl shadow-lg ${stat.bg} group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </Card>
        ))}
      </div>

      <div className="relative flex-1 min-h-[400px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-dark/50 backdrop-blur-sm z-20 rounded-xl border border-white/[0.06]">
            <Spinner size="lg" />
          </div>
        ) : policies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-surface-dark rounded-xl border border-white/[0.06]">
            <FileCode2 className="w-12 h-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-bold text-white">No Rego Policies Found</h3>
            <p className="text-gray-400 text-sm mt-2 max-w-md">There are currently no Open Policy Agent access rules defined in the engine.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {policies.map(policy => {
              const currentStatus = localStatuses[policy.id] || policy.status;
              if (currentStatus === 'deleting') return null;

              return (
                <Card key={policy.id} className={cn(
                  "p-6 border-white/[0.06] shadow-glass flex flex-col md:flex-row gap-6 md:items-center justify-between transition-all duration-300 relative overflow-hidden group",
                  currentStatus === 'enforced' ? "bg-surface-dark hover:bg-white/[0.03]" : "bg-black/40 opacity-80"
                )}>
                  {currentStatus !== 'enforced' && currentStatus !== 'audit_only' && (
                    <div className="absolute inset-0 bg-black/20 z-0 pointer-events-none" />
                  )}
                  
                  <div className="flex items-start gap-4 flex-1 relative z-10">
                    <div className={cn(
                      "p-3 rounded-xl border shrink-0 transition-colors",
                      policy.severity === 'critical' ? 'bg-emergency/20 border-emergency/30 text-emergency-light' : 'bg-warning/20 border-warning/30 text-warning-light'
                    )}>
                      {policy.severity === 'critical' ? (
                        <ShieldAlert className="w-6 h-6" />
                      ) : (
                        <AlertTriangle className="w-6 h-6" />
                      )}
                    </div>
                    
                    <div className="space-y-3 w-full">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-white">{policy.name}</h3>
                        <Badge variant="outline" className={cn(
                          "px-3 py-1 shadow-inner capitalize",
                          currentStatus === 'enforced' ? 'border-success/30 text-success-light bg-success/15 shadow-success/10' :
                          currentStatus === 'audit_only' ? 'border-warning/30 text-warning-light bg-warning/15 shadow-warning/10' :
                          'border-gray-500/30 text-gray-400 bg-gray-500/15 shadow-gray-500/10'
                        )}>
                          {currentStatus === 'audit_only' ? 'Audit Mode' : currentStatus}
                        </Badge>
                        <Badge variant="outline" className={cn(
                          "px-3 py-1 shadow-inner capitalize",
                          policy.severity === 'critical' ? 'border-emergency/30 text-emergency-light bg-emergency/15 shadow-emergency/10' : 'border-warning/30 text-warning-light bg-warning/15 shadow-warning/10'
                        )}>
                          {policy.severity}
                        </Badge>
                      </div>

                      {policy.regoCode ? (
                        <div className="bg-black/60 p-4 rounded-lg border border-white/10 font-mono text-sm text-gray-300 relative group/code">
                          <div className="absolute top-2 right-3 text-[10px] text-teal-400 uppercase tracking-widest font-sans opacity-50">Rego</div>
                          <pre className="whitespace-pre-wrap leading-relaxed"><code dangerouslySetInnerHTML={{ __html: syntaxHighlight(policy.regoCode) }} /></pre>
                        </div>
                      ) : (
                        <div className="bg-black/30 p-3 rounded-lg border border-white/5 font-mono text-sm text-gray-300">
                          <span className="text-teal-400">IF</span> {policy.condition} <span className="text-teal-400">THEN</span> ALLOW
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                        <span className="text-teal-400/70 bg-teal-500/10 px-2 py-0.5 rounded">Affects {policy.affectedRoles} Roles</span>
                        <span>•</span>
                        {policy.version && <span>{policy.version}</span>}
                        {policy.version && <span>•</span>}
                        {policy.author && <span>Authored by {policy.author}</span>}
                        <span>•</span>
                        <span>Updated {new Date(policy.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 md:flex-col lg:flex-row shrink-0 relative z-10">
                    {currentStatus === 'enforced' ? (
                      <Button variant="outline" onClick={() => handleToggle(policy.id, currentStatus)} className="border-warning/30 text-warning-light hover:bg-warning/10 w-full lg:w-auto shadow-[0_0_10px_rgba(251,191,36,0.1)] transition-all">
                        <Pause className="w-4 h-4 mr-2" /> Disable
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={() => handleToggle(policy.id, currentStatus)} className="border-success/30 text-success-light hover:bg-success/10 w-full lg:w-auto shadow-[0_0_10px_rgba(74,222,128,0.1)] transition-all">
                        <Play className="w-4 h-4 mr-2" /> Enforce
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleDelete(policy.id)} className="border-emergency/30 text-emergency-light hover:bg-emergency/10 p-2">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Simple Rego syntax highlighter for demo purposes
function syntaxHighlight(code: string) {
  return code
    .replace(/\b(package|default|allow|deny)\b/g, '<span class="text-teal-400">$1</span>')
    .replace(/(input\.[a-zA-Z_.]+)/g, '<span class="text-blue-300">$1</span>')
    .replace(/(=|==|>=|<=|>|<)/g, '<span class="text-gray-400">$1</span>')
    .replace(/({|})/g, '<span class="text-gray-500">$1</span>')
    .replace(/("[^"]*")/g, '<span class="text-yellow-200">$1</span>')
    .replace(/(true|false)/g, '<span class="text-purple-400">$1</span>');
}

// Ensure Activity icon is defined
function ActivityIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
}
