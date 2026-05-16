'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { InventoryAlert, BudgetStatus } from '../types/procurement.types';
import { Activity, AlertTriangle, DollarSign } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { alerts: InventoryAlert[]; budgets: BudgetStatus[]; }

export function ProcurementInsightsPanel({ alerts, budgets }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" /> Stock & Budgets
        </h3>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        
        {/* Inventory Shortage Alerts */}
        <div className="p-4 space-y-3">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Low Stock Alerts</p>
          {alerts.map(alert => (
            <div key={alert.id} className={cn('rounded-xl border p-3 flex justify-between items-center',
              alert.status === 'Critical' ? 'bg-emergency/[0.05] border-emergency/30' : 'bg-warning/[0.05] border-warning/30'
            )}>
              <div>
                <h4 className="text-[13px] font-bold text-white mb-0.5 leading-snug">{alert.item}</h4>
                <p className="text-[10px] text-gray-400">{alert.department} • Min Level: {alert.minimumLevel}</p>
              </div>
              <div className="text-right shrink-0 ml-3">
                <span className={cn('text-[14px] font-black font-mono block', alert.status === 'Critical' ? 'text-emergency-light' : 'text-warning-light')}>{alert.currentStock} left</span>
                <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded uppercase', alert.status === 'Critical' ? 'bg-emergency/20 text-emergency-light' : 'bg-warning/20 text-warning-light')}>{alert.status}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Budgets */}
        <div className="p-4 border-t border-white/[0.04] bg-black/20 space-y-4 flex-1">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Department Budgets</p>
          {budgets.map(b => {
            const utilization = (b.utilized / b.allocated) * 100;
            return (
              <div key={b.id} className="bg-white/[0.02] border border-white/10 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-bold text-white">{b.category}</span>
                  <span className={cn('text-[10px] font-bold font-mono', utilization > 90 ? 'text-emergency-light' : utilization > 75 ? 'text-warning-light' : 'text-success-light')}>{utilization.toFixed(0)}% Used</span>
                </div>
                <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden border border-white/5 mb-2">
                  <div className={cn('h-full', utilization > 90 ? 'bg-emergency-light' : utilization > 75 ? 'bg-warning-light' : 'bg-success-light')} style={{ width: `${utilization}%` }} />
                </div>
                <div className="flex justify-between items-center text-[10px] text-gray-500">
                  <span>Used: ${(b.utilized/1000).toFixed(1)}k</span>
                  <span>Total: ${(b.allocated/1000).toFixed(1)}k</span>
                </div>
              </div>
            );
          })}
        </div>

      </CardBody>
    </Card>
  );
}
