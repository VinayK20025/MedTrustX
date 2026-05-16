'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { DeputyGap } from '../types/deputy.types';
import { AlertTriangle, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { gaps: DeputyGap[]; }

export function DeputyGapPanel({ gaps }: Props) {
  return (
    <Card className="border-warning/30 shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-warning/20 px-5 py-4 flex items-center gap-2 bg-warning/5">
        <AlertTriangle className="w-5 h-5 text-warning-light" />
        <h3 className="text-lg font-semibold text-warning-light tracking-wide">Coverage Gaps</h3>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-4 overflow-y-auto max-h-[300px]">
        {gaps.map(g => (
          <div key={g.id} className="p-4 rounded-lg border border-warning/20 bg-warning/10 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${g.criticality === 'high' ? 'bg-emergency' : 'bg-warning'}`} />
            <div className="flex justify-between items-start mb-2">
               <div>
                 <span className="text-sm font-bold text-white block">{g.wardName}</span>
                 <span className="text-[10px] text-gray-400">Requires {g.shortageCount} nurse(s)</span>
               </div>
               <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-1 rounded ${g.criticality === 'high' ? 'bg-emergency/20 text-emergency-light' : 'bg-warning/20 text-warning-light'}`}>
                 {g.criticality} Priority
               </span>
            </div>
            
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-warning/10">
               <span className="text-[10px] text-gray-400">
                 {g.suggestedStaffIds.length > 0 ? `${g.suggestedStaffIds.length} match(es)` : 'No matches'}
               </span>
               <Button size="sm" className="h-7 px-3 text-[10px] bg-warning hover:bg-warning-light text-black border-none font-bold flex items-center gap-1">
                 <UserPlus className="w-3 h-3" /> Fill Gap
               </Button>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
