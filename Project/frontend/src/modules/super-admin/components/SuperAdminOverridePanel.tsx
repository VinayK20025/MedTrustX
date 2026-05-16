'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { SystemOverride } from '../types/superAdmin.types';
import { useRevokeOverride } from '../hooks/useSuperAdminAnalytics';
import { Zap, ShieldOff, Clock, Users, AlertTriangle, Shield } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { overrides: SystemOverride[]; }

const riskColors: Record<string, { border: string; bg: string; text: string }> = {
  critical: { border: 'border-emergency/40', bg: 'bg-emergency/10', text: 'text-emergency-light' },
  high:     { border: 'border-warning/40', bg: 'bg-warning/10', text: 'text-warning-light' },
  medium:   { border: 'border-blue-500/40', bg: 'bg-blue-500/10', text: 'text-blue-300' },
  low:      { border: 'border-white/10', bg: 'bg-white/[0.03]', text: 'text-gray-400' },
};

const statusColors: Record<string, string> = {
  active: 'bg-emergency/20 text-emergency-light', revoked: 'bg-white/5 text-gray-500',
  expired: 'bg-white/5 text-gray-600', pending_approval: 'bg-warning/20 text-warning-light',
};

const categoryIcons: Record<string, string> = {
  access_control: '🔐', rate_limit: '⚡', feature_flag: '🚩', maintenance: '🔧', emergency: '🚨',
};

export function SuperAdminOverridePanel({ overrides }: Props) {
  const activeOverrides = overrides.filter(o => o.status === 'active');
  const { mutate: revoke, isPending } = useRevokeOverride();

  return (
    <Card className={cn(
      'shadow-glass h-full flex flex-col bg-surface-light',
      activeOverrides.length > 0 ? 'border-emergency/40 shadow-glow-emergency' : 'border-white/[0.06]'
    )}>
      <CardHeader className={cn(
        'border-b px-5 py-4 flex items-center justify-between',
        activeOverrides.length > 0 ? 'border-emergency/20 bg-emergency/[0.04]' : 'border-white/[0.04]'
      )}>
        <div className="flex items-center gap-2.5">
          <div className={cn('p-2 rounded-lg', activeOverrides.length > 0 ? 'bg-emergency/20' : 'bg-white/5')}>
            <Zap className={cn('w-4 h-4', activeOverrides.length > 0 ? 'text-emergency-light animate-pulse' : 'text-gray-400')} />
          </div>
          <div>
            <h3 className={cn('text-[15px] font-bold tracking-wide', activeOverrides.length > 0 ? 'text-emergency-light' : 'text-white')}>
              Override Console
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {activeOverrides.length > 0
                ? <span className="text-emergency-light font-bold">{activeOverrides.length} ACTIVE OVERRIDE{activeOverrides.length > 1 ? 'S' : ''}</span>
                : 'No active overrides'}
            </p>
          </div>
        </div>
        <Button size="sm" variant="danger" leftIcon={<ShieldOff className="w-3 h-3" />} className="font-bold">
          New Override
        </Button>
      </CardHeader>

      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[500px]">
        {overrides.map(ovr => {
          const risk = riskColors[ovr.riskLevel] || riskColors.low;
          return (
            <div key={ovr.id} className={cn(
              'p-4 rounded-xl border flex flex-col gap-3 transition-all',
              ovr.status === 'active' ? cn(risk.border, risk.bg) : 'border-white/[0.06] bg-surface-dark opacity-60'
            )}>
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{categoryIcons[ovr.category] || '⚙️'}</span>
                    <span className="text-sm font-bold text-white truncate">{ovr.targetSystem}</span>
                  </div>
                  <span className="text-[11px] text-gray-400 block">{ovr.targetTenant}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', statusColors[ovr.status])}>
                    {ovr.status.replace('_', ' ')}
                  </span>
                  <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider border', risk.border, risk.text, risk.bg)}>
                    {ovr.riskLevel}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-1.5">
                <p className="text-[12px] text-gray-300"><strong className="text-gray-400">Reason:</strong> {ovr.reason}</p>
                {ovr.status === 'active' && (
                  <p className="text-[11px] text-gray-500 leading-relaxed">{ovr.justification}</p>
                )}
              </div>

              {/* Meta */}
              <div className="flex items-center justify-between pt-3 border-t border-white/[0.04] flex-wrap gap-2">
                <div className="flex items-center gap-3 text-[10px] text-gray-500">
                  <span className="flex items-center gap-0.5"><Shield className="w-2.5 h-2.5" />By: <strong className="text-gray-300 font-mono">{ovr.initiatedBy}</strong></span>
                  {ovr.approvedBy && <span>Approved: <strong className="text-gray-300 font-mono">{ovr.approvedBy}</strong></span>}
                  <span className="flex items-center gap-0.5"><Users className="w-2.5 h-2.5" />{ovr.affectedUsers.toLocaleString()} users</span>
                </div>
                <div className="flex items-center gap-2">
                  {ovr.expiresAt && ovr.status === 'active' && (
                    <span className="text-[9px] text-warning-light flex items-center gap-0.5 bg-warning/10 px-1.5 py-0.5 rounded">
                      <Clock className="w-2.5 h-2.5" />
                      Expires {new Date(ovr.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  {ovr.status === 'active' && (
                    <Button size="xs" variant="danger" onClick={() => revoke(ovr.id)} disabled={isPending}
                      className="h-6 text-[9px] font-bold">
                      REVOKE
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
