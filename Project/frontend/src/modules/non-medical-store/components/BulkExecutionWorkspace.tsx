'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { BulkIncomingStock, BulkIssueRequest, NonMedicalInventoryItem, ConsumptionLog } from '../types/non-medical-store.types';
import { useReceiveBulkStock, useIssueBulkStock } from '../hooks/useNonMedicalStoreAnalytics';
import { PackageOpen, ArrowUpRight, Truck, Barcode, CheckCircle2, TrendingDown, LayoutGrid } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { request?: BulkIssueRequest; incoming: BulkIncomingStock[]; inventory: NonMedicalInventoryItem[]; consumption: ConsumptionLog[]; }

export function BulkExecutionWorkspace({ request, incoming, inventory, consumption }: Props) {
  const { mutate: receive } = useReceiveBulkStock();
  const { mutate: issue } = useIssueBulkStock();
  const [tab, setTab] = useState<'issuing' | 'receiving' | 'inventory'>('issuing');
  const [scanValue, setScanValue] = useState('');

  const tabs = [
    { key: 'issuing' as const, label: 'Fulfill Requests', icon: ArrowUpRight },
    { key: 'receiving' as const, label: 'Bulk Receiving', icon: Truck },
    { key: 'inventory' as const, label: 'Zone Management', icon: PackageOpen },
  ];

  return (
    <Card className="border-emerald-500/20 shadow-glass bg-[#020504] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-500" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-[16px] font-black text-white flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-emerald-400" /> Facility Supply Operations
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Bulk scan items, fulfill housekeeping/admin requests, and organize storage zones.</p>
          </div>
        </div>
      </CardHeader>

      <div className="flex border-b border-white/[0.05] px-5 bg-black/20">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors mr-1',
              tab === t.key ? 'text-emerald-400 border-emerald-400' : 'text-gray-500 border-transparent hover:text-gray-300'
            )}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto">

        {/* SCANNER BAR (Mock) */}
        <div className="p-4 bg-black/40 border-b border-white/[0.05] flex gap-2">
          <div className="relative flex-1">
            <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Scan Bulk Barcode..." value={scanValue} onChange={e => setScanValue(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-lg h-10 pl-9 pr-3 text-[13px] text-white focus:outline-none focus:border-emerald-500/50" />
          </div>
          <Button className="h-10 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold px-6">Process</Button>
        </div>

        {/* ISSUING TAB */}
        {tab === 'issuing' && (
          <div className="p-5 animate-fade-in">
            {!request ? (
              <div className="flex flex-col items-center justify-center py-16 opacity-40">
                <ArrowUpRight className="w-12 h-12 text-emerald-500 mb-4" />
                <p className="text-gray-400 font-bold">Select a facility request from the queue to process.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Request: {request.id}</span>
                    <span className="text-[10px] font-bold text-white bg-black/40 px-2 py-1 rounded border border-white/10">To: {request.department}</span>
                  </div>
                  
                  <div className="space-y-2 mb-5">
                     <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Requested Items</p>
                     {request.items.map((i, idx) => (
                       <div key={idx} className="flex justify-between items-center bg-black/30 p-2.5 rounded border border-white/5">
                          <span className="text-[13px] text-gray-300 font-semibold">{i.name}</span>
                          <span className="text-[12px] text-emerald-300 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{i.requestedQty} {i.unit}</span>
                       </div>
                     ))}
                  </div>

                  <Button onClick={() => issue(request.id)} className="w-full h-12 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-[13px]" leftIcon={<CheckCircle2 className="w-4 h-4" />}>Confirm Bulk Dispatch</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* RECEIVING TAB */}
        {tab === 'receiving' && (
          <div className="p-5 space-y-3 animate-fade-in">
            {incoming.map(inc => (
              <div key={inc.id} className={cn('bg-white/[0.02] border rounded-xl p-4',
                inc.status === 'Discrepancy' ? 'border-warning/30 bg-warning/[0.03]' : 'border-white/10 hover:bg-white/[0.04]'
              )}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">{inc.id} • {inc.poNumber}</span>
                  <span className={cn('text-[9px] font-bold uppercase px-2 py-0.5 rounded tracking-wider',
                    inc.status === 'Discrepancy' ? 'bg-warning/15 text-warning-light' : 'bg-blue-500/15 text-blue-300'
                  )}>{inc.status}</span>
                </div>
                <h4 className="text-[14px] font-bold text-white mb-1 leading-snug">{inc.item}</h4>
                <div className="flex justify-between items-center text-[11px] text-gray-400 mt-2">
                  <span>Vendor: {inc.vendor}</span>
                  <span className="font-bold text-white">Expected Qty: {inc.quantity} {inc.unit}</span>
                </div>

                {inc.status === 'Pending Receipt' && (
                  <div className="mt-4 pt-3 border-t border-white/5 flex gap-2">
                    <input type="number" defaultValue={inc.quantity} className="w-20 bg-black/40 border border-white/10 rounded-lg h-8 px-2 text-[12px] text-center text-white" />
                    <Button onClick={() => receive({ id: inc.id, qty: inc.quantity })} className="flex-1 h-8 text-[11px] bg-success/20 hover:bg-success/30 text-success-light border border-success/30" leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}>Verify & Accept Bulk Delivery</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* INVENTORY BINS TAB */}
        {tab === 'inventory' && (
          <div className="p-5 space-y-4 animate-fade-in">
            {/* Usage Insight */}
            {consumption.length > 0 && (
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <TrendingDown className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-[11px] font-bold text-blue-300 uppercase tracking-widest mb-0.5">High Consumption Detected</p>
                    <p className="text-[11px] text-gray-400">{consumption[0].department} used {consumption[0].quantityUsed} {consumption[0].item} this week.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {inventory.map(inv => (
                <div key={inv.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-400 bg-black/30 px-2 py-0.5 rounded border border-white/5">Zone: {inv.locationBin}</span>
                    <span className={cn('text-[9px] uppercase px-1.5 py-0.5 rounded border',
                      inv.category === 'Housekeeping' ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                    )}>{inv.category}</span>
                  </div>
                  <h4 className="text-[13px] font-bold text-white leading-snug mb-1">{inv.name}</h4>
                  <p className="text-[11px] text-gray-400">Current Qty: <strong className={cn(inv.status === 'Low' ? 'text-warning-light' : 'text-white')}>{inv.quantity} {inv.unit}</strong></p>
                </div>
              ))}
            </div>
          </div>
        )}

      </CardBody>
    </Card>
  );
}
