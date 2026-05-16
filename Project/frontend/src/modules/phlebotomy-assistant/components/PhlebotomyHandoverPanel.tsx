'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { HandoverBatch } from '../types/phlebotomy.types';
import { useTransferBatch } from '../hooks/usePhlebotomyAnalytics';
import { Send, PackageCheck } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { batches: HandoverBatch[]; }

export function PhlebotomyHandoverPanel({ batches }: Props) {
  const { mutate: transfer, isPending } = useTransferBatch();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/15"><PackageCheck className="w-4 h-4 text-blue-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Lab Handover</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[300px]">
        <div className="divide-y divide-white/[0.03]">
          {batches.map(batch => (
            <div key={batch.id} className="p-4 hover:bg-white/[0.015] transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-[13px] font-bold text-white">{batch.destinationLab}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5 font-mono">Batch ID: {batch.id}</p>
                </div>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  batch.status === 'Pending Transfer' ? 'bg-warning/20 text-warning-light' : 'bg-success/20 text-success-light'
                )}>
                  {batch.status}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-[11px] mt-4">
                <span className="text-gray-400 font-bold">{batch.tubeCount} Collected Tubes</span>
                {batch.status === 'Pending Transfer' && (
                  <Button size="xs" onClick={() => transfer(batch.id)} disabled={isPending} className="bg-blue-600 hover:bg-blue-500 text-white border-none font-bold h-7 px-3" leftIcon={<Send className="w-3 h-3" />}>
                    Dispatch to Lab
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
