'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { RetailInventoryItem } from '../types/pharmacyAssistant.types';
import { Search, MapPin, Tag } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { inventory: RetailInventoryItem[]; }

export function PharmacyAssistantInventoryPanel({ inventory }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] p-3">
        <div className="relative">
           <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
           <input 
             type="text" 
             placeholder="Search retail products..." 
             className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-3 text-[13px] text-white focus:outline-none focus:border-teal-500/50 placeholder:text-gray-600"
           />
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[300px] bg-black/10">
        <div className="divide-y divide-white/[0.03]">
          {inventory.map(item => (
            <div key={item.id} className="p-4 hover:bg-white/[0.015] transition-colors flex items-center justify-between">
              <div>
                <h4 className="text-[13px] font-bold text-white mb-1">{item.itemName}</h4>
                <div className="flex gap-2">
                   <span className="text-[9px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded">{item.category}</span>
                   <span className="flex items-center gap-1 text-[9px] text-teal-400 font-mono">
                     <MapPin className="w-3 h-3"/> {item.location}
                   </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[14px] font-black text-white font-mono flex items-center gap-1 justify-end">
                   <Tag className="w-3.5 h-3.5 text-gray-500"/> ${item.price.toFixed(2)}
                </span>
                <span className={cn("text-[9px] font-bold uppercase", item.inStock ? "text-success-light" : "text-emergency-light")}>
                   {item.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
