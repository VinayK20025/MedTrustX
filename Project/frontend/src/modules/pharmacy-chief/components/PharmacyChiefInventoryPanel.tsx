'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { DrugInventoryItem } from '../types/pharmacyChief.types';
import { Package, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { inventory: DrugInventoryItem[]; }

export function PharmacyChiefInventoryPanel({ inventory }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/15"><Package className="w-4 h-4 text-blue-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Critical Inventory</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <table className="w-full text-left text-[12px]">
          <thead className="bg-black/20 text-gray-400 font-mono text-[10px] uppercase">
            <tr>
              <th className="px-5 py-3">Drug / NDC</th>
              <th className="px-5 py-3 text-right">Stock Level</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {inventory.map(item => (
              <tr key={item.id} className="hover:bg-white/[0.015] transition-colors">
                <td className="px-5 py-3">
                  <p className="font-bold text-white">{item.drugName}</p>
                  <div className="flex items-center gap-2 mt-1 font-mono text-[10px]">
                    <span className="text-gray-500">{item.drugCode}</span>
                    <span className="bg-white/5 px-1.5 py-0.5 rounded text-gray-400">{item.category}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-right font-mono">
                  <p className={cn("text-[14px] font-black", item.currentStock < item.minimumThreshold ? "text-emergency-light" : "text-white")}>
                    {item.currentStock} <span className="text-[10px] text-gray-500 font-normal">{item.unit}</span>
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">Min: {item.minimumThreshold}</p>
                </td>
                <td className="px-5 py-3">
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded border inline-flex items-center gap-1",
                    item.status === 'Out of Stock' ? "bg-emergency/10 border-emergency/30 text-emergency-light" :
                    item.status === 'Low Stock' ? "bg-warning/10 border-warning/30 text-warning-light" :
                    "bg-success/10 border-success/30 text-success-light"
                  )}>
                    {item.status === 'Out of Stock' && <AlertTriangle className="w-3 h-3" />}
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}
