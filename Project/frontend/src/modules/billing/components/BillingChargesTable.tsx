'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { BillLineItem } from '../types/billing.types';
import { ReceiptText, AlertTriangle, Copy } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { items: BillLineItem[]; }

const catColor: Record<BillLineItem['category'], string> = {
  Consultation: 'bg-blue-500/15 text-blue-300',
  Lab: 'bg-violet-500/15 text-violet-300',
  Pharmacy: 'bg-emerald-500/15 text-emerald-300',
  Procedure: 'bg-amber-500/15 text-amber-300',
  Room: 'bg-indigo-500/15 text-indigo-300',
  Other: 'bg-gray-500/15 text-gray-300',
};

export function BillingChargesTable({ items }: Props) {
  const total = items.reduce((s, i) => s + i.amount, 0);

  return (
    <Card className="border-green-500/25 shadow-glass bg-[#030a04] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-600 via-emerald-500 to-green-600" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-green-500/15"><ReceiptText className="w-4 h-4 text-green-400" /></div>
          <div>
            <h3 className="text-[15px] font-bold text-white tracking-wide">Charges Breakdown</h3>
            <span className="text-[10px] text-gray-500 font-mono">{items.length} line items</span>
          </div>
        </div>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto">
        <table className="w-full text-left text-[12px]">
          <thead className="bg-black/30 text-[10px] text-gray-500 uppercase tracking-widest border-b border-white/5 sticky top-0 z-10">
            <tr>
              <th className="px-5 py-3">Service</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3 text-right">Qty</th>
              <th className="px-5 py-3 text-right">Rate</th>
              <th className="px-5 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {items.map(item => (
              <tr key={item.id} className={cn("hover:bg-white/[0.02] transition-colors", item.hasDuplicate && "bg-warning/[0.04]")}>
                <td className="px-5 py-3">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    {item.serviceName}
                    {item.hasDuplicate && (
                      <span className="inline-flex items-center gap-0.5 text-[8px] bg-warning/20 text-warning-light px-1.5 py-0.5 rounded font-bold">
                        <Copy className="w-2.5 h-2.5" /> DUP?
                      </span>
                    )}
                  </span>
                  <span className="text-[9px] text-gray-600 font-mono">{item.source}</span>
                </td>
                <td className="px-5 py-3"><span className={cn('text-[9px] font-bold px-2 py-0.5 rounded', catColor[item.category])}>{item.category}</span></td>
                <td className="px-5 py-3 text-right text-gray-300 font-mono">{item.quantity}</td>
                <td className="px-5 py-3 text-right text-gray-300 font-mono">₹{item.unitPrice.toLocaleString()}</td>
                <td className="px-5 py-3 text-right text-white font-bold font-mono">₹{item.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-white/10">
            <tr className="bg-black/20">
              <td colSpan={4} className="px-5 py-3 text-right text-[12px] font-bold text-gray-400 uppercase tracking-widest">Subtotal</td>
              <td className="px-5 py-3 text-right text-[14px] font-black text-white font-mono">₹{total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
        {items.some(i => i.hasDuplicate) && (
          <div className="mx-5 mb-4 mt-2 text-[10px] text-warning-light bg-warning/10 border border-warning/20 p-2.5 rounded-lg flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Potential duplicate charge detected. Please verify before finalizing.
          </div>
        )}
      </CardBody>
    </Card>
  );
}
