'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { EquipmentDetails } from '../types/maintenance.types';
import { Server, Settings2, Calendar, FileText, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { equipment?: EquipmentDetails; }

export function EquipmentInfoPanel({ equipment }: Props) {
  if (!equipment) return null;

  const isFaulty = equipment.status === 'Faulty';

  return (
    <Card className={cn("shadow-glass h-full flex flex-col", isFaulty ? "border-emergency/30" : "border-white/[0.06]")}>
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-indigo-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-indigo-400 uppercase">Equipment Specs</h3>
        </div>
        {isFaulty && <span className="text-[9px] bg-emergency/20 text-emergency-light px-2 py-0.5 rounded font-bold uppercase animate-pulse">Faulty</span>}
      </CardHeader>
      <CardBody className="p-4 flex-1 overflow-y-auto">
        <div className="flex flex-col items-center text-center mb-6 mt-2">
           <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-3 border", isFaulty ? "bg-emergency/10 border-emergency/30 text-emergency-light" : "bg-white/5 border-white/10 text-gray-400")}>
             <Settings2 className="w-8 h-8" />
           </div>
           <h4 className="text-[15px] font-bold text-white mb-1">{equipment.name}</h4>
           <p className="text-[12px] text-gray-500 font-mono">{equipment.id}</p>
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
             <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Make / Model</span>
             <span className="text-[13px] font-bold text-white">{equipment.model}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
             <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Serial Number</span>
             <span className="text-[13px] font-mono font-bold text-white">{equipment.serialNumber}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
             <div>
               <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Last Serviced</span>
               <span className="text-[13px] font-bold text-white">{new Date(equipment.lastServiceDate).toLocaleDateString()}</span>
             </div>
             <Calendar className="w-5 h-5 text-gray-500" />
          </div>
        </div>

        <div className="mt-6">
          <Button className="w-full h-10 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-[12px] font-bold" leftIcon={<FileText className="w-4 h-4" />}>View Service Manual</Button>
        </div>
      </CardBody>
    </Card>
  );
}
