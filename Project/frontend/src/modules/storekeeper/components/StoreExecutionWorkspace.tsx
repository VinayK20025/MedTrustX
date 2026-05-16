'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { IncomingStock, IssueRequest, StoreInventoryItem, ExpiryAlert } from '../types/storekeeper.types';
import { useReceiveStock, useIssueStock } from '../hooks/useStorekeeperAnalytics';
import { Package, Truck, ArrowUpRight, Barcode, CheckCircle2, AlertTriangle, Crosshair } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { request?: IssueRequest; incoming: IncomingStock[]; inventory: StoreInventoryItem[]; expiries: ExpiryAlert[]; }

export function StoreExecutionWorkspace({ request, incoming, inventory, expiries }: Props) {
  const { mutate: receive } = useReceiveStock();
  const { mutate: issue } = useIssueStock();
  const [tab, setTab] = useState<'issuing' | 'receiving' | 'inventory'>('receiving');
  const [scanValue, setScanValue] = useState('');

  const tabs = [
    { key: 'receiving' as const, label: 'Inbound Receiving', icon: Truck },
    { key: 'issuing' as const, label: 'Department Dispatch', icon: ArrowUpRight },
    { key: 'inventory' as const, label: 'Bin / Expiry Check', icon: Package },
  ];

  return (
    <Card className="border-blue-500/20 shadow-glass bg-[#020406] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-500" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-[16px] font-black text-white flex items-center gap-2">
              <Barcode className="w-5 h-5 text-blue-400" /> Mobile Store Execution
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Scan barcodes to receive items, issue to departments, and verify bins.</p>
          </div>
        </div>
      </CardHeader>

      <div className="flex border-b border-white/[0.05] px-5 bg-black/20">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors mr-1',
              tab === t.key ? 'text-blue-400 border-blue-400' : 'text-gray-500 border-transparent hover:text-gray-300'
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
            <input type="text" placeholder="Scan Item Barcode or Enter ID..." value={scanValue} onChange={e => setScanValue(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-lg h-10 pl-9 pr-3 text-[13px] text-white focus:outline-none focus:border-blue-500/50" />
          </div>
          <Button className="h-10 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40" leftIcon={<Crosshair className="w-4 h-4" />}>Scan</Button>
        </div>

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
                  <span className="font-bold text-white">Expected Qty: {inc.quantity}</span>
                </div>

                {inc.status === 'Pending Receipt' && (
                  <div className="mt-4 pt-3 border-t border-white/5 flex gap-2">
                    <input type="number" defaultValue={inc.quantity} className="w-20 bg-black/40 border border-white/10 rounded-lg h-8 px-2 text-[12px] text-center text-white" />
                    <Button onClick={() => receive({ id: inc.id, qty: inc.quantity })} className="flex-1 h-8 text-[11px] bg-success/20 hover:bg-success/30 text-success-light border border-success/30" leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}>Verify & Accept Delivery</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ISSUING TAB */}
        {tab === 'issuing' && (
          <div className="p-5 animate-fade-in">
            {!request ? (
              <div className="flex flex-col items-center justify-center py-16 opacity-40">
                <ArrowUpRight className="w-12 h-12 text-blue-500 mb-4" />
                <p className="text-gray-400 font-bold">Select a dispatch request from the queue.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={cn('border rounded-xl p-5', request.priority === 'Urgent' ? 'bg-emergency/5 border-emergency/20' : 'bg-white/[0.02] border-white/10')}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{request.id}</span>
                    <span className="text-[10px] font-bold text-white bg-black/40 px-2 py-1 rounded border border-white/10">Dept: {request.department}</span>
                  </div>
                  <h4 className="text-[20px] font-black text-white mb-1">{request.item}</h4>
                  <p className="text-[13px] text-gray-300">Requested Qty: <strong className="text-white">{request.requestedQty}</strong></p>
                </div>

                <div className="bg-black/40 border border-white/5 rounded-xl p-5 text-center">
                  <Package className="w-8 h-8 text-gray-500 mx-auto mb-2 opacity-50" />
                  <p className="text-[12px] text-gray-400 mb-4">Scan item barcodes to pick and pack this request.</p>
                  <Button onClick={() => issue(request.id)} className="w-full h-12 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 font-bold text-[13px]" leftIcon={<CheckCircle2 className="w-4 h-4" />}>Confirm Dispatch to {request.department}</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* INVENTORY BINS TAB */}
        {tab === 'inventory' && (
          <div className="p-5 space-y-4 animate-fade-in">
            {expiries.length > 0 && (
              <div className="bg-emergency/10 border border-emergency/30 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-emergency-light" />
                  <div>
                    <p className="text-[12px] font-bold text-emergency-light uppercase tracking-widest mb-0.5">Urgent Expiry Removal</p>
                    <p className="text-[11px] text-red-200">Please pull {expiries[0].batch} ({expiries[0].item}) from shelves immediately.</p>
                  </div>
                </div>
                <Button size="sm" className="h-8 text-[11px] bg-emergency/20 text-emergency-light border border-emergency/40">View Bin</Button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {inventory.map(inv => (
                <div key={inv.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-400 bg-black/30 px-2 py-0.5 rounded border border-white/5">Bin: {inv.locationBin}</span>
                  </div>
                  <h4 className="text-[13px] font-bold text-white leading-snug mb-1">{inv.name}</h4>
                  <p className="text-[11px] text-gray-400">Qty: <strong className={cn(inv.status === 'Low' ? 'text-warning-light' : 'text-white')}>{inv.quantity}</strong></p>
                </div>
              ))}
            </div>
          </div>
        )}

      </CardBody>
    </Card>
  );
}
