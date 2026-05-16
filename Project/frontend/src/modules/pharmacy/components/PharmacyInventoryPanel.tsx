'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { DispensingInventoryItem } from '../types/pharmacy.types';
import { Search, MapPin } from 'lucide-react';

interface Props { inventory: DispensingInventoryItem[]; }

export function PharmacyInventoryPanel({ inventory }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] p-3">
        <div className="relative">
           <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
           <input 
             type="text" 
             placeholder="Search inventory..." 
             className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-[12px] text-white focus:outline-none focus:border-emerald-500/50 placeholder:text-gray-600"
             defaultValue="Amoxicillin"
           />
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[300px] bg-black/10">
        <div className="divide-y divide-white/[0.03]">
          {inventory.map(item => (
            <div key={item.id} className="p-4 hover:bg-white/[0.015] transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-[13px] font-bold text-white">{item.drugName}</h4>
                <span className="text-[12px] font-black text-white font-mono">{item.currentStock}</span>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-gray-500 font-mono">
                 <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-500/70"/> {item.location}</span>
                 <span>NDC: {item.drugCode}</span>
                 <span>EXP: {item.expiryDate}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
