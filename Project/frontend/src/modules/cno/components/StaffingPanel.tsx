'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { StaffingOverview } from '../types/cno.types';
import { Users } from 'lucide-react';

interface StaffingPanelProps {
  data: StaffingOverview;
}

export function StaffingPanel({ data }: StaffingPanelProps) {
  const isShortage = data.totalOnShift < data.requiredStaff;

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Staffing & Allocation</h3>
          <p className="text-xs text-gray-400 mt-0.5">Live nursing ratios & shortages</p>
        </div>
        <Button variant="primary" size="sm" className="text-xs h-8">Reallocate Staff</Button>
      </CardHeader>
      
      <CardBody className="p-5 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-6 p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]">
          <div className="text-center w-full">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Total on Shift</p>
            <p className={`text-3xl font-black font-mono ${isShortage ? 'text-warning-light' : 'text-success-light'}`}>
              {data.totalOnShift} <span className="text-lg text-gray-500">/ {data.requiredStaff}</span>
            </p>
          </div>
          <div className="w-px h-10 bg-white/10 mx-4" />
          <div className="text-center w-full flex flex-col items-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Hospital Ratio</p>
            <div className="flex items-center gap-2 mt-1">
              <Users className="w-5 h-5 text-indigo-400" />
              <p className="text-3xl font-black text-white font-mono">{data.ratio}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emergency"></span>
            Critical Shortages
          </p>
          <div className="space-y-3">
            {data.shortages.map((ward) => (
              <div key={ward.ward} className="p-3 bg-emergency/5 border border-emergency/20 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{ward.ward}</p>
                  <p className="text-xs text-emergency-light mt-0.5">
                    Needs {ward.required - ward.actual} more nurses
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-white font-mono">{ward.actual}</span>
                  <span className="text-sm text-gray-500 font-mono"> / {ward.required}</span>
                </div>
              </div>
            ))}
            {data.shortages.length === 0 && (
              <div className="p-4 border border-white/[0.04] rounded-lg text-center text-sm text-gray-400">
                All wards adequately staffed.
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
