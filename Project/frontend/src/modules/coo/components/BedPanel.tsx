'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { BedMetrics } from '../types/coo.types';
import { Button } from '@/components/ui/Button';

interface BedPanelProps {
  data: BedMetrics;
}

export function BedPanel({ data }: BedPanelProps) {
  const getProgressColor = (occupied: number, capacity: number) => {
    const ratio = occupied / capacity;
    if (ratio >= 0.95) return 'bg-emergency';
    if (ratio >= 0.85) return 'bg-warning';
    return 'bg-teal-500';
  };

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Bed Management</h3>
          <p className="text-xs text-gray-400 mt-0.5">Live ward occupancy</p>
        </div>
        <Button variant="primary" size="sm" className="text-xs h-8">Allocate Bed</Button>
      </CardHeader>
      
      <CardBody className="p-5 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-6 p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]">
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Total</p>
            <p className="text-xl font-bold text-white mt-1">{data.totalBeds}</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Occupied</p>
            <p className="text-xl font-bold text-emergency-light mt-1">{data.occupiedBeds}</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Available</p>
            <p className="text-xl font-bold text-teal-400 mt-1">{data.availableBeds}</p>
          </div>
        </div>

        <div className="space-y-4">
          {data.occupancyByWard.map((ward) => (
            <div key={ward.ward}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-300">{ward.ward}</span>
                <span className="text-gray-400">
                  <span className="text-white font-bold">{ward.occupied}</span> / {ward.capacity}
                </span>
              </div>
              <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${getProgressColor(ward.occupied, ward.capacity)}`}
                  style={{ width: `${(ward.occupied / ward.capacity) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
