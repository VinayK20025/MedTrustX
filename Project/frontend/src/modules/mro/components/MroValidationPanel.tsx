'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ValidationDeficiency } from '../types/mro.types';
import { useNudgePhysician } from '../hooks/useMroAnalytics';
import { AlertOctagon, Edit3 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { deficiencies: ValidationDeficiency[]; }

export function MroValidationPanel({ deficiencies }: Props) {
  const { mutate: nudge, isPending } = useNudgePhysician();

  return (
    <Card className={cn("shadow-glass h-full flex flex-col bg-surface-light", deficiencies.length > 0 ? "border-emergency/40" : "border-white/[0.06]")}>
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-lg relative", deficiencies.length > 0 ? "bg-emergency/20" : "bg-white/5")}>
            <AlertOctagon className={cn("w-4 h-4", deficiencies.length > 0 ? "text-emergency-light animate-pulse" : "text-gray-400")} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-white tracking-wide">Record Deficiencies</h3>
          </div>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[300px]">
        {deficiencies.length === 0 ? (
           <div className="p-8 text-center text-[12px] text-gray-500 font-bold">No documentation deficiencies found.</div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {deficiencies.map(def => (
              <div key={def.id} className={cn("p-4 border-l-2 flex flex-col gap-3", 
                def.severity === 'critical' ? 'bg-emergency/[0.05] border-emergency' : 'bg-warning/[0.05] border-warning'
              )}>
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={cn("text-[13px] font-bold flex items-center gap-2", def.severity === 'critical' ? 'text-emergency-light' : 'text-warning-light')}>
                      {def.category}
                    </h4>
                    <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-gray-400 font-mono">{def.recordId}</span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed mb-2">{def.description}</p>
                  <span className="text-[10px] text-gray-500 font-bold">Responsible: {def.assignedPhysician}</span>
                </div>
                
                <div className="flex justify-end mt-1">
                  <Button 
                    size="sm" 
                    disabled={isPending}
                    onClick={() => nudge(def.id)}
                    className="bg-surface-dark border border-white/10 hover:bg-white/5 text-[10px] h-7"
                    leftIcon={<Edit3 className="w-3 h-3"/>}
                  >
                    Nudge Physician
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
