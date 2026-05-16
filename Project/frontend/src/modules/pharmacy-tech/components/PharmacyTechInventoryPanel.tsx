'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { TechInventoryItem } from '../types/pharmacyTech.types';
import { Search, MapPin, Archive } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { inventory: TechInventoryItem[]; }

export function PharmacyTechInventoryPanel({ inventory }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] p-3">
        <div className="relative">
           <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
           <input 
             type="text" 
             placeholder="Search shelf locations..." 
             className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-[12px] text-white focus:outline-none focus:border-orange-500/50 placeholder:text-gray-600"
           />
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[300px] bg-black/10">
        <div className="divide-y divide-white/[0.03]">
          {inventory.map(item => (
            <div key={item.id} className="p-4 hover:bg-white/[0.015] transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-[13px] font-bold text-white">{item.drugName}</h4>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">{item.drugCode}</p>
                </div>
                <div className="text-right">
                  <span className={cn("text-[12px] font-black font-mono block", item.currentStock <= item.reorderThreshold ? "text-emergency-light" : "text-white")}>
                    {item.currentStock}
                  </span>
                  <span className="text-[9px] text-gray-500">Min: {item.reorderThreshold}</span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="flex items-center gap-1 text-[10px] text-orange-400 font-mono bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20">
                  <MapPin className="w-3 h-3"/> {item.location}
                </span>
                {item.currentStock <= item.reorderThreshold && (
                  <span className="flex items-center gap-1 text-[9px] font-bold text-warning-light bg-warning/20 px-2 py-0.5 rounded">
                    <Archive className="w-3 h-3"/> Needs Restock
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
