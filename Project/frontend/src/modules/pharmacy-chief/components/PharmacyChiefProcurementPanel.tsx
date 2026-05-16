'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { PurchaseOrder } from '../types/pharmacyChief.types';
import { useApprovePurchaseOrder } from '../hooks/usePharmacyChiefAnalytics';
import { ShoppingCart, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { orders: PurchaseOrder[]; }

export function PharmacyChiefProcurementPanel({ orders }: Props) {
  const { mutate: approvePO, isPending } = useApprovePurchaseOrder();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/15"><ShoppingCart className="w-4 h-4 text-indigo-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Pending PO Approvals</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        <div className="divide-y divide-white/[0.03]">
          {orders.map(order => (
            <div key={order.id} className="p-5 hover:bg-white/[0.015] transition-colors border-l-2 border-transparent hover:border-indigo-500">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-[13px] font-bold text-white">{order.vendorName}</h4>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">{order.id} • {order.itemsCount} Items</p>
                </div>
                <div className="text-right">
                  <span className="text-[15px] font-black text-indigo-400 font-mono block">
                    ${order.totalAmount.toLocaleString()}
                  </span>
                  <span className={cn("text-[9px] uppercase font-bold px-1.5 py-0.5 rounded mt-1 inline-block", 
                    order.status === 'Pending Approval' ? "bg-warning/20 text-warning-light" : "bg-success/20 text-success-light"
                  )}>
                    {order.status}
                  </span>
                </div>
              </div>
              
              {order.status === 'Pending Approval' && (
                <div className="mt-4 flex justify-end">
                  <Button 
                    size="sm" 
                    onClick={() => approvePO(order.id)}
                    disabled={isPending}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-8 text-[11px]"
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    Approve Order
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
