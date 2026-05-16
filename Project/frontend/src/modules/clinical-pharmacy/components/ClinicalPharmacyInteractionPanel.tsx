'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { DrugInteraction } from '../types/clinicalPharmacy.types';
import { Activity, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { interactions: DrugInteraction[]; }

export function ClinicalPharmacyInteractionPanel({ interactions }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col relative overflow-hidden">
      <CardHeader className="border-b border-white/[0.04] p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-emerald-400">INTERACTION ANALYSIS</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto bg-black/20">
        {interactions.length === 0 ? (
           <div className="p-8 text-center text-[12px] text-gray-500 font-bold">No major drug-drug or drug-disease interactions detected.</div>
        ) : (
          <div className="space-y-4 p-4">
            {interactions.map(int => (
              <div key={int.id} className={cn("p-4 rounded-xl border", 
                int.severity === 'Major' || int.severity === 'Contraindicated' ? "bg-emergency/10 border-emergency/30" : "bg-warning/10 border-warning/30"
              )}>
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-[13px] font-bold text-white flex items-center gap-2">
                    <AlertTriangle className={cn("w-4 h-4", int.severity === 'Major' ? "text-emergency-light" : "text-warning-light")}/>
                    {int.drugA} + {int.drugB}
                  </h4>
                  <span className={cn("text-[9px] uppercase font-bold px-2 py-0.5 rounded", 
                    int.severity === 'Major' ? "bg-emergency text-white" : "bg-warning text-black"
                  )}>{int.severity}</span>
                </div>
                
                <div className="space-y-3 text-[11px]">
                  <div>
                    <span className="block text-gray-500 mb-0.5">Mechanism</span>
                    <span className="text-gray-300">{int.mechanism}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-0.5">Clinical Effect</span>
                    <span className={cn("font-bold", int.severity === 'Major' ? "text-emergency-light" : "text-warning-light")}>{int.clinicalEffect}</span>
                  </div>
                  <div className="bg-black/40 p-2 rounded border border-white/5">
                    <span className="block text-blue-400 mb-0.5 font-bold">Recommendation</span>
                    <span className="text-gray-300">{int.recommendation}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
