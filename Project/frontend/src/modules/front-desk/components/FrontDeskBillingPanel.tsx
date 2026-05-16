import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useFrontDeskDashboard } from '../hooks/useFrontDeskAnalytics';
import type { QuickBillItem } from '../types/frontDesk.types';

export function FrontDeskBillingPanel() {
  const { data, isLoading } = useFrontDeskDashboard({});
  const [selected, setSelected] = useState<QuickBillItem[]>([]);
  const billable = data?.data?.billableServices ?? [];

  const toggleItem = (item: QuickBillItem) => {
    setSelected((prev) =>
      prev.some((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item]
    );
  };

  const total = selected.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-white tracking-wide">Quick Billing</h3>
      </CardHeader>
      <CardBody className="flex-1 overflow-y-auto p-5">
        {isLoading ? (
          <div className="text-gray-500">Loading services...</div>
        ) : (
          <div className="space-y-3">
            {billable.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${selected.some((i) => i.id === item.id) ? 'bg-violet-600/20 border-violet-500/40' : 'bg-white/5 border-white/10'}`}
                onClick={() => toggleItem(item)}
              >
                <div>
                  <div className="font-bold text-white text-sm">{item.serviceName}</div>
                  <div className="text-xs text-gray-400">{item.category}</div>
                </div>
                <div className="font-mono text-white text-lg">₹{item.amount}</div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
      <div className="border-t border-white/[0.04] px-5 py-4 flex items-center justify-between bg-black/10">
        <div className="font-bold text-white">Total: <span className="text-violet-400">₹{total}</span></div>
        <Button className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-6 py-2 rounded-lg" disabled={selected.length === 0}>
          Generate Bill
        </Button>
      </div>
    </Card>
  );
}
