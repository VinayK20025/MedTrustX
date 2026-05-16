'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useVaultAccounts, useCheckoutVaultAccount } from '../hooks/usePamAnalytics';
import { Search, Server, KeyRound, Clock, Settings2, ShieldCheck, Database, Terminal, Cloud, RefreshCw, Key, ArrowUpRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export function PamAccessPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading, isRefetching, refetch } = useVaultAccounts();
  const accounts = data?.data || [];
  
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});
  const checkoutMutation = useCheckoutVaultAccount();

  const handleCheckout = async (id: string) => {
    setLocalStatuses(prev => ({ ...prev, [id]: 'checking_out' }));
    try {
      await checkoutMutation.mutateAsync(id);
      setLocalStatuses(prev => ({ ...prev, [id]: 'in_use' }));
    } catch (e) {
      setLocalStatuses(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const filteredAccounts = accounts.filter(acc => 
    acc.system.toLowerCase().includes(searchTerm.toLowerCase()) || 
    acc.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (acc.target && acc.target.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <KeyRound className="w-7 h-7 text-indigo-400" /> Vault Service
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Enterprise Secrets Management and Privileged Identity Vault</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5" onClick={() => refetch()} disabled={isLoading || isRefetching}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isRefetching && "animate-spin")} /> Sync Vault
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white border-none shadow-lg shadow-indigo-900/20">
            <Key className="w-4 h-4 mr-2" /> Vault New Secret
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Vaulted Assets', value: isLoading ? '-' : accounts.length, color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: ShieldCheck },
          { label: 'Currently Checked Out', value: isLoading ? '-' : accounts.filter(a => (localStatuses[a.id] || a.status) === 'in_use').length, color: 'text-warning-light', bg: 'bg-warning/10', icon: ArrowUpRight },
          { label: 'Vault Engine Status', value: isLoading ? '-' : 'Sealed & Active', color: 'text-success-light', bg: 'bg-success/10', icon: KeyRound },
          { label: 'Recent Rotations', value: isLoading ? '-' : '24 (Last 24h)', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: RefreshCw },
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

      <Card className="flex-1 border-white/[0.06] shadow-glass bg-surface-dark flex flex-col relative overflow-hidden min-h-[400px]">
        <div className="p-4 border-b border-white/[0.04] bg-surface-light rounded-t-xl z-10 relative">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search target FQDN, account name, or system..." className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-indigo-500/50" />
          </div>
        </div>
        
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-dark/50 backdrop-blur-sm z-20">
            <Spinner size="lg" />
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-surface-dark">
            <KeyRound className="w-12 h-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-bold text-white">No Vaulted Accounts Found</h3>
            <p className="text-gray-400 text-sm mt-2 max-w-md">There are no vaulted identities matching your search criteria.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto z-10 relative">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-black/40 sticky top-0 backdrop-blur-xl border-b border-white/[0.04] z-20">
                <tr>
                  <th className="py-4 pl-6 text-gray-500 font-semibold uppercase text-[10px] tracking-widest">Target System & Host</th>
                  <th className="py-4 px-4 text-gray-500 font-semibold uppercase text-[10px] tracking-widest">Vaulted Identity</th>
                  <th className="py-4 px-4 text-gray-500 font-semibold uppercase text-[10px] tracking-widest">Protocol & Owner</th>
                  <th className="py-4 px-4 text-gray-500 font-semibold uppercase text-[10px] tracking-widest">Vault Status</th>
                  <th className="py-4 pr-6 text-gray-500 font-semibold uppercase text-[10px] tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {filteredAccounts.map(vault => {
                  const status = localStatuses[vault.id] || vault.status;
                  const isCheckedOut = status === 'in_use';
                  const isProcessing = status === 'checking_out';

                  const ProtocolIcon = 
                    vault.protocol?.includes('Database') ? Database :
                    vault.protocol?.includes('SSH') ? Terminal :
                    vault.protocol?.includes('Web') ? Cloud : Server;

                  return (
                    <tr key={vault.id} className={cn(
                      "transition-colors group",
                      isCheckedOut ? "bg-warning/5 hover:bg-warning/10" : "hover:bg-white/[0.02]"
                    )}>
                      <td className="py-4 pl-6">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "p-2.5 rounded-lg border shadow-lg transition-colors",
                            isCheckedOut ? "bg-warning/10 border-warning/20" : "bg-indigo-500/10 border-indigo-500/20"
                          )}>
                            <ProtocolIcon className={cn("w-5 h-5", isCheckedOut ? "text-warning-light" : "text-indigo-400")} />
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{vault.system}</p>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">{vault.target}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-black/30 border border-white/5 font-mono text-sm">
                          <Key className="w-3.5 h-3.5 text-gray-500" />
                          <span className={isCheckedOut ? "text-warning-light" : "text-fuchsia-400"}>{vault.accountName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-300 text-sm mb-0.5">{vault.protocol}</p>
                        <p className="text-xs text-gray-500">Owned by: {vault.owner}</p>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn(
                          "capitalize px-3 shadow-inner",
                          isProcessing ? "border-indigo-400/30 text-indigo-400 bg-indigo-400/10 animate-pulse" :
                          isCheckedOut ? "border-warning/30 text-warning-light bg-warning/15 shadow-warning/10" : 
                          "border-success/30 text-success-light bg-success/15 shadow-success/10"
                        )}>
                          {isProcessing ? 'Negotiating...' : status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-4 pr-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!isCheckedOut ? (
                            <Button size="sm" variant="outline" onClick={() => handleCheckout(vault.id)} disabled={isProcessing} className="h-8 text-xs border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 transition-colors shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                              {isProcessing ? <Spinner size="sm" className="mr-1" /> : <KeyRound className="w-3.5 h-3.5 mr-1" />} Checkout
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="h-8 text-xs border-warning/30 text-warning-light hover:bg-warning/10 transition-colors shadow-[0_0_10px_rgba(251,191,36,0.1)]">
                              <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> Connect Live
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="h-8 text-xs border-white/10 text-gray-400 hover:bg-white/5 px-2">
                            <Settings2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
