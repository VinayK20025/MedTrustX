'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { BillSummary, PaymentRecord } from '../types/billing.types';
import { useProcessPayment, useFinalizeBill } from '../hooks/useBillingAnalytics';
import { Calculator, CreditCard, Banknote, Smartphone, ShieldCheck, Lock, Ban } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { summary: BillSummary; payments: PaymentRecord[]; billId: string; }

const methodIcon: Record<string, React.ReactNode> = {
  Cash: <Banknote className="w-3.5 h-3.5" />,
  Card: <CreditCard className="w-3.5 h-3.5" />,
  UPI: <Smartphone className="w-3.5 h-3.5" />,
  Insurance: <ShieldCheck className="w-3.5 h-3.5" />,
};

export function BillingSummaryPanel({ summary, payments, billId }: Props) {
  const { mutate: pay, isPending: isPaying } = useProcessPayment();
  const { mutate: finalize, isPending: isFinalizing } = useFinalizeBill();
  const isFullyPaid = summary.balance <= 0;

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Financial Summary */}
      <Card className={cn("shadow-glass flex-1 flex flex-col", isFullyPaid ? "border-success/25" : "border-white/[0.06]")}>
        <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex items-center gap-2">
          <Calculator className="w-3.5 h-3.5 text-green-400" />
          <h3 className="text-[12px] font-bold tracking-widest text-green-400">BILL SUMMARY</h3>
        </CardHeader>
        <CardBody className="p-4 flex-1 flex flex-col">
          <div className="space-y-3 text-[12px] font-mono flex-1">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="text-white">₹{summary.subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Discount ({summary.discountPercent}%)</span><span className="text-success-light">-₹{summary.discount.toLocaleString()}</span></div>
            {summary.insuranceCovered > 0 && <div className="flex justify-between"><span className="text-gray-500">Insurance</span><span className="text-blue-300">-₹{summary.insuranceCovered.toLocaleString()}</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">Tax</span><span className="text-white">+₹{summary.tax.toLocaleString()}</span></div>
            <div className="border-t border-white/5 pt-3 flex justify-between">
              <span className="text-gray-400 font-bold">Net Payable</span>
              <span className="text-white font-bold text-[16px]">₹{summary.netPayable.toLocaleString()}</span>
            </div>
            <div className="flex justify-between"><span className="text-gray-500">Paid</span><span className="text-success-light">₹{summary.amountPaid.toLocaleString()}</span></div>
            <div className="border-t border-white/5 pt-3 flex justify-between">
              <span className="text-gray-400 font-bold">Balance</span>
              <span className={cn("font-bold text-[16px]", summary.balance > 0 ? "text-emergency-light" : "text-success-light")}>
                ₹{summary.balance.toLocaleString()}
              </span>
            </div>
          </div>
          {summary.balance > 0 && (
            <div className="text-[10px] text-emergency-light bg-emergency/10 border border-emergency/20 p-2.5 rounded-lg flex items-center gap-1.5 mt-3">
              <Ban className="w-3.5 h-3.5 shrink-0" /> Payment incomplete — ₹{summary.balance.toLocaleString()} pending.
            </div>
          )}
        </CardBody>
      </Card>

      {/* Quick Payment */}
      <Card className="border-white/[0.06] shadow-glass">
        <CardHeader className="border-b border-white/[0.04] px-4 py-3">
          <h3 className="text-[12px] font-bold tracking-widest text-gray-400">QUICK PAYMENT</h3>
        </CardHeader>
        <CardBody className="p-4">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {['Cash', 'Card', 'UPI', 'Insurance'].map(m => (
              <Button key={m} size="sm" disabled={isPaying || isFullyPaid} onClick={() => pay({ billId, method: m, amount: summary.balance })}
                className="h-10 bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-bold border border-white/10 hover:border-green-500/30 flex items-center gap-1.5 justify-center">
                {methodIcon[m]} {m}
              </Button>
            ))}
          </div>
          <Button disabled={!isFullyPaid || isFinalizing} onClick={() => finalize(billId)}
            className={cn("w-full h-11 font-bold text-[13px]", isFullyPaid ? "bg-green-600 hover:bg-green-500 text-white" : "bg-gray-700 text-gray-500 cursor-not-allowed")}
            leftIcon={<Lock className="w-4 h-4" />}>
            FINALIZE & LOCK BILL
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
