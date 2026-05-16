'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Heart, Activity } from 'lucide-react';
import type { Donor } from '../types/transplant.types';
import { format } from 'date-fns';

export function DonorPanel({ donors }: { donors: Donor[] }) {
  return (
    <Card className="h-full border-white/[0.06] bg-surface-dark/50 backdrop-blur-md">
      <CardHeader 
        className="pb-4"
        title="Available Donors"
        subtitle="Living and deceased donor registry"
        icon={<Heart className="w-5 h-5" />}
        action={
          <Badge variant="outline" className="bg-red-500/10 text-red-300 border-red-500/20">
            {donors.length} Registered
          </Badge>
        }
      />
      <CardBody className="p-0 overflow-y-auto max-h-[calc(100%-80px)] custom-scrollbar">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="sticky top-0 bg-surface-dark border-b border-white/[0.06] z-10 text-[10px] uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Donor ID</th>
              <th className="px-4 py-3 font-medium">Organ / Blood</th>
              <th className="px-4 py-3 font-medium">Type / Location</th>
              <th className="px-4 py-3 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {donors.map((donor) => (
              <tr key={donor.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-4 py-3">
                  <p className="font-mono text-white group-hover:text-red-300 transition-colors">{donor.id}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-red-400" />
                    <span>{donor.organType}</span>
                    <span className="text-xs text-gray-400 border border-white/[0.1] px-1.5 py-0.5 rounded">{donor.bloodType}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-white">{donor.donorType}</p>
                  <p className="text-xs text-gray-400">{donor.location}</p>
                </td>
                <td className="px-4 py-3 text-right">
                  <Badge variant="outline" className="text-red-300 border-red-500/30">
                    {donor.status}
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
