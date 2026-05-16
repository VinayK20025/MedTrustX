'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { GlobalAlert } from '../types/superAdmin.types';
import { useAcknowledgeAlert, useResolveAlert } from '../hooks/useSuperAdminAnalytics';
import { Bell, ShieldAlert, Server, Shield, Gauge, AlertTriangle, CheckCircle2, ArrowRight, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { alerts: GlobalAlert[]; }

const typeCfg: Record<string, { icon: typeof ShieldAlert; color: string }> = {
  security:       { icon: ShieldAlert, color: 'text-emergency-light' },
  compliance:     { icon: Shield, color: 'text-warning-light' },
  operational:    { icon: AlertTriangle, color: 'text-amber-400' },
  infrastructure: { icon: Server, color: 'text-cyan-400' },
  performance:    { icon: Gauge, color: 'text-purple-400' },
};

const severityStyles: Record<string, { border: string; bg: string; badge: string }> = {
  critical: { border: 'border-emergency/30', bg: 'bg-emergency/[0.04]', badge: 'bg-emergency/20 text-emergency-light border-emergency/30' },
  high:     { border: 'border-warning/30', bg: 'bg-warning/[0.03]', badge: 'bg-warning/20 text-warning-light border-warning/30' },
  medium:   { border: 'border-blue-500/30', bg: 'bg-blue-500/[0.03]', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  low:      { border: 'border-white/[0.06]', bg: 'bg-transparent', badge: 'bg-white/5 text-gray-400 border-white/10' },
};

export function SuperAdminAlertPanel({ alerts }: Props) {
  const { mutate: acknowledge, isPending: acking } = useAcknowledgeAlert();
  const { mutate: resolve, isPending: resolving } = useResolveAlert();
  const active = alerts.filter(a => a.status === 'active');
  const critical = alerts.filter(a => a.severity === 'critical' && a.status === 'active');

  return (
    <Card className={cn(
      'shadow-glass h-full flex flex-col bg-surface-light',
      critical.length > 0 ? 'border-emergency/30' : 'border-white/[0.06]'
    )}>
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={cn('p-2 rounded-lg relative', critical.length > 0 ? 'bg-emergency/20' : 'bg-amber-500/15')}>
            <Bell className={cn('w-4 h-4', critical.length > 0 ? 'text-emergency-light' : 'text-amber-400')} />
            {active.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emergency text-white text-[8px] font-black rounded-full flex items-center justify-center animate-pulse">
                {active.length}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-white tracking-wide">Global Alerts</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {active.length} active
              {critical.length > 0 && <span className="text-emergency-light font-bold ml-1">· {critical.length} critical</span>}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[500px]">
        <div className="divide-y divide-white/[0.03]">
          {alerts.map(alert => {
            const tCfg = typeCfg[alert.type] || typeCfg.operational;
            const sCfg = severityStyles[alert.severity] || severityStyles.low;
            const TIcon = tCfg.icon;
            return (
              <div key={alert.id} className={cn('px-5 py-4 transition-colors hover:bg-white/[0.015]', alert.status === 'active' && sCfg.bg)}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    <TIcon className={cn('w-4.5 h-4.5', tCfg.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-[13px] font-bold text-white leading-tight">{alert.title}</h4>
                      <span className={cn('text-[8px] uppercase font-bold px-1.5 py-0.5 rounded border tracking-wider flex-shrink-0', sCfg.badge)}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">{alert.message}</p>

                    <div className="flex items-center gap-2 mt-2 text-[9px] text-gray-500 flex-wrap">
                      <span className="bg-white/[0.04] px-1.5 py-0.5 rounded font-bold">{alert.type}</span>
                      <span>{alert.tenant}</span>
                      <span className="text-gray-700">·</span>
                      <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {alert.assignedTo && <span className="text-teal-400">→ {alert.assignedTo}</span>}
                      {alert.relatedAlerts > 0 && <span className="text-gray-500">+{alert.relatedAlerts} related</span>}
                    </div>

                    {/* Actions */}
                    {alert.status === 'active' && (
                      <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-white/[0.03]">
                        {alert.actionRequired && (
                          <span className="text-[9px] font-bold text-emergency-light bg-emergency/10 px-2 py-0.5 rounded border border-emergency/20">
                            Action Required
                          </span>
                        )}
                        <div className="flex-1" />
                        <Button size="xs" variant="ghost" onClick={() => acknowledge(alert.id)} disabled={acking}
                          className="h-6 text-[9px] text-gray-500 hover:text-white">
                          Acknowledge
                        </Button>
                        <Button size="xs" variant="outline" onClick={() => resolve(alert.id)} disabled={resolving}
                          leftIcon={<CheckCircle2 className="w-2.5 h-2.5" />} className="h-6 text-[9px]">
                          Resolve
                        </Button>
                        {alert.actionLabel && (
                          <Button size="xs" variant="primary" className="h-6 text-[9px]" rightIcon={<ArrowRight className="w-2.5 h-2.5" />}>
                            {alert.actionLabel}
                          </Button>
                        )}
                      </div>
                    )}
                    {alert.status === 'acknowledged' && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">Acknowledged</span>
                        <Button size="xs" variant="outline" onClick={() => resolve(alert.id)} disabled={resolving}
                          leftIcon={<CheckCircle2 className="w-2.5 h-2.5" />} className="h-6 text-[9px]">
                          Resolve
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
