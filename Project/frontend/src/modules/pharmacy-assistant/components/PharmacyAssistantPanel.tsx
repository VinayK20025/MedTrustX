'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { AssistanceTask } from '../types/pharmacyAssistant.types';
import { useMarkItemFetched, useHandoverToPharmacist, useCompleteTransaction } from '../hooks/usePharmacyAssistantAnalytics';
import { ShoppingBag, CheckCircle2, UserPlus, CreditCard } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { activeTask?: AssistanceTask; }

export function PharmacyAssistantPanel({ activeTask }: Props) {
  const { mutate: markFetched } = useMarkItemFetched();
  const { mutate: handover, isPending: isHandingOver } = useHandoverToPharmacist();
  const { mutate: complete, isPending: isCompleting } = useCompleteTransaction();

  if (!activeTask) return null;

  const allFetched = activeTask.itemsToFetch.every(i => i.fetched);

  return (
    <Card className="border-teal-500/30 shadow-glass bg-[#030806] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-teal-500" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-teal-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-teal-400">ACTIVE SERVICE</h3>
        </div>
        <div className="text-[14px] text-white font-black font-mono">TICKET: {activeTask.ticketNumber}</div>
      </CardHeader>

      <CardBody className="p-0 flex-1 flex flex-col">
        <div className="p-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
           <div>
              <span className="block text-gray-500 text-[10px] mb-1 uppercase">Customer Name</span>
              <span className="text-white font-bold text-[13px]">{activeTask.patientName}</span>
           </div>
           <div className="text-right">
              <span className="block text-gray-500 text-[10px] mb-1 uppercase">Request Type</span>
              <span className="text-teal-400 font-bold text-[13px]">{activeTask.requestType}</span>
           </div>
        </div>

        {/* Fetch List */}
        <div className="divide-y divide-white/[0.03] flex-1 overflow-y-auto p-4 space-y-3">
          {activeTask.itemsToFetch.map(item => (
            <div key={item.id} className={cn("p-4 rounded-xl border flex items-center justify-between transition-colors", 
                item.fetched ? "bg-success/10 border-success/30" : "bg-surface-dark border-white/10"
            )}>
              <div>
                <h4 className="text-[14px] font-bold text-white">{item.drugName}</h4>
                <div className="flex gap-4 mt-1">
                   <p className="text-[11px] text-gray-400 font-mono">Shelf: <span className="text-white">{item.location}</span></p>
                   <p className="text-[11px] text-gray-400 font-mono">Qty: <span className="text-white font-bold">{item.quantity}</span></p>
                </div>
              </div>
              
              {!item.fetched ? (
                <Button size="sm" 
                  onClick={() => markFetched({ taskId: activeTask.id, itemId: item.id })}
                  className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-[11px] h-8"
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  Mark Found
                </Button>
              ) : (
                <span className="text-[11px] font-bold text-success-light bg-success/20 px-3 py-1.5 rounded-lg flex items-center gap-1">
                   <CheckCircle2 className="w-4 h-4"/> Ready
                </span>
              )}
            </div>
          ))}
        </div>
        
        {/* Actions */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex justify-between items-center gap-4">
          <Button 
            disabled={isHandingOver} 
            onClick={() => handover(activeTask.id)}
            className="bg-surface-dark border border-white/10 hover:bg-white/5 text-gray-300 font-bold h-12 flex-1"
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Pharmacist Consult
          </Button>

          <Button 
            disabled={!allFetched || activeTask.requiresPharmacist || isCompleting} 
            onClick={() => complete(activeTask.id)}
            className="bg-teal-600 hover:bg-teal-500 text-white font-bold h-12 flex-1 text-[13px]"
            leftIcon={<CreditCard className="w-4 h-4" />}
          >
            PROCEED TO BILLING
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
