'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ActiveIncident, DisasterCode } from '../types/disaster.types';
import { useActivateProtocol, useEscalateIncident, useCloseIncident } from '../hooks/useDisasterAnalytics';
import { Siren, Flame, Heart, Shield, AlertTriangle, ArrowUp, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { incident?: ActiveIncident; }

const codeConfig: Record<DisasterCode, { bg: string; text: string; Icon: React.ElementType }> = {
  'Code Red':   { bg: 'bg-red-900/40 border-red-600/50',   text: 'text-red-300',     Icon: Flame },
  'Code Black': { bg: 'bg-gray-900/80 border-gray-500/50', text: 'text-gray-200',    Icon: Siren },
  'Code Blue':  { bg: 'bg-blue-900/40 border-blue-600/50', text: 'text-blue-300',    Icon: Heart },
  'Code Orange':{ bg: 'bg-orange-900/30 border-orange-600/50', text: 'text-orange-300', Icon: AlertTriangle },
  'Code White': { bg: 'bg-white/5 border-white/20',        text: 'text-white',       Icon: Shield },
};

export function IncidentControlPanel({ incident }: Props) {
  const { mutate: escalate } = useEscalateIncident();
  const { mutate: close } = useCloseIncident();

  if (!incident) return (
    <Card className="border-success/20 bg-success/[0.03] shadow-glass h-full flex flex-col items-center justify-center">
      <CheckCircle2 className="w-12 h-12 text-success-light mb-3" />
      <p className="text-[16px] font-bold text-success-light">No Active Incident</p>
      <p className="text-[12px] text-gray-400 mt-1">Hospital in normal operational mode.</p>
    </Card>
  );

  const cfg = codeConfig[incident.code];
  const CodeIcon = cfg.Icon;
  const elapsed = Math.floor((Date.now() - new Date(incident.activatedAt).getTime()) / 60000);

  return (
    <Card className={cn('shadow-glass h-full flex flex-col border', cfg.bg)}>
      {/* Pulsing incident banner */}
      <div className="bg-emergency/25 border-b border-emergency/40 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Siren className="w-4 h-4 text-emergency-light animate-pulse" />
          <span className="text-[11px] font-black text-emergency-light uppercase tracking-widest">Active Disaster — Command Mode</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
          <Clock className="w-3 h-3" /> {elapsed}m elapsed
        </div>
      </div>

      <CardBody className="p-4 flex flex-col gap-4 flex-1 overflow-y-auto">
        {/* Code badge */}
        <div className={cn('rounded-xl border p-3 flex items-center gap-3', cfg.bg)}>
          <div className="p-2 rounded-lg bg-black/30 border border-white/10">
            <CodeIcon className={cn('w-5 h-5', cfg.text)} />
          </div>
          <div>
            <span className={cn('text-[16px] font-black', cfg.text)}>{incident.code}</span>
            <p className="text-[11px] text-gray-400">{incident.type}</p>
          </div>
          <div className="ml-auto">
            <span className="text-[9px] bg-emergency/20 text-emergency-light px-2 py-1 rounded font-bold border border-emergency/30 uppercase">{incident.severity}</span>
          </div>
        </div>

        {/* Incident details */}
        <div className="space-y-2">
          <h3 className="text-[15px] font-black text-white leading-tight">{incident.title}</h3>
          <p className="text-[12px] text-gray-300 leading-relaxed">{incident.description}</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-black/30 border border-white/5 rounded-lg p-2 text-center">
            <p className="text-[22px] font-black text-emergency-light">{incident.patientCount}</p>
            <p className="text-[9px] text-gray-500 uppercase tracking-wider">Patients</p>
          </div>
          <div className="bg-black/30 border border-white/5 rounded-lg p-2 text-center">
            <p className="text-[16px] font-black text-white">{incident.phase}</p>
            <p className="text-[9px] text-gray-500 uppercase tracking-wider">Current Phase</p>
          </div>
        </div>

        {/* Affected zones */}
        <div>
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">Affected Zones</p>
          <div className="flex flex-wrap gap-1.5">
            {incident.affectedZones.map(z => (
              <span key={z} className="text-[11px] bg-emergency/15 border border-emergency/25 text-emergency-light px-2.5 py-1 rounded font-bold">{z}</span>
            ))}
          </div>
        </div>

        {/* Commander */}
        <div className="text-[11px] text-gray-400 italic border-t border-white/5 pt-3">Commander: <span className="text-white font-bold">{incident.commander}</span></div>

        {/* Command actions */}
        <div className="space-y-2 mt-auto">
          <Button onClick={() => escalate(incident.id)}
            className="w-full h-11 bg-warning/15 hover:bg-warning/25 text-warning-light border border-warning/30 font-bold text-[12px]"
            leftIcon={<ArrowUp className="w-4 h-4" />}>
            Escalate to Board & External Agencies
          </Button>
          <Button onClick={() => close(incident.id)}
            className="w-full h-11 bg-success/10 hover:bg-success/20 text-success-light border border-success/30 font-bold text-[12px]"
            leftIcon={<CheckCircle2 className="w-4 h-4" />}>
            Close Incident — Begin Recovery
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
