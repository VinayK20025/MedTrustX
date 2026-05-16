'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { User, Heart, Activity } from 'lucide-react';
import type { WaitlistPatient } from '../types/transplant.types';
import { cn } from '@/utils/cn';

export function WaitlistPanel({ waitlist }: { waitlist: WaitlistPatient[] }) {
  const getUrgencyColor = (score: number | string) => {
    if (typeof score === 'string' && score.includes('A')) return 'bg-emergency/20 text-emergency-light border-emergency/30';
    if (typeof score === 'number') {
      if (score >= 35) return 'bg-emergency/20 text-emergency-light border-emergency/30';
      if (score >= 25) return 'bg-warning/20 text-warning-light border-warning/30';
    }
    return 'bg-success/20 text-success-light border-success/30';
  };

  return (
    <Card className="h-full border-white/[0.06] bg-surface-dark/50 backdrop-blur-md">
      <CardHeader 
        className="pb-4"
        title="Active Waitlist"
        subtitle="UNOS integrated patient registry"
        icon={<User className="w-5 h-5" />}
        action={
          <Badge variant="outline" className="bg-pink-500/10 text-pink-300 border-pink-500/20">
            {waitlist.length} Patients
          </Badge>
        }
      />
      <CardBody className="p-0 overflow-y-auto max-h-[calc(100%-80px)] custom-scrollbar">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="sticky top-0 bg-surface-dark border-b border-white/[0.06] z-10 text-[10px] uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Patient</th>
              <th className="px-4 py-3 font-medium">Organ / Blood</th>
              <th className="px-4 py-3 font-medium text-center">Urgency (Score)</th>
              <th className="px-4 py-3 font-medium text-right">Wait Time</th>
              <th className="px-4 py-3 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {waitlist.map((pt) => (
              <tr key={pt.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-4 py-3">
                  <p className="font-medium text-white group-hover:text-pink-300 transition-colors">{pt.patientName}</p>
                  <p className="text-[11px] text-gray-500 font-mono mt-0.5">{pt.id}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Heart className="w-3.5 h-3.5 text-pink-400" />
                    <span>{pt.organType}</span>
                    <span className="text-xs text-gray-400 border border-white/[0.1] px-1.5 py-0.5 rounded">{pt.bloodType}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={cn('px-2.5 py-1 rounded-full text-xs font-bold border', getUrgencyColor(pt.urgencyScore))}>
                    {pt.urgencyScore}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gray-300">
                  {pt.daysOnWaitlist} <span className="text-gray-500 text-xs">days</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Badge variant={pt.status === 'Active' ? 'default' : pt.status === 'Matched' ? 'success' : 'outline'} className={pt.status === 'Active' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : ''}>
                    {pt.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}
