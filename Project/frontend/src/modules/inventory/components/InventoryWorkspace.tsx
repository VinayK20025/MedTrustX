'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { InventoryItem, StockMovement, ExpiryItem } from '../types/inventory.types';
import { useDiscardExpired } from '../hooks/useInventoryAnalytics';
import { Package, ArrowRightLeft, CalendarClock, AlertTriangle, Trash2, ShieldAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { item?: InventoryItem; movements: StockMovement[]; expiries: ExpiryItem[]; }

export function InventoryWorkspace({ item, movements, expiries }: Props) {
  const { mutate: discard } = useDiscardExpired();
  const [tab, setTab] = useState<'movements' | 'expiry'>('movements');

  if (!item) {
    return (
      <Card className="border-blue-500/20 shadow-glass bg-[#020406] h-full flex items-center justify-center">
        <div className="text-center opacity-40">
          <Package className="w-12 h-12 text-blue-500 mx-auto mb-3" />
          <p className="text-gray-400 font-bold">Select an item to view stock history and batch details.</p>
        </div>
      </Card>
    );
  }

  const itemMoves = movements.filter(m => m.itemId === item.id);
  const itemExps = expiries.filter(e => e.itemId === item.id);

  return (
    <Card className="border-blue-500/20 shadow-glass bg-[#020406] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-800 via-blue-500 to-indigo-500" />

      <CardHeader className="border-b border-white/[0.04] p-5">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.id} • {item.category}</span>
          <span className={cn('text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider',
            item.status === 'Critical' ? 'bg-emergency/15 text-emergency-light border-emergency/30 animate-pulse' :
            item.status === 'Low' ? 'bg-warning/15 text-warning-light border-warning/30' : 'bg-success/15 text-success-light border-success/30'
          )}>{item.status} Stock</span>
        </div>
        <h3 className="text-[20px] font-black text-white leading-tight">{item.name}</h3>
        <div className="mt-4 flex gap-4 text-[13px] text-gray-300">
          <span className="bg-black/40 px-3 py-1.5 rounded border border-white/5 flex flex-col">
            <span className="text-[9px] text-gray-500 uppercase font-bold mb-0.5">Current Stock</span>
            <strong className={cn('text-lg', item.status === 'Critical' ? 'text-emergency-light' : 'text-white')}>{item.currentStock} {item.unit}</strong>
          </span>
          <span className="bg-black/40 px-3 py-1.5 rounded border border-white/5 flex flex-col">
            <span className="text-[9px] text-gray-500 uppercase font-bold mb-0.5">Location</span>
            <strong className="text-md text-white">{item.location}</strong>
          </span>
        </div>
      </CardHeader>

      <div className="flex border-b border-white/[0.05] px-5 bg-black/20">
        <button onClick={() => setTab('movements')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors mr-1', tab === 'movements' ? 'text-blue-400 border-blue-400' : 'text-gray-500 border-transparent hover:text-gray-300')}><ArrowRightLeft className="w-3.5 h-3.5" /> Stock Movements</button>
        <button onClick={() => setTab('expiry')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors', tab === 'expiry' ? 'text-blue-400 border-blue-400' : 'text-gray-500 border-transparent hover:text-gray-300')}>
           <CalendarClock className="w-3.5 h-3.5" /> Expiry Tracking 
           {itemExps.length > 0 && <span className="bg-emergency-light text-black text-[9px] px-1.5 py-0.5 rounded-full ml-1">{itemExps.length}</span>}
        </button>
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto">

        {/* MOVEMENTS TAB */}
        {tab === 'movements' && (
          <div className="p-5 space-y-3 animate-fade-in">
            {itemMoves.length === 0 ? <p className="text-[12px] text-gray-500 italic">No recent movements.</p> : itemMoves.map(mov => (
              <div key={mov.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex items-center justify-between transition-colors hover:bg-white/[0.04]">
                <div className="flex items-center gap-4">
                  <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0 border',
                    mov.type === 'Inbound' ? 'bg-success/10 border-success/30 text-success-light' : 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                  )}>
                    <ArrowRightLeft className={cn('w-4 h-4', mov.type === 'Outbound' && 'rotate-180')} />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-white mb-0.5">{mov.type} {mov.type === 'Outbound' ? 'to' : 'from'} {mov.department || 'External Supplier'}</h4>
                    <p className="text-[10px] text-gray-500 font-mono">{mov.id} • {new Date(mov.date).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn('text-[16px] font-black font-mono', mov.type === 'Inbound' ? 'text-success-light' : 'text-white')}>
                    {mov.type === 'Inbound' ? '+' : '-'}{mov.quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EXPIRY TAB */}
        {tab === 'expiry' && (
          <div className="p-5 space-y-4 animate-fade-in">
            {itemExps.length === 0 ? <p className="text-[12px] text-gray-500 italic">No batches close to expiry.</p> : itemExps.map(exp => (
              <div key={exp.id} className={cn('bg-white/[0.02] border rounded-xl p-5',
                exp.status === 'Expired' ? 'border-emergency/30 bg-emergency/[0.05]' : 'border-warning/30 bg-warning/[0.05]'
              )}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    {exp.status === 'Expired' ? <ShieldAlert className="w-4 h-4 text-emergency-light" /> : <AlertTriangle className="w-4 h-4 text-warning-light" />}
                    <span className={cn('text-[10px] font-bold uppercase tracking-widest', exp.status === 'Expired' ? 'text-emergency-light' : 'text-warning-light')}>{exp.status}</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 bg-black/30 px-2 py-0.5 rounded border border-white/10">Batch: {exp.batchNumber}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase font-bold mb-1">Expiry Date</p>
                    <p className={cn('text-[16px] font-black', exp.status === 'Expired' ? 'text-emergency-light' : 'text-warning-light')}>{new Date(exp.expiryDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase font-bold mb-1">Quantity</p>
                    <p className="text-[16px] font-black text-white">{exp.quantity} <span className="text-[11px] font-normal text-gray-500">{item.unit}</span></p>
                  </div>
                  {exp.status === 'Expired' && (
                    <Button onClick={() => discard(exp.id)} className="h-9 bg-emergency/20 hover:bg-emergency/30 text-emergency-light border border-emergency/40" leftIcon={<Trash2 className="w-3.5 h-3.5" />}>Discard Waste</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </CardBody>
    </Card>
  );
}
