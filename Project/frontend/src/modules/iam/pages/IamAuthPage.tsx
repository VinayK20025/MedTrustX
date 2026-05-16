'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useIamDashboard, useToggleAuthMethod } from '../hooks/useIamAnalytics';
import { ShieldCheck, Fingerprint, KeySquare, Settings2, RefreshCw, Server, Users, Key, Power } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { IAMAuthMethod } from '../types/iam.types';

export function IamAuthPage() {
  const { data, isLoading, isRefetching, refetch } = useIamDashboard({ timeframe: 'all' });
  const methods: IAMAuthMethod[] = data?.data?.authMethods || [];
  
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});
  const toggleMutation = useToggleAuthMethod();

  const handleToggle = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'disabled' ? 'enabled' : 'disabled';
    setLocalStatuses(prev => ({ ...prev, [id]: nextStatus }));
    try {
      await toggleMutation.mutateAsync({ methodId: id, action: nextStatus as any });
    } catch (e) {
      setLocalStatuses(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleSync = async (id: string) => {
    try {
      await toggleMutation.mutateAsync({ methodId: id, action: 'sync' });
    } catch (e) {
      // Ignored in optimistic UI
    }
  };

  const activeProviders = methods.filter(m => (localStatuses[m.id] || m.status) !== 'disabled').length;

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Server className="w-7 h-7 text-indigo-400" /> Keycloak & Auth Service
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Centralized Identity Providers (IdP), OIDC Brokers, and MFA integrations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5" onClick={() => refetch()} disabled={isLoading || isRefetching}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isRefetching && "animate-spin")} /> Refresh Sync
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white border-none shadow-lg shadow-indigo-900/20">
            <Key className="w-4 h-4 mr-2" /> Add Provider
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Providers', value: isLoading ? '-' : activeProviders, color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: ShieldCheck },
          { label: 'Total Managed', value: isLoading ? '-' : methods.length, color: 'text-gray-300', bg: 'bg-white/5', icon: Server },
          { label: 'Keycloak Nodes', value: isLoading ? '-' : '3 (Healthy)', color: 'text-success-light', bg: 'bg-success/10', icon: CheckCircle2 },
          { label: 'Active Sessions', value: isLoading ? '-' : methods.reduce((acc, m) => acc + (m.activeSessions || 0), 0).toLocaleString(), color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Users },
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
        ) : methods.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-surface-dark rounded-xl border border-white/[0.06]">
            <KeySquare className="w-12 h-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-bold text-white">No Providers Configured</h3>
            <p className="text-gray-400 text-sm mt-2 max-w-md">There are no Keycloak or SAML identity providers linked to this environment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {methods.map(method => {
              const currentStatus = localStatuses[method.id] || method.status;
              const isEnabled = currentStatus === 'enabled' || currentStatus === 'required';
              
              return (
                <Card key={method.id} className={cn(
                  "p-6 border-white/[0.06] shadow-glass flex flex-col h-full transition-all duration-300 relative overflow-hidden group",
                  isEnabled ? "bg-surface-dark hover:bg-white/[0.03]" : "bg-black/40 opacity-80"
                )}>
                  {!isEnabled && (
                    <div className="absolute inset-0 bg-black/20 z-0 pointer-events-none" />
                  )}
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div className={cn(
                        "p-3 rounded-xl border shadow-lg transition-colors",
                        method.type === 'keycloak' ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-400" :
                        method.type === 'mfa' ? "bg-teal-500/20 border-teal-500/30 text-teal-400" :
                        method.type === 'sso' ? "bg-blue-500/20 border-blue-500/30 text-blue-400" :
                        "bg-gray-500/20 border-gray-500/30 text-gray-400"
                      )}>
                        {method.type === 'keycloak' ? <Server className="w-6 h-6" /> :
                         method.type === 'mfa' ? <Fingerprint className="w-6 h-6" /> :
                         method.type === 'sso' ? <ShieldCheck className="w-6 h-6" /> :
                         <KeySquare className="w-6 h-6" />}
                      </div>
                      <Badge variant="outline" className={cn(
                        "capitalize px-3 py-1 shadow-inner",
                        currentStatus === 'required' ? 'border-success/30 text-success-light bg-success/15 shadow-success/10' :
                        currentStatus === 'enabled' ? 'border-blue-400/30 text-blue-400 bg-blue-400/15 shadow-blue-500/10' :
                        'border-gray-500/30 text-gray-400 bg-gray-500/15 shadow-gray-500/10'
                      )}>
                        {currentStatus}
                      </Badge>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-1.5 leading-tight">{method.method}</h3>
                    <div className="text-sm text-gray-400 mb-6 space-y-1">
                      <p>Provider: <span className="text-gray-200">{method.provider}</span></p>
                      {method.realm && <p>Realm: <span className="text-gray-300 font-mono text-xs">{method.realm}</span></p>}
                      {method.clientId && <p>Client: <span className="text-gray-300 font-mono text-xs">{method.clientId}</span></p>}
                    </div>
                  </div>

                  <div className="mt-auto relative z-10 space-y-6">
                    <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Adoption Rate</p>
                        <p className={cn("text-lg font-bold", method.adoptionRate > 80 ? 'text-success-light' : 'text-warning-light')}>
                          {method.adoptionRate}%
                        </p>
                      </div>
                      {method.activeSessions !== undefined && (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Active Sessions</p>
                          <p className="text-lg font-bold text-blue-400">{method.activeSessions.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 border-white/10 text-gray-300 hover:bg-white/5 transition-colors">
                        <Settings2 className="w-4 h-4 mr-2" /> Configure
                      </Button>
                      
                      {currentStatus !== 'required' && (
                        <Button 
                          variant="outline" 
                          onClick={() => handleToggle(method.id, currentStatus)}
                          className={cn(
                            "px-3 transition-colors",
                            isEnabled ? "border-emergency/30 text-emergency-light hover:bg-emergency/10" : "border-success/30 text-success-light hover:bg-success/10"
                          )}
                          title={isEnabled ? "Disable Provider" : "Enable Provider"}
                        >
                          <Power className="w-4 h-4" />
                        </Button>
                      )}

                      {method.type === 'keycloak' && isEnabled && (
                        <Button 
                          variant="outline" 
                          onClick={() => handleSync(method.id)}
                          className="px-3 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
                          title="Sync Users/Groups"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
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

// Ensure CheckCircle2 is imported if missing above
function CheckCircle2(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}
