'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { GlobalPolicy } from '../types/superAdmin.types';
import { useApplyPolicy } from '../hooks/useSuperAdminAnalytics';
import { Shield, CheckCircle2, Eye, XCircle, Clock, Plus, Filter, Tag } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { policies: GlobalPolicy[]; }

const statusCfg: Record<string, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  enforced:       { icon: CheckCircle2, color: 'text-success-light', bg: 'bg-success/15' },
  audit_only:     { icon: Eye, color: 'text-warning-light', bg: 'bg-warning/15' },
  disabled:       { icon: XCircle, color: 'text-gray-500', bg: 'bg-white/5' },
  pending_review: { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/15' },
};

const severityColors: Record<string, string> = {
  critical: 'bg-emergency/20 text-emergency-light border-emergency/30',
  high: 'bg-warning/20 text-warning-light border-warning/30',
  medium: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  low: 'bg-white/5 text-gray-400 border-white/10',
};

const categoryCfg: Record<string, string> = {
  security: 'text-emergency-light', compliance: 'text-warning-light',
  access_control: 'text-indigo-400', data_governance: 'text-teal-400', operational: 'text-gray-400',
};

export function SuperAdminPolicyPanel({ policies }: Props) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const { mutate: applyPolicy, isPending } = useApplyPolicy();

  const categories = ['all', ...new Set(policies.map(p => p.category))];
  const filtered = categoryFilter === 'all' ? policies : policies.filter(p => p.category === categoryFilter);

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-teal-500/15"><Shield className="w-4 h-4 text-teal-400" /></div>
          <div>
            <h3 className="text-[15px] font-bold text-white tracking-wide">Global Policy Engine</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">{policies.filter(p => p.status === 'enforced').length} enforced · {policies.length} total</p>
          </div>
        </div>
        <Button size="sm" leftIcon={<Plus className="w-3 h-3" />} className="bg-teal-600 hover:bg-teal-500 border-none text-white font-bold">
          New Policy
        </Button>
      </CardHeader>

      {/* Category filters */}
      <div className="px-4 py-2.5 border-b border-white/[0.03] flex items-center gap-2 overflow-x-auto no-scrollbar">
        <Filter className="w-3 h-3 text-gray-500 flex-shrink-0" />
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategoryFilter(cat)}
            className={cn('text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md transition-all whitespace-nowrap',
              categoryFilter === cat ? 'bg-teal-500/20 text-teal-400' : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'
            )}>
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[500px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.04] bg-surface-dark/50 sticky top-0 z-10">
              <th className="py-3 text-[9px] font-bold text-gray-500 uppercase tracking-widest pl-5">Policy</th>
              <th className="py-3 text-[9px] font-bold text-gray-500 uppercase tracking-widest text-center">Severity</th>
              <th className="py-3 text-[9px] font-bold text-gray-500 uppercase tracking-widest text-center">Scope</th>
              <th className="py-3 text-[9px] font-bold text-gray-500 uppercase tracking-widest text-center">Coverage</th>
              <th className="py-3 text-[9px] font-bold text-gray-500 uppercase tracking-widest text-right pr-5">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const sCfg = statusCfg[p.status] || statusCfg.enforced;
              const SIcon = sCfg.icon;
              return (
                <tr key={p.id} className="border-b border-white/[0.02] last:border-0 hover:bg-white/[0.015] transition-colors group cursor-pointer">
                  <td className="py-3.5 pl-5 max-w-[280px]">
                    <span className="text-[12px] font-bold text-white block truncate">{p.name}</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[9px] font-mono text-gray-600">{p.id}</span>
                      <span className={cn('text-[9px] font-bold', categoryCfg[p.category] || 'text-gray-500')}>
                        {p.category.replace('_', ' ')}
                      </span>
                    </div>
                    {p.tags.length > 0 && (
                      <div className="flex items-center gap-1 mt-1.5">
                        {p.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[8px] font-bold text-gray-500 bg-white/[0.04] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Tag className="w-2 h-2" />{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 text-center">
                    <span className={cn('text-[9px] uppercase font-bold px-2 py-1 rounded border tracking-wider', severityColors[p.severity])}>
                      {p.severity}
                    </span>
                  </td>
                  <td className="py-3.5 text-center">
                    <span className={cn('text-[9px] uppercase font-bold px-2 py-1 rounded tracking-wider',
                      p.scope === 'global' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-gray-400'
                    )}>
                      {p.scope.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-[11px] font-bold text-white">{p.affectedTenants}/{p.totalTenants}</span>
                      <div className="w-12 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full" style={{ width: `${(p.affectedTenants / p.totalTenants) * 100}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 text-right pr-5">
                    <span className={cn('text-[9px] uppercase font-bold px-2.5 py-1 rounded tracking-wider inline-flex items-center gap-1', sCfg.bg, sCfg.color)}>
                      <SIcon className="w-3 h-3" />
                      {p.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}
