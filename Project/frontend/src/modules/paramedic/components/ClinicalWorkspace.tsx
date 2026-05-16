'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ClinicalProtocol, InterventionLog } from '../types/paramedic.types';
import { useLogIntervention } from '../hooks/useParamedicAnalytics';
import { Stethoscope, ShieldPlus, CheckCircle2, Mic } from 'lucide-react';

interface Props { protocols: ClinicalProtocol[]; interventions: InterventionLog[]; }

export function ClinicalWorkspace({ protocols, interventions }: Props) {
  const { mutate: logAction } = useLogIntervention();

  const quickActions = [
    { label: 'Start CPR', icon: Activity },
    { label: 'O2 (NRB 15L)', icon: Wind },
    { label: 'Establish IV', icon: Droplet },
    { label: 'Epi 1mg IV', icon: Syringe }
  ];

  return (
    <Card className="border-blue-500/20 shadow-glass bg-[#020406] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500" />

      <CardHeader className="border-b border-white/[0.04] p-4 bg-black/40">
        <h3 className="text-[14px] font-black text-white flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-cyan-400" /> Pre-Hospital Clinical Protocols
        </h3>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto flex flex-col">

        {/* Protocols */}
        <div className="p-4 space-y-4">
          {protocols.map(p => (
            <div key={p.id} className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <ShieldPlus className="w-4 h-4 text-cyan-400" />
                <h4 className="text-[13px] font-bold text-cyan-100 uppercase tracking-wider">{p.condition}</h4>
              </div>
              <ul className="space-y-2 mb-4">
                {p.suggestedActions.map((act, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-[12px] text-cyan-50">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> {act}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Rapid Actions (Massive Buttons) */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Rapid One-Tap Interventions</p>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(act => (
              <Button key={act.label} onClick={() => logAction(act.label)} className="h-14 text-[13px] font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 shadow-sm" leftIcon={<act.icon className="w-4 h-4 text-gray-400" />}>
                {act.label}
              </Button>
            ))}
          </div>
          <Button className="w-full mt-3 h-12 bg-white/5 text-gray-400 border border-transparent hover:bg-white/10 hover:text-white" leftIcon={<Mic className="w-4 h-4" />}>
            Voice Record Notes
          </Button>
        </div>

        {/* Intervention Log */}
        <div className="p-4 flex-1 border-t border-white/5 bg-black/40 overflow-y-auto">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Intervention Log</p>
          <div className="space-y-2">
            {interventions.map(int => (
              <div key={int.id} className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-2.5 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success-light" />
                  <span className="text-[12px] font-bold text-white">{int.action}</span>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">{new Date(int.time).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>

      </CardBody>
    </Card>
  );
}

// Temporary icon imports for quick actions
import { Activity, Wind, Droplet, Syringe } from 'lucide-react';
