'use client';

import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CreditCard, DollarSign, Receipt, Printer } from 'lucide-react';

const mockTransactions = [
  { id: 'TXN-401', rxId: 'RX-88219', patient: 'John Doe', amount: 45.50, insurance: 'Blue Cross', copay: 10, status: 'paid' },
  { id: 'TXN-402', rxId: 'RX-88218', patient: 'Maria Garcia', amount: 120.00, insurance: 'Medicare', copay: 25, status: 'pending' },
  { id: 'TXN-403', rxId: 'RX-88215', patient: 'Sarah Chen', amount: 78.25, insurance: 'Aetna', copay: 15, status: 'paid' },
];

export function PharmacyBillingPanel() {
  const totalRevenue = mockTransactions.filter(t => t.status === 'paid').reduce((s, t) => s + t.amount, 0);
  const pendingAmount = mockTransactions.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Revenue Today</p>
              <p className="text-xl font-black text-white font-mono">${totalRevenue.toFixed(2)}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Pending Payments</p>
              <p className="text-xl font-black text-warning-light font-mono">${pendingAmount.toFixed(2)}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Transactions</p>
              <p className="text-xl font-black text-white font-mono">{mockTransactions.length}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="flex flex-col">
        <CardHeader title="Transaction Ledger" icon={<CreditCard className="w-5 h-5" />} />
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-white/[0.06]">
                  <th className="text-left py-2 px-3">ID</th>
                  <th className="text-left py-2 px-3">Patient</th>
                  <th className="text-left py-2 px-3">Insurance</th>
                  <th className="text-right py-2 px-3">Amount</th>
                  <th className="text-right py-2 px-3">Copay</th>
                  <th className="text-center py-2 px-3">Status</th>
                  <th className="text-center py-2 px-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {mockTransactions.map(t => (
                  <tr key={t.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="py-3 px-3 text-gray-300 font-mono text-xs">{t.id}</td>
                    <td className="py-3 px-3 text-white font-medium">{t.patient}</td>
                    <td className="py-3 px-3 text-gray-400">{t.insurance}</td>
                    <td className="py-3 px-3 text-right text-white font-mono">${t.amount.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right text-gray-300 font-mono">${t.copay}</td>
                    <td className="py-3 px-3 text-center">
                      <Badge variant={t.status === 'paid' ? 'success' : 'warning'} size="sm">{t.status}</Badge>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Button size="sm" variant="ghost" leftIcon={<Printer className="w-3 h-3" />}>Receipt</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
