'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { UnitAlert } from '../types/unit-head.types';
import { Siren, CheckCircle } from 'lucide-react';
import { useAcknowledgeAlert } from '../hooks/useUnitHeadAnalytics';

interface Props { alerts: UnitAlert[]; }

const typeIcon: Record<string, string> = {
  code_blue:        '🔵 CODE BLUE',
  vitals_critical:  '🔴 VITALS',
  ventilator:       '🫁 VENT',
  medication_delay: '💊 MED DELAY',
  lab_critical:     '🧪 LAB CRIT',
  escalation:       '⬆️ ESCALATION',
};

export function UnitAlertsPanel({ alerts }: Props) {
  const { mutate: ack, isPending } = useAcknowledgeAlert();
  const unack = alerts.filter(a => !a.acknowledged);

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Siren className="w-5 h-5 text-emergency-light" />
          <div>
            <h3 className="text-lg font-semibold text-white tracking-wide">Critical Alerts</h3>
            <p className="text-xs text-gray-400 mt-0.5">{alerts.length} total • {unack.length} unacknowledged</p>
          </div>
        </div>
        {unack.length > 0 && (
          <span className="text-xs text-emergency-light bg-emergency/10 px-2 py-1 rounded-full border border-emergency/20 font-bold animate-pulse">
            {unack.length} ACTIVE
          </span>
        )}
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <div className="divide-y divide-white/[0.04]">
          {alerts.map(a => (
            <div key={a.id} className={`p-4 transition-colors ${!a.acknowledged ? 'bg-emergency/5 hover:bg-emergency/10' : 'hover:bg-white/[0.02]'}`}>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={`text-[10px] font-black tracking-widest ${a.severity === 'critical' ? 'text-emergency-light' : 'text-warning-light'}`}>
                  {typeIcon[a.type]}
                </span>
                {a.bed && <span className="text-[10px] text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded font-mono">{a.bed}</span>}
                {!a.acknowledged && <span className="text-[9px] text-emergency-light animate-pulse font-bold ml-auto">● UNACK</span>}
                {a.acknowledged && <span className="text-[9px] text-success-light ml-auto">✓ ACK</span>}
              </div>
              <p className="text-xs text-gray-200 leading-relaxed">{a.message}</p>
              {a.patientName && <p className="text-[10px] text-gray-500 mt-1">Patient: <span className="text-gray-300">{a.patientName}</span></p>}
              {!a.acknowledged && (
                <Button variant="outline" size="sm" className="mt-2 text-xs h-7 gap-1"
                  onClick={() => ack(a.id)} disabled={isPending}>
                  <CheckCircle className="w-3 h-3" /> Acknowledge
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
