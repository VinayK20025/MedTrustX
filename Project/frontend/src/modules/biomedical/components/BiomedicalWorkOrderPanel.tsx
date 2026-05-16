'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { WorkOrder } from '../types/biomedical.types';
import { useUpdateWorkOrder } from '../hooks/useBiomedicalAnalytics';
import { Wrench, CheckCircle2, RotateCw, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { orders: WorkOrder[]; }

export function BiomedicalWorkOrderPanel({ orders }: Props) {
  const { mutate: updateOrder, isPending } = useUpdateWorkOrder();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/15"><Wrench className="w-4 h-4 text-blue-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Work Orders</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[350px]">
        <div className="divide-y divide-white/[0.03]">
          {orders.map(order => (
            <div key={order.id} className="p-5 hover:bg-white/[0.015] transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                  <h4 className="text-[13px] font-bold text-white flex items-center gap-2">
                    {order.deviceId}
                    {order.priority === 'Emergency' && <AlertTriangle className="w-3.5 h-3.5 text-emergency-light animate-pulse" />}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-1">"{order.issue}"</p>
                </div>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider whitespace-nowrap', 
                  order.priority === 'Emergency' ? 'bg-emergency/20 text-emergency-light' : 'bg-white/5 text-gray-400'
                )}>
                  {order.priority}
                </span>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center gap-2">
                  {order.status === 'In Progress' && <RotateCw className="w-3 h-3 text-blue-400 animate-spin-slow" />}
                  {order.status === 'Completed' && <CheckCircle2 className="w-3 h-3 text-success-light" />}
                  <span className="text-[10px] text-gray-400">Status: <strong className="text-white">{order.status}</strong></span>
                  <span className="text-[10px] text-gray-500">| Tech: {order.assignedTo}</span>
                </div>

                {order.status === 'Assigned' && (
                  <Button size="xs" onClick={() => updateOrder({ orderId: order.id, status: 'In Progress' })} disabled={isPending} className="h-7 text-[10px] bg-blue-600 hover:bg-blue-500 border-none font-bold text-white">
                    Start Work
                  </Button>
                )}
                {order.status === 'In Progress' && (
                  <Button size="xs" onClick={() => updateOrder({ orderId: order.id, status: 'Completed' })} disabled={isPending} className="h-7 text-[10px] bg-success hover:bg-success-light border-none font-bold text-white">
                    Mark Repaired
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
