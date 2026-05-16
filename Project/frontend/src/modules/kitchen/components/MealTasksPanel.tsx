'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { MealTask } from '../types/kitchen.types';
import { Utensils, AlertTriangle, Droplets, HeartPulse } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { meals: MealTask[]; selectedId?: string; onSelect: (id: string) => void; }

const dietColor = { 
  Diabetic: 'border-yellow-500 bg-yellow-500/[0.04]', 
  Liquid: 'border-cyan-500 bg-cyan-500/[0.04]',
  'Low-Salt': 'border-blue-500 bg-blue-500/[0.04]',
  Normal: 'border-emerald-500 bg-emerald-500/[0.04]'
};

export function MealTasksPanel({ meals, selectedId, onSelect }: Props) {
  const activeMeals = meals.filter(m => m.status !== 'Delivered');

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex justify-between items-center">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <Utensils className="w-4 h-4 text-orange-400" /> Patient Meals
        </h3>
        <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full">{activeMeals.length} Pending</span>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {activeMeals.map(m => (
            <div key={m.id} onClick={() => onSelect(m.id)}
              className={cn('p-4 cursor-pointer transition-all border-l-4 group relative',
                dietColor[m.dietType],
                selectedId === m.id ? 'ring-1 ring-inset ring-white/15 bg-white/[0.06]' : 'hover:bg-white/[0.06]'
              )}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-gray-400">{m.bed}</span>
                <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded flex items-center gap-1 tracking-wider',
                  m.dietType === 'Diabetic' ? 'bg-yellow-500/15 text-yellow-300' : 
                  m.dietType === 'Liquid' ? 'bg-cyan-500/15 text-cyan-300' :
                  m.dietType === 'Low-Salt' ? 'bg-blue-500/15 text-blue-300' : 'bg-emerald-500/15 text-emerald-300'
                )}>
                  {m.dietType === 'Diabetic' && <Activity className="w-2.5 h-2.5" />}
                  {m.dietType === 'Liquid' && <Droplets className="w-2.5 h-2.5" />}
                  {m.dietType === 'Low-Salt' && <HeartPulse className="w-2.5 h-2.5" />}
                  {m.dietType}
                </span>
              </div>
              
              <h4 className="text-[14px] font-bold text-white mb-0.5">{m.patientName}</h4>
              <div className="text-[11px] font-bold text-gray-400 mb-2">Meal: {m.mealTime}</div>

              <div className="flex justify-between items-center text-[10px] mt-2 pt-2 border-t border-white/5">
                 <span className="text-gray-300 font-bold bg-black/40 px-2 py-0.5 rounded">{new Date(m.scheduledTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                 <span className={cn('font-bold uppercase tracking-wider', m.status === 'Cooking' ? 'text-orange-400' : 'text-gray-400')}>{m.status}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

// Temporary import
import { Activity } from 'lucide-react';
