'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { NutritionIntakeLog } from '../types/nutrition.types';
import { useFlagNonCompliance } from '../hooks/useNutritionAnalytics';
import { ActivitySquare, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { logs: NutritionIntakeLog[]; }

export function NutritionIntakePanel({ logs }: Props) {
  const { mutate: flag, isPending } = useFlagNonCompliance();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/15"><ActivitySquare className="w-4 h-4 text-indigo-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Intake Compliance</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <div className="divide-y divide-white/[0.03]">
          {logs.map(log => (
            <div key={log.id} className={cn('p-5 transition-colors', log.status === 'Poor' ? 'bg-emergency/5 border-l-2 border-emergency' : 'hover:bg-white/[0.015]')}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-[13px] font-bold text-white">Dietary Log</h4>
                  <p className="text-[11px] text-gray-500 font-mono mt-0.5">{new Date(log.date).toLocaleDateString()}</p>
                </div>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  log.status === 'Good' ? 'bg-success/20 text-success-light' :
                  log.status === 'Fair' ? 'bg-warning/20 text-warning-light' : 'bg-emergency/20 text-emergency-light'
                )}>
                  {log.status} ({log.complianceRate}%)
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-surface-dark border border-white/[0.04] p-3 rounded-lg text-center">
                  <span className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Calories</span>
                  <div className="text-[13px] font-bold">
                    <span className={cn(log.actualCalories < log.expectedCalories * 0.8 ? 'text-emergency-light' : 'text-white')}>{log.actualCalories}</span>
                    <span className="text-gray-500 font-normal"> / {log.expectedCalories}</span>
                  </div>
                </div>
                <div className="bg-surface-dark border border-white/[0.04] p-3 rounded-lg text-center">
                  <span className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Protein</span>
                  <div className="text-[13px] font-bold">
                    <span className={cn(log.actualProtein < log.expectedProtein * 0.8 ? 'text-warning-light' : 'text-white')}>{log.actualProtein}g</span>
                    <span className="text-gray-500 font-normal"> / {log.expectedProtein}g</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end">
                {log.status === 'Poor' && (
                  <Button size="xs" onClick={() => flag(log.id)} disabled={isPending} className="h-6 text-[10px] bg-emergency hover:bg-emergency-light border-none text-white font-bold" leftIcon={<AlertTriangle className="w-3 h-3" />}>
                    Flag Non-Compliance
                  </Button>
                )}
                {log.status === 'Good' && (
                  <span className="text-[10px] font-bold text-success-light flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Target Met</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
