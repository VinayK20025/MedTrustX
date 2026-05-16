'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Share2 } from 'lucide-react';

export function ReferralPanel() {
  const specialties = ['Cardiology', 'Orthopedics', 'Neurology', 'Internal Medicine', 'Surgery'];
  
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <Share2 className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-semibold text-white tracking-wide">Referral</h3>
      </CardHeader>
      <CardBody className="p-4 flex-1 flex flex-col gap-3">
        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1.5 block">Specialty</label>
          <select className="w-full bg-surface-dark border border-white/[0.08] rounded-lg p-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50">
            <option value="">Select Specialty...</option>
            {specialties.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1.5 block">Reason</label>
          <textarea 
            className="w-full h-full bg-surface-dark border border-white/[0.08] rounded-lg p-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 resize-none min-h-[80px]"
            placeholder="Brief reason for referral..."
          ></textarea>
        </div>
        <Button className="w-full bg-white/[0.05] hover:bg-indigo-500 text-white mt-auto transition-colors">
          Create Referral
        </Button>
      </CardBody>
    </Card>
  );
}
