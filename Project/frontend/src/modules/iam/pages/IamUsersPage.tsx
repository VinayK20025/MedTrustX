'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useIamDashboard, useLockUser, useEnforceMfa } from '../hooks/useIamAnalytics';
import { Search, Filter, Download, Plus, ShieldCheck, ShieldOff, Lock, Unlock, Mail, Building2, MoreVertical } from 'lucide-react';
import { cn } from '@/utils/cn';

const statusCfg: Record<string, { color: string; bg: string }> = {
  active:   { color: 'text-success-light', bg: 'bg-success/15' },
  inactive: { color: 'text-gray-500', bg: 'bg-white/5' },
  locked:   { color: 'text-emergency-light', bg: 'bg-emergency/15' },
  pending:  { color: 'text-warning-light', bg: 'bg-warning/15' },
};

export function IamUsersPage() {
  const { data, isLoading } = useIamDashboard({ timeframe: 'all' });
  const { mutate: lockUser } = useLockUser();
  const { mutate: enforceMfa } = useEnforceMfa();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const identities = data?.data?.identities || [];
  
  const filteredUsers = identities.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Identity Directory</h1>
          <p className="text-gray-400 mt-1 text-sm">Manage user identities, access, and MFA settings</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="text-gray-300 border-white/10 hover:bg-white/5">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button className="bg-teal-600 hover:bg-teal-500 text-white border-none">
            <Plus className="w-4 h-4 mr-2" /> Provision Identity
          </Button>
        </div>
      </div>

      <Card className="flex-1 flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
        <div className="p-4 border-b border-white/[0.04] flex flex-col sm:flex-row gap-4 justify-between bg-surface-light rounded-t-xl">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..." 
              className="pl-10 bg-black/20 border-white/10 focus:border-teal-500 text-white placeholder:text-gray-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-black/20 rounded-lg p-1 border border-white/5">
              {['all', 'active', 'locked', 'pending'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors",
                    statusFilter === s ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <Button variant="outline" size="icon" className="border-white/10 text-gray-400">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <ShieldOff className="w-12 h-12 mb-3 opacity-20" />
              <p>No identities found matching your criteria</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.04] bg-surface-dark/80 sticky top-0 backdrop-blur-md z-10">
                  <th className="py-4 pl-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">User Identity</th>
                  <th className="py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Role & Dept</th>
                  <th className="py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">MFA & Risk</th>
                  <th className="py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Last Login</th>
                  <th className="py-4 pr-6 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {filteredUsers.map(user => {
                  const cfg = statusCfg[user.status] || statusCfg.inactive;
                  return (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/5 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-indigo-300">
                              {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm font-bold text-white block">{user.name}</span>
                            <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3" /> {user.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-300 block">{user.role}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3" /> {user.department}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn("border-none", cfg.bg, cfg.color)}>
                          <span className="capitalize">{user.status}</span>
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center">
                            {user.mfaStatus === 'enabled' ? (
                              <ShieldCheck className="w-5 h-5 text-success-light mb-1" />
                            ) : (
                              <ShieldOff className="w-5 h-5 text-emergency-light mb-1" />
                            )}
                            <span className="text-[10px] text-gray-500 uppercase">MFA</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className={cn(
                              "text-sm font-bold font-mono mb-0.5",
                              user.riskScore > 50 ? "text-emergency-light" : user.riskScore > 20 ? "text-warning-light" : "text-success-light"
                            )}>{user.riskScore}</span>
                            <span className="text-[10px] text-gray-500 uppercase">Risk</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-300 block">
                          {new Date(user.lastLogin).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(user.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="py-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {user.mfaStatus === 'disabled' && (
                            <Button size="sm" variant="outline" onClick={() => enforceMfa(user.id)} className="h-8 text-xs border-warning/30 text-warning-light hover:bg-warning/10">
                              Enforce MFA
                            </Button>
                          )}
                          {user.status === 'locked' ? (
                            <Button size="sm" variant="outline" className="h-8 text-xs border-success/30 text-success-light hover:bg-success/10">
                              <Unlock className="w-3.5 h-3.5 mr-1" /> Unlock
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => lockUser(user.id)} className="h-8 text-xs border-emergency/30 text-emergency-light hover:bg-emergency/10">
                              <Lock className="w-3.5 h-3.5 mr-1" /> Lock
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-white">
                            <MoreVertical className="w-4 h-4" />
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
