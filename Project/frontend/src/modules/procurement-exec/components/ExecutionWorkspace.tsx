'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ExecPurchaseRequest, ExecPurchaseOrder, VendorContact } from '../types/procurement-exec.types';
import { useExecCreatePO, useUpdateDeliveryStatus } from '../hooks/useProcurementExecAnalytics';
import { Truck, ShoppingCart, UserCheck, AlertTriangle, Play, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { request?: ExecPurchaseRequest; deliveries: ExecPurchaseOrder[]; vendors: VendorContact[]; }

export function ExecutionWorkspace({ request, deliveries, vendors }: Props) {
  const { mutate: createPo } = useExecCreatePO();
  const { mutate: updateDelivery } = useUpdateDeliveryStatus();
  const [tab, setTab] = useState<'create' | 'track' | 'vendors'>('create');

  const tabs = [
    { key: 'create' as const, label: 'Fast PO Creation', icon: Play },
    { key: 'track' as const, label: 'Delivery Tracking', icon: Truck },
    { key: 'vendors' as const, label: 'Vendor Directory', icon: UserCheck },
  ];

  return (
    <Card className="border-emerald-500/20 shadow-glass bg-[#020504] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-700 via-emerald-500 to-green-500" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <h3 className="text-[16px] font-black text-white flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-emerald-400" /> Execution Workspace
        </h3>
        <p className="text-[11px] text-gray-500 mt-0.5">Rapid PO generation, dispatch, and vendor follow-ups.</p>
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

        {/* PO CREATION TAB */}
        {tab === 'create' && (
          <div className="p-6 animate-fade-in">
            {!request ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-40">
                <Play className="w-12 h-12 text-emerald-500 mb-4" />
                <p className="text-gray-400 font-bold">Select an approved PR from the queue to execute.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Approved Request: {request.id}</span>
                  </div>
                  <h4 className="text-[20px] font-black text-white mb-2">{request.item}</h4>
                  <div className="flex gap-4 text-[13px] text-gray-300">
                    <span className="bg-black/40 px-2 py-1 rounded border border-white/5">Qty: <strong className="text-white">{request.quantity}</strong></span>
                    <span className="bg-black/40 px-2 py-1 rounded border border-white/5">Dept: {request.department}</span>
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5 space-y-4">
                  <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><FileText className="w-4 h-4" /> Generate Purchase Order</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-gray-500 block mb-1 font-bold">Select Vendor (Auto-suggested based on category)</label>
                      <select className="w-full bg-black/40 border border-white/10 rounded-lg h-10 px-3 text-[13px] text-white focus:outline-none focus:border-emerald-500/50">
                        {vendors.map(v => <option key={v.id} value={v.id}>{v.name} ({v.category})</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <div>
                         <label className="text-[11px] text-gray-500 block mb-1 font-bold">Negotiated Price (Total)</label>
                         <input type="number" placeholder="$0.00" className="w-full bg-black/40 border border-white/10 rounded-lg h-10 px-3 text-[13px] text-white focus:outline-none focus:border-emerald-500/50" />
                       </div>
                       <div>
                         <label className="text-[11px] text-gray-500 block mb-1 font-bold">Expected ETA</label>
                         <input type="date" className="w-full bg-black/40 border border-white/10 rounded-lg h-10 px-3 text-[13px] text-white focus:outline-none focus:border-emerald-500/50" />
                       </div>
                    </div>
                  </div>

                  <Button onClick={() => createPo({ requestId: request.id, payload: {} })} className="w-full h-12 mt-4 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 font-bold" leftIcon={<ShoppingCart className="w-4 h-4" />}>Create & Dispatch PO</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TRACKING TAB */}
        {tab === 'track' && (
          <div className="p-5 space-y-3 animate-fade-in">
            {deliveries.map(del => (
              <div key={del.id} className={cn('bg-white/[0.02] border rounded-xl p-4 transition-colors',
                del.status === 'Delayed' ? 'border-emergency/30 bg-emergency/[0.03]' : 'border-white/10 hover:bg-white/[0.04]'
              )}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-1.5 py-0.5 rounded">{del.id}</span>
                    {del.status === 'Delayed' && <AlertTriangle className="w-3 h-3 text-emergency-light" />}
                  </div>
                  <span className={cn('text-[9px] font-bold uppercase px-2 py-0.5 rounded tracking-wider',
                    del.status === 'Delayed' ? 'bg-emergency/15 text-emergency-light' : 
                    del.status === 'In Transit' ? 'bg-blue-500/15 text-blue-300' : 'bg-success/15 text-success-light'
                  )}>{del.status}</span>
                </div>
                
                <h4 className="text-[14px] font-bold text-white leading-snug">{del.item} <span className="text-gray-500 font-normal ml-1">(Qty: {del.quantity})</span></h4>
                <p className="text-[11px] text-gray-400 mt-1">Vendor: {del.vendor}</p>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                  <span className={cn('text-[11px] font-bold flex items-center gap-1.5', del.status === 'Delayed' ? 'text-emergency-light' : 'text-gray-400')}>
                     <Truck className="w-3.5 h-3.5" /> ETA: {new Date(del.eta).toLocaleDateString()}
                  </span>
                  {del.status !== 'Delivered' && (
                    <Button size="sm" onClick={() => updateDelivery({ id: del.id, status: 'Delivered' })} className="h-7 text-[10px] bg-white/10 hover:bg-white/20 border-transparent text-white" leftIcon={<CheckCircle2 className="w-3 h-3" />}>Mark Delivered</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VENDORS TAB */}
        {tab === 'vendors' && (
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            {vendors.map(v => (
              <div key={v.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-[14px] font-bold text-white truncate">{v.name}</h4>
                </div>
                <div className="space-y-1 mt-3">
                  <p className="text-[11px] text-gray-400">Contact: <span className="text-white">{v.contactPerson}</span></p>
                  <p className="text-[11px] text-gray-400">Phone: <span className="text-white">{v.phone}</span></p>
                  <p className="text-[11px] text-gray-400">Email: <span className="text-white">{v.email}</span></p>
                </div>
                <Button size="sm" className="w-full mt-4 h-8 text-[11px] bg-white/5 hover:bg-white/10 border-transparent">Message Vendor</Button>
              </div>
            ))}
          </div>
        )}

      </CardBody>
    </Card>
  );
}
