'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ICNActiveCase } from '../types/icn.types';
import { ShieldAlert, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { cases: ICNActiveCase[]; }

export function ICNActiveCases({ cases }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-indigo-400" />
          <h3 className="text-[15px] font-semibold text-white tracking-wide">Active HAI Cases</h3>
        </div>
      </CardHeader>
      <CardBody className="p-3 flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.04]">
              <th className="py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-2">Patient</th>
              <th className="py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Location</th>
              <th className="py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Infection</th>
              <th className="py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right pr-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {cases.map(item => (
              <tr key={item.id} className="border-b border-white/[0.02] last:border-0 hover:bg-white/[0.02]">
                <td className="py-3 text-[13px] font-bold text-white pl-2">{item.patientName}</td>
                <td className="py-3 text-[12px] text-gray-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {item.ward}</td>
                <td className="py-3 text-[13px] font-semibold text-warning-light">{item.infectionType}</td>
                <td className="py-3 text-right pr-2">
                  <span className={`text-[9px] uppercase font-bold px-2 py-1 rounded tracking-widest ${
                    item.status === 'isolated' ? 'bg-emergency/20 text-emergency-light' :
                    item.status === 'under_observation' ? 'bg-warning/20 text-warning-light' :
                    'bg-success/20 text-success-light'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}
