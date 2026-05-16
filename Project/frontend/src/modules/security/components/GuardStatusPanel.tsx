'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { GuardStatus } from '../types/security.types';
import { Shield, UserCheck, User, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { guards: GuardStatus[]; }

export function GuardStatusPanel({ guards }: Props) {
  const responding = guards.filter(g => g.status === 'Responding');
  const onDuty = guards.filter(g => g.status === 'On Duty');

  return (
    <Card className="border-white/[0.06] shadow-glass h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-400" />
          <h3 className="text-[13px] font-bold tracking-widest uppercase text-blue-400">Guard Deployment</h3>
        </div>
        <span className="text-[10px] font-bold text-gray-400">{guards.length} Total</span>
      </CardHeader>
      <CardBody className="p-4 flex-1 overflow-y-auto flex flex-col gap-5">

        {responding.length > 0 && (
          <div>
            <h4 className="text-[10px] font-bold text-emergency-light uppercase tracking-widest flex items-center gap-1.5 mb-3"><UserCheck className="w-3 h-3" /> Responding Now</h4>
            <div className="space-y-2">
              {responding.map(g => (
                <div key={g.id} className="flex items-center gap-3 bg-emergency/[0.06] border border-emergency/20 p-3 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-emergency/20 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-emergency-light" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-white">{g.name}</p>
                    <p className="text-[10px] text-emergency-light">{g.location}</p>
                  </div>
                  <div className="ml-auto w-2 h-2 rounded-full bg-emergency-light animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 mb-3"><Clock className="w-3 h-3" /> On Duty — Patrol</h4>
          <div className="space-y-2">
            {onDuty.map(g => (
              <div key={g.id} className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-3 rounded-lg">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-gray-300" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-white">{g.name}</p>
                  <p className="text-[10px] text-gray-400">{g.location}</p>
                </div>
                <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400" />
              </div>
            ))}
          </div>
        </div>

      </CardBody>
    </Card>
  );
}
