'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { SRTeamMember } from '../types/sr.types';
import { Users, Activity, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { team: SRTeamMember[]; }

export function SRTeamPanel({ team }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-400" />
          <h3 className="text-lg font-semibold text-white tracking-wide">My Team</h3>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[300px]">
        {team.map(member => (
          <div key={member.id} className={`p-3 rounded-lg border border-white/[0.06] ${member.status === 'busy' ? 'bg-indigo-500/5' : member.status === 'offline' ? 'opacity-50 grayscale' : 'bg-white/[0.02]'}`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-sm font-bold text-white">{member.name}</span>
                <span className="text-[9px] uppercase font-bold tracking-widest text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded ml-2">{member.role}</span>
              </div>
              <div className={`w-2 h-2 rounded-full ${member.status === 'busy' ? 'bg-warning' : member.status === 'active' ? 'bg-success' : 'bg-gray-500'}`} />
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-black/20 p-2 rounded flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-gray-300">{member.patientsAssigned}</span>
                <span className="text-[9px] text-gray-500 uppercase tracking-widest">Patients</span>
              </div>
              <div className="bg-black/20 p-2 rounded flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-indigo-300">{member.tasksInProgress}</span>
                <span className="text-[9px] text-gray-500 uppercase tracking-widest">Tasks</span>
              </div>
              <div className={`bg-black/20 p-2 rounded flex flex-col items-center justify-center ${member.tasksDelayed > 0 ? 'border border-emergency/30' : ''}`}>
                <span className={`text-lg font-bold ${member.tasksDelayed > 0 ? 'text-emergency-light' : 'text-gray-300'}`}>{member.tasksDelayed}</span>
                <span className="text-[9px] text-gray-500 uppercase tracking-widest">Delays</span>
              </div>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
