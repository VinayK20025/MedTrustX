'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { SurveillanceAlert, AlertSeverity } from '../types/cctv.types';
import { useAcknowledgeAlert, useDispatchGuardFromCctv, useEscalateAlert } from '../hooks/useCctvAnalytics';
import { ShieldAlert, Eye, UserCheck, ArrowUp } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { alerts: SurveillanceAlert[]; }

const sevConfig: Record<AlertSeverity, string> = {
  High: 'bg-emergency/15 border-emergency/30 text-emergency-light',
  Medium: 'bg-warning/15 border-warning/30 text-warning-light',
  Low: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
};

const sevBadge: Record<AlertSeverity, string> = {
  High: 'bg-emergency/20 text-emergency-light border border-emergency/40 animate-pulse',
  Medium: 'bg-warning/20 text-warning-light',
  Low: 'bg-blue-500/20 text-blue-300',
};

export function SurveillanceAlertsPanel({ alerts }: Props) {
  const { mutate: acknowledge } = useAcknowledgeAlert();
  const { mutate: dispatch } = useDispatchGuardFromCctv();
  const { mutate: escalate } = useEscalateAlert();

  const activeAlerts = alerts.filter(a => a.status !== 'Closed');

  return (
    <Card className={cn('shadow-glass h-full flex flex-col', activeAlerts.some(a => a.severity === 'High') ? 'border-emergency/30' : 'border-white/[0.06]')}>
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-2">
          <ShieldAlert className={cn('w-4 h-4', activeAlerts.some(a => a.severity === 'High') ? 'text-emergency-light animate-pulse' : 'text-purple-400')} />
          <h3 className={cn('text-[13px] font-bold tracking-widest uppercase', activeAlerts.some(a => a.severity === 'High') ? 'text-emergency-light' : 'text-purple-400')}>Live Alerts</h3>
        </div>
        {activeAlerts.length > 0 && (
          <span className="text-[9px] bg-emergency/20 text-emergency-light px-2 py-0.5 rounded font-bold border border-emergency/30">{activeAlerts.length} Active</span>
        )}
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto bg-black/30">
        <div className="p-3 space-y-3">
          {activeAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center opacity-40">
              <Eye className="w-10 h-10 text-gray-500 mb-3" />
              <p className="text-[13px] font-bold text-gray-400">All Clear</p>
              <p className="text-[11px] text-gray-500 mt-1">No active surveillance alerts.</p>
            </div>
          ) : (
            activeAlerts.map(alert => (
              <div key={alert.id} className={cn('border rounded-xl p-3 flex flex-col gap-3', sevConfig[alert.severity])}>
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] text-gray-400 font-mono block mb-0.5">{alert.cameraId} • {alert.zone}</span>
                    <p className="text-[13px] font-black">{alert.type}</p>
                  </div>
                  <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded tracking-wider uppercase', sevBadge[alert.severity])}>{alert.severity}</span>
                </div>

                <p className="text-[11px] text-gray-300 leading-relaxed">{alert.description}</p>

                <div className="text-[9px] text-gray-500 font-mono">{new Date(alert.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  {alert.status === 'Active' && (
                    <Button size="sm" onClick={() => acknowledge(alert.id)}
                      className="h-7 text-[10px] bg-white/10 hover:bg-white/20 text-gray-200 border border-white/10 flex-1"
                      leftIcon={<Eye className="w-3 h-3" />}>Acknowledge</Button>
                  )}
                  <Button size="sm" onClick={() => dispatch(alert.id)}
                    className="h-7 text-[10px] bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 flex-1"
                    leftIcon={<UserCheck className="w-3 h-3" />}>Dispatch Guard</Button>
                  {alert.severity === 'High' && (
                    <Button size="sm" onClick={() => escalate(alert.id)}
                      className="h-7 text-[10px] bg-emergency/15 hover:bg-emergency/25 text-emergency-light border border-emergency/30 w-full"
                      leftIcon={<ArrowUp className="w-3 h-3" />}>Escalate to Manager</Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardBody>
    </Card>
  );
}
