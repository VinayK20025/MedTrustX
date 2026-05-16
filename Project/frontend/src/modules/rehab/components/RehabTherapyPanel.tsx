'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { RehabTherapyPlan } from '../types/rehab.types';
import { Dumbbell, Target, Clock, Settings2 } from 'lucide-react';

interface Props { plan?: RehabTherapyPlan; }

export function RehabTherapyPanel({ plan }: Props) {
  if (!plan) return <div className="p-10 text-center text-gray-500 border border-white/5 rounded-xl bg-surface-light">No active therapy plan selected.</div>;

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-orange-500/15"><Dumbbell className="w-4 h-4 text-orange-400" /></div>
          <div>
            <h3 className="text-[15px] font-bold text-white tracking-wide">Active Therapy Plan</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">{plan.startDate} - {plan.endDate}</p>
          </div>
        </div>
        <Button size="sm" variant="ghost" leftIcon={<Settings2 className="w-3 h-3" />} className="text-gray-400">
          Modify
        </Button>
      </CardHeader>

      <CardBody className="p-5 flex-1 overflow-y-auto max-h-[450px]">
        <div className="mb-6">
          <h4 className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-1.5 mb-3"><Target className="w-3.5 h-3.5" /> Clinical Goals</h4>
          <ul className="space-y-2">
            {plan.goals.map((goal, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                {goal}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-1.5 mb-3"><Dumbbell className="w-3.5 h-3.5" /> Exercise Regimen</h4>
          <div className="space-y-3">
            {plan.exercises.map(ex => (
              <div key={ex.id} className="p-3 bg-surface-dark border border-white/[0.04] rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="text-[13px] font-bold text-white">{ex.name}</h5>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-orange-300 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">{ex.targetArea}</span>
                </div>
                <div className="flex gap-4 text-[11px] text-gray-400 mb-2">
                  <span><strong>{ex.sets}</strong> Sets</span>
                  <span><strong>{ex.reps}</strong> Reps</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {ex.frequency}</span>
                </div>
                <p className="text-[10px] text-gray-500 italic">"{ex.instructions}"</p>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
