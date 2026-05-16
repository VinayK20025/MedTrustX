'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { TenantInfo } from '../types/superAdmin.types';
import { useSuspendTenant } from '../hooks/useSuperAdminAnalytics';
import {
  Building2, CheckCircle2, PauseCircle, Wrench, Loader2, Search,
  Users, Shield, Clock, MapPin, ChevronRight, Plus, Activity,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { tenants: TenantInfo[]; }

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; bg: string; label: string }> = {
  active:       { icon: CheckCircle2, color: 'text-success-light', bg: 'bg-success/15', label: 'Active' },
  suspended:    { icon: PauseCircle, color: 'text-emergency-light', bg: 'bg-emergency/15', label: 'Suspended' },
  maintenance:  { icon: Wrench, color: 'text-warning-light', bg: 'bg-warning/15', label: 'Maintenance' },
  provisioning: { icon: Loader2, color: 'text-blue-400', bg: 'bg-blue-500/15', label: 'Provisioning' },
};

export function SuperAdminTenantPanel({ tenants }: Props) {
  const [search, setSearch] = useState('');
  const { mutate: suspend, isPending } = useSuspendTenant();
  const filtered = tenants.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.code.toLowerCase().includes(search.toLowerCase()) ||
    t.region.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/15"><Building2 className="w-4 h-4 text-indigo-400" /></div>
          <div>
            <h3 className="text-[15px] font-bold text-white tracking-wide">Tenant Registry</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">{tenants.length} organizations · {tenants.filter(t => t.status === 'active').length} active</p>
          </div>
        </div>
        <Button size="sm" leftIcon={<Plus className="w-3 h-3" />} className="bg-indigo-600 hover:bg-indigo-500 border-none text-white font-bold">
          Provision
        </Button>
      </CardHeader>

      <div className="px-4 py-3 border-b border-white/[0.03]">
        <Input
          placeholder="Search tenants by name, code, or region..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 text-sm bg-surface-dark border-white/[0.06]"
          leftIcon={<Search className="w-3.5 h-3.5 text-gray-500" />}
        />
      </div>

      <CardBody className="p-3 flex-1 overflow-y-auto space-y-2.5 max-h-[500px]">
        {filtered.map(t => {
          const cfg = statusConfig[t.status] || statusConfig.active;
          const StatusIcon = cfg.icon;
          return (
            <div key={t.id} className={cn(
              'p-4 rounded-xl border transition-all duration-200 hover:bg-white/[0.02] group cursor-pointer',
              t.status === 'active' ? 'border-white/[0.06] bg-surface-dark' :
              t.status === 'maintenance' ? 'border-warning/25 bg-warning/[0.03]' :
              t.status === 'suspended' ? 'border-emergency/25 bg-emergency/[0.03]' :
              'border-blue-500/25 bg-blue-500/[0.03]'
            )}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={cn('p-2 rounded-full mt-0.5', cfg.bg)}>
                    <StatusIcon className={cn('w-4 h-4', cfg.color, t.status === 'provisioning' && 'animate-spin')} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">{t.name}</span>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-gray-500 bg-white/[0.04] px-1.5 py-0.5 rounded">{t.code}</span>
                      <span className="text-[10px] text-gray-500 flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{t.region}</span>
                      <span className={cn('text-[9px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wider', cfg.bg, cfg.color)}>{cfg.label}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all mt-1" />
              </div>

              <div className="grid grid-cols-4 gap-3 mt-4 pt-3 border-t border-white/[0.04]">
                <div>
                  <span className="text-[9px] text-gray-600 uppercase tracking-widest font-bold block">Users</span>
                  <span className="text-sm font-bold text-white flex items-center gap-1"><Users className="w-3 h-3 text-gray-500" />{t.users.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-600 uppercase tracking-widest font-bold block">Compliance</span>
                  <span className={cn('text-sm font-bold', t.compliance >= 95 ? 'text-success-light' : t.compliance >= 90 ? 'text-warning-light' : 'text-emergency-light')}>
                    <Shield className="w-3 h-3 inline mr-0.5" />{t.compliance}%
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-600 uppercase tracking-widest font-bold block">Uptime</span>
                  <span className={cn('text-sm font-bold', t.uptime >= 99.9 ? 'text-success-light' : 'text-warning-light')}>
                    <Activity className="w-3 h-3 inline mr-0.5" />{t.uptime}%
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-600 uppercase tracking-widest font-bold block">License</span>
                  <span className={cn('text-sm font-bold', t.licenseLevel === 'Enterprise' ? 'text-indigo-400' : t.licenseLevel === 'Premium' ? 'text-teal-400' : 'text-gray-400')}>{t.licenseLevel}</span>
                </div>
              </div>

              {t.status === 'active' && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <Clock className="w-3 h-3" />
                    MFA: <span className={cn('font-bold', t.mfaEnforced ? 'text-success-light' : 'text-warning-light')}>{t.mfaEnforced ? 'Enforced' : 'Optional'}</span>
                    <span className="mx-1 text-gray-700">·</span>
                    Modules: <span className="font-bold text-gray-300">{t.modules.length}</span>
                  </div>
                  <Button size="xs" variant="outline" className="h-6 text-[10px] border-white/10 hover:bg-white/5">Manage</Button>
                </div>
              )}
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
