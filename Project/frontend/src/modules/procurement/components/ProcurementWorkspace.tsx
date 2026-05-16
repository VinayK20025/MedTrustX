'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { PurchaseRequest, PurchaseOrder, Vendor } from '../types/procurement.types';
import { useApprovePurchaseRequest, useRejectPurchaseRequest, useCreatePurchaseOrder } from '../hooks/useProcurementAnalytics';
import { ClipboardList, ShoppingCart, Truck, CheckCircle2, XCircle, FileText, Briefcase } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { request?: PurchaseRequest; orders: PurchaseOrder[]; vendors: Vendor[]; }

export function ProcurementWorkspace({ request, orders, vendors }: Props) {
  const { mutate: approve } = useApprovePurchaseRequest();
  const { mutate: reject } = useRejectPurchaseRequest();
  const { mutate: createPo } = useCreatePurchaseOrder();
  const [tab, setTab] = useState<'review' | 'orders' | 'vendors'>('review');

  const tabs = [
    { key: 'review' as const, label: 'PR Approval', icon: ClipboardList },
    { key: 'orders' as const, label: 'Active POs', icon: ShoppingCart },
    { key: 'vendors' as const, label: 'Vendor Directory', icon: Briefcase },
  ];

  return (
    <Card className="border-emerald-500/20 shadow-glass bg-[#030504] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-800 via-teal-600 to-emerald-500" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <h3 className="text-[16px] font-black text-white flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-emerald-400" /> Procurement Operations
        </h3>
        <p className="text-[11px] text-gray-500 mt-0.5">Review purchase requests, issue POs, and track vendor deliveries.</p>
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

        {/* PR APPROVAL TAB */}
        {tab === 'review' && (
          <div className="p-6 animate-fade-in">
            {!request ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-40">
                <ClipboardList className="w-12 h-12 text-emerald-500 mb-4" />
                <p className="text-gray-400 font-bold">Select a purchase request from the list to review.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{request.id} • {request.category}</span>
                    <span className={cn('text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider',
                      request.priority === 'Critical' ? 'bg-emergency/15 text-emergency-light border-emergency/30' : 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                    )}>{request.priority} Priority</span>
                  </div>
                  <h4 className="text-[20px] font-black text-white mb-2">{request.item}</h4>
                  <div className="flex items-center gap-4 text-[13px] text-gray-300 mb-4">
                    <span className="bg-black/40 px-2 py-1 rounded border border-white/5">Qty Requested: <strong className="text-white">{request.quantity}</strong></span>
                    <span>Department: {request.department}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => approve(request.id)} className="flex-1 h-12 bg-success/20 hover:bg-success/30 text-success-light border border-success/40" leftIcon={<CheckCircle2 className="w-4 h-4" />}>Approve Request</Button>
                  <Button onClick={() => reject({ id: request.id, reason: 'Budget Exceeded' })} className="flex-1 h-12 bg-emergency/20 hover:bg-emergency/30 text-emergency-light border border-emergency/40" leftIcon={<XCircle className="w-4 h-4" />}>Reject Request</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ACTIVE POs TAB */}
        {tab === 'orders' && (
          <div className="p-5 space-y-3 animate-fade-in">
            {orders.map(po => (
              <div key={po.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-white/[0.04]">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">{po.id}</span>
                    <span className={cn('text-[9px] font-bold uppercase px-2 py-0.5 rounded tracking-wider',
                      po.status === 'Delivered' ? 'bg-success/15 text-success-light' : po.status === 'In Transit' ? 'bg-blue-500/15 text-blue-300' : 'bg-warning/15 text-warning-light'
                    )}>{po.status}</span>
                  </div>
                  <h4 className="text-[14px] font-bold text-white">{po.item} <span className="text-gray-500 font-normal ml-1">(Qty: {po.quantity})</span></h4>
                  <p className="text-[11px] text-gray-400 mt-1">Vendor: <span className="text-gray-300">{po.vendor}</span> • Value: ${po.totalCost.toLocaleString()}</p>
                </div>
                
                <div className="text-right shrink-0">
                  {po.eta ? (
                    <p className="text-[11px] text-emerald-400 flex items-center justify-end gap-1.5"><Truck className="w-3.5 h-3.5" /> ETA: {new Date(po.eta).toLocaleDateString()}</p>
                  ) : (
                    <Button size="sm" className="h-8 text-[11px] bg-white/10 hover:bg-white/20 text-white border-transparent">Track Shipment</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VENDORS TAB */}
        {tab === 'vendors' && (
          <div className="p-5 space-y-3 animate-fade-in">
            {vendors.map(ven => (
              <div key={ven.id} className={cn('bg-white/[0.02] border rounded-xl p-4 flex items-center justify-between transition-colors',
                ven.status === 'Blacklisted' ? 'border-emergency/30 bg-emergency/[0.03]' : 'border-white/10 hover:bg-white/[0.04]'
              )}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-[14px] font-bold text-white">{ven.name}</h4>
                    <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest',
                      ven.status === 'Active' ? 'bg-success/10 text-success-light' : ven.status === 'Under Review' ? 'bg-warning/10 text-warning-light' : 'bg-emergency/20 text-emergency-light'
                    )}>{ven.status}</span>
                  </div>
                  <p className="text-[11px] text-gray-400">{ven.category} • Avg Delivery: {ven.avgDeliveryDays} Days</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Rating</p>
                  <p className={cn('text-[16px] font-black font-mono', ven.rating >= 4.0 ? 'text-success-light' : ven.rating >= 3.0 ? 'text-warning-light' : 'text-emergency-light')}>{ven.rating} / 5.0</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </CardBody>
    </Card>
  );
}
