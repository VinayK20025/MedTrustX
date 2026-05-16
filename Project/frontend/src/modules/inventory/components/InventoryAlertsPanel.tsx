'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ReorderAlert } from '../types/inventory.types';
import { useTriggerReorder } from '../hooks/useInventoryAnalytics';
import { BellRing, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { reorders: ReorderAlert[]; }

export function InventoryAlertsPanel({ reorders }: Props) {
  const { mutate: reorder } = useTriggerReorder();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <BellRing className="w-4 h-4 text-orange-400" /> Replenishment Alerts
        </h3>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {reorders.length === 0 ? <p className="text-[12px] text-gray-500 italic">No pending reorders.</p> : reorders.map(alert => (
            <div key={alert.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04]">
              <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded">Action Required</span>
                <span className={cn('text-[9px] font-bold uppercase px-2 py-0.5 rounded',
                  alert.status === 'PR Generated' ? 'bg-success/15 text-success-light' : 'bg-warning/15 text-warning-light animate-pulse'
                )}>{alert.status}</span>
              </div>

              <h4 className="text-[13px] font-bold text-white mb-2 leading-snug">{alert.itemName}</h4>
              
              <div className="flex items-center gap-4 text-[11px] text-gray-400 mb-3">
                <span>Current: <strong className="text-emergency-light">{alert.currentStock}</strong></span>
                <span>Suggested: <strong className="text-white">{alert.suggestedOrder}</strong></span>
              </div>

              {alert.status === 'Pending' ? (
                <Button onClick={() => reorder({ id: alert.itemId, qty: alert.suggestedOrder })} className="w-full h-8 text-[11px] bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40">Trigger Purchase Request</Button>
              ) : (
                <Button disabled className="w-full h-8 text-[11px] bg-white/5 border-transparent text-gray-500" leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}>Request Sent to Procurement</Button>
              )}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
