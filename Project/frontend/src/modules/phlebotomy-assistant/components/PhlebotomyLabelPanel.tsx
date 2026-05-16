'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { PhlebotomyPatient, CollectionTest } from '../types/phlebotomy.types';
import { usePrintLabel } from '../hooks/usePhlebotomyAnalytics';
import { Printer, Droplet } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { activePatient?: PhlebotomyPatient; tests: CollectionTest[]; }

export function PhlebotomyLabelPanel({ activePatient, tests }: Props) {
  const { mutate: printLabel, isPending } = usePrintLabel();

  // Helper to map color string to tailwind class
  const getTubeColorClass = (color: string) => {
    switch(color) {
      case 'Purple (Lavender)': return 'bg-purple-500 border-purple-400';
      case 'Gold (SST)': return 'bg-yellow-500 border-yellow-400';
      case 'Red': return 'bg-red-500 border-red-400';
      case 'Light Blue': return 'bg-sky-400 border-sky-300';
      case 'Green': return 'bg-green-500 border-green-400';
      case 'Gray': return 'bg-gray-400 border-gray-300';
      default: return 'bg-white border-gray-200';
    }
  };

  if (!activePatient) return null;

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-500/15"><Printer className="w-4 h-4 text-teal-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Tube Preparation & Labels</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="p-4 bg-warning/10 border-b border-warning/20 flex items-start gap-3">
           <Droplet className="w-5 h-5 text-warning-light shrink-0 mt-0.5" />
           <div>
             <p className="text-[11px] font-bold text-warning-light uppercase tracking-wider">Order of Draw</p>
             <p className="text-[11px] text-gray-300 mt-1">Ensure tubes are drawn in the correct order to prevent cross-contamination of additives.</p>
           </div>
        </div>

        <div className="divide-y divide-white/[0.03]">
          {tests.map(test => (
            <div key={test.id} className="p-5 flex items-start gap-4">
              <div className={cn("w-3 h-12 rounded-full border-2 shadow-inner", getTubeColorClass(test.tubeColor))} />
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-[13px] font-bold text-white">{test.testName}</h4>
                  <span className="text-[10px] text-gray-400 font-bold bg-white/5 px-2 py-0.5 rounded">{test.tubeColor}</span>
                </div>
                <p className="text-[10px] text-gray-400 font-mono mb-3">{test.preparationNotes}</p>
                
                <div className="flex items-center justify-between mt-4">
                  <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wider", 
                    test.status === 'Label Printed' ? 'bg-success/20 text-success-light' : 'bg-surface-dark border border-white/10 text-gray-500'
                  )}>
                    {test.status}
                  </span>
                  
                  {test.status === 'Pending' && (
                    <Button size="sm" onClick={() => printLabel(test.id)} disabled={isPending} className="bg-white/10 hover:bg-white/20 text-white font-bold h-7 text-[10px] border-none" leftIcon={<Printer className="w-3 h-3" />}>
                      Print Barcode Label
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
