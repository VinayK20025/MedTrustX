'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { BillingPatient } from '../types/billing.types';
import { Users, Search } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { patients: BillingPatient[]; selectedId?: string; onSelect: (id: string) => void; }

const statusStyle: Record<BillingPatient['billStatus'], { bg: string; text: string }> = {
  Draft: { bg: 'bg-gray-500/20', text: 'text-gray-300' },
  Finalized: { bg: 'bg-blue-500/20', text: 'text-blue-300' },
  Paid: { bg: 'bg-success/20', text: 'text-success-light' },
  Partial: { bg: 'bg-warning/20', text: 'text-warning-light' },
  Pending: { bg: 'bg-emergency/20', text: 'text-emergency-light' },
};

export function BillingPatientList({ patients, selectedId, onSelect }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-green-500/15"><Users className="w-3.5 h-3.5 text-green-400" /></div>
          <h3 className="text-[13px] font-bold text-white tracking-wide">Patient Bills</h3>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input type="text" placeholder="Search by name or MRN..." className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-[11px] text-white focus:outline-none focus:border-green-500/50" />
        </div>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/[0.03]">
          {patients.map(p => {
            const st = statusStyle[p.billStatus];
            return (
              <div key={p.id} onClick={() => onSelect(p.id)}
                className={cn("p-4 cursor-pointer transition-all border-l-2",
                  selectedId === p.id ? "bg-green-500/[0.06] border-l-green-500" : "border-l-transparent hover:bg-white/[0.015]"
                )}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h4 className="text-[13px] font-bold text-white">{p.patientName}</h4>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">{p.mrn} • {p.type} • {p.department}</p>
                  </div>
                  <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', st.bg, st.text)}>{p.billStatus}</span>
                </div>
                <div className="flex justify-between text-[11px] font-mono mt-2">
                  <span className="text-gray-500">₹{p.totalAmount.toLocaleString()}</span>
                  {p.billStatus === 'Partial' && <span className="text-warning-light">Paid ₹{p.paidAmount.toLocaleString()}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
