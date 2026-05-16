'use client';

import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CreditCard, ShoppingCart, ArrowRightLeft, DollarSign } from 'lucide-react';

const mockOtcItems = [
  { id: 'OTC-1', name: 'Paracetamol 500mg (Strip)', price: 2.50, qty: 2 },
  { id: 'OTC-2', name: 'Cough Syrup 100ml', price: 5.99, qty: 1 },
  { id: 'OTC-3', name: 'Band-Aid Adhesive Strips', price: 3.25, qty: 1 },
];

export function PharmacyAssistantBillingPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Point of Sale & Billing" icon={<CreditCard className="w-5 h-5 text-emerald-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.06] bg-surface-dark">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <div><p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Cash Today</p><p className="text-lg font-black text-white font-mono">$342</p></div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.06] bg-surface-dark">
            <CreditCard className="w-5 h-5 text-blue-400" />
            <div><p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Card Today</p><p className="text-lg font-black text-white font-mono">$518</p></div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.06] bg-surface-dark">
            <ShoppingCart className="w-5 h-5 text-amber-400" />
            <div><p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Transactions</p><p className="text-lg font-black text-white font-mono">47</p></div>
          </div>
        </div>
        <div className="text-center text-sm text-gray-500 py-8 border border-dashed border-white/10 rounded-lg">
          Scan barcode or search to start a new transaction.
        </div>
      </CardBody>
    </Card>
  );
}

export function PharmacyAssistantOTCPanel() {
  const total = mockOtcItems.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Over-the-Counter Sales" icon={<ShoppingCart className="w-5 h-5 text-amber-400" />} />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2 mb-4">
          {mockOtcItems.map(i => (
            <div key={i.id} className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.06] bg-surface-dark">
              <div className="flex-1"><p className="text-sm text-white font-medium">{i.name}</p></div>
              <p className="text-xs text-gray-400">×{i.qty}</p>
              <p className="text-sm text-white font-mono">${(i.price * i.qty).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg border border-teal-500/30 bg-teal-500/5">
          <p className="text-sm font-semibold text-white">Total</p>
          <p className="text-lg font-black text-white font-mono">${total.toFixed(2)}</p>
        </div>
        <div className="mt-4 flex gap-2">
          <Button className="flex-1">Cash</Button>
          <Button className="flex-1" variant="outline">Card</Button>
        </div>
      </CardBody>
    </Card>
  );
}

export function PharmacyAssistantHandoverPanel() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader title="Pharmacist Consultations" icon={<ArrowRightLeft className="w-5 h-5 text-violet-400" />} subtitle="Handover queue for pharmacist review" />
      <CardBody className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.06] bg-surface-dark">
            <ArrowRightLeft className="w-4 h-4 text-violet-400 flex-shrink-0" />
            <div className="flex-1"><p className="text-sm text-white font-medium">Patient inquiring about drug interactions</p><p className="text-xs text-gray-400">Counter 3 · 2 min ago</p></div>
            <Badge variant="warning" size="sm">Waiting</Badge>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.06] bg-surface-dark">
            <ArrowRightLeft className="w-4 h-4 text-success flex-shrink-0" />
            <div className="flex-1"><p className="text-sm text-white font-medium">Dosage clarification request</p><p className="text-xs text-gray-400">Counter 1 · 8 min ago</p></div>
            <Badge variant="success" size="sm">Resolved</Badge>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
