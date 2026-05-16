'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { TrackedOrder, VendorPerformance } from '../types/supply-chain.types';
import { useContactVendor } from '../hooks/useSupplyChainAnalytics';
import { Network, Truck, AlertTriangle, Building2, PhoneForwarded } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { orders: TrackedOrder[]; vendors: VendorPerformance[]; }

export function CoordinationWorkspace({ orders, vendors }: Props) {
  const { mutate: contactVendor } = useContactVendor();
  const [tab, setTab] = useState<'orders' | 'vendors'>('orders');

  return (
    <Card className="border-purple-500/20 shadow-glass bg-[#030205] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-800 via-fuchsia-600 to-purple-500" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <h3 className="text-[16px] font-black text-white flex items-center gap-2">
          <Network className="w-5 h-5 text-purple-400" /> Coordination Workspace
        </h3>
        <p className="text-[11px] text-gray-500 mt-0.5">Track active orders across all modules and manage vendor delays.</p>
      </CardHeader>

      <div className="flex border-b border-white/[0.05] px-5 bg-black/20">
        <button onClick={() => setTab('orders')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors mr-1', tab === 'orders' ? 'text-purple-400 border-purple-400' : 'text-gray-500 border-transparent hover:text-gray-300')}><Truck className="w-3.5 h-3.5" /> Order Tracking</button>
        <button onClick={() => setTab('vendors')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors', tab === 'vendors' ? 'text-purple-400 border-purple-400' : 'text-gray-500 border-transparent hover:text-gray-300')}><Building2 className="w-3.5 h-3.5" /> Vendor Performance</button>
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto">

        {tab === 'orders' && (
          <div className="p-5 space-y-3 animate-fade-in">
            {orders.map(ord => (
              <div key={ord.id} className={cn('bg-white/[0.02] border rounded-xl p-4 transition-colors',
                ord.status === 'Critical Shortage' ? 'border-emergency/40 bg-emergency/[0.05]' :
                ord.status === 'Delayed' ? 'border-warning/30 bg-warning/[0.03]' : 'border-white/10 hover:bg-white/[0.04]'
              )}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-1.5 py-0.5 rounded">{ord.id}</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Stage: <strong className="text-white">{ord.stage}</strong></span>
                  </div>
                  <span className={cn('text-[9px] font-bold uppercase px-2 py-0.5 rounded tracking-wider flex items-center gap-1',
                    ord.status === 'Critical Shortage' ? 'bg-emergency/20 text-emergency-light' : 
                    ord.status === 'Delayed' ? 'bg-warning/15 text-warning-light' : 'bg-success/15 text-success-light'
                  )}>
                    {ord.status === 'Critical Shortage' && <AlertTriangle className="w-3 h-3" />}
                    {ord.status}
                  </span>
                </div>
                
                <h4 className="text-[14px] font-bold text-white mb-1 leading-snug">{ord.item}</h4>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                  <p className="text-[11px] text-gray-400">Vendor: {ord.vendor}</p>
                  <p className={cn('text-[11px] font-bold', ord.status === 'Delayed' ? 'text-warning-light' : 'text-gray-400')}>
                    ETA: {new Date(ord.eta).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'vendors' && (
          <div className="p-5 space-y-3 animate-fade-in">
            {vendors.map(ven => (
              <div key={ven.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-[14px] font-bold text-white mb-1">{ven.name}</h4>
                  <p className="text-[11px] text-gray-400">Active Orders: <strong className="text-white">{ven.activeOrders}</strong></p>
                </div>
                <div className="text-right flex items-center gap-6">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">On-Time Rate</p>
                    <p className={cn('text-[16px] font-black font-mono', ven.onTimeRate >= 95 ? 'text-success-light' : ven.onTimeRate >= 85 ? 'text-warning-light' : 'text-emergency-light')}>{ven.onTimeRate}%</p>
                  </div>
                  <Button onClick={() => contactVendor(ven.id)} size="sm" className="h-8 text-[11px] bg-purple-500/20 text-purple-400 border border-purple-500/40 hover:bg-purple-500/30" leftIcon={<PhoneForwarded className="w-3.5 h-3.5" />}>Follow Up</Button>
                </div>
              </div>
            ))}
          </div>
        )}

      </CardBody>
    </Card>
  );
}
