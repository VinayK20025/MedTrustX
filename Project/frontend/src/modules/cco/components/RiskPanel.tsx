'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { RiskArea } from '../types/cco.types';
import { TriangleAlert } from 'lucide-react';

interface RiskPanelProps {
  areas: RiskArea[];
}

const riskColor: Record<string, { text: string; bg: string; bar: string }> = {
  high:   { text: 'text-emergency-light', bg: 'bg-emergency/20', bar: 'bg-emergency' },
  medium: { text: 'text-warning-light', bg: 'bg-warning/20', bar: 'bg-warning' },
  low:    { text: 'text-success-light', bg: 'bg-success/20', bar: 'bg-success' },
};

export function RiskPanel({ areas }: RiskPanelProps) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <TriangleAlert className="w-5 h-5 text-warning-light" />
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Risk Areas</h3>
          <p className="text-xs text-gray-400 mt-0.5">Department compliance heat map</p>
        </div>
      </CardHeader>
      
      <CardBody className="p-4 flex-1 overflow-y-auto space-y-3">
        {areas.map(area => {
          const rc = riskColor[area.riskLevel];
          return (
            <div key={area.id} className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">{area.area}</span>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${rc.bg} ${rc.text}`}>
                  {area.riskLevel} risk
                </span>
              </div>
              
              <div className="flex items-end justify-between mb-2">
                <span className={`text-xl font-black font-mono ${rc.text}`}>{area.complianceScore}%</span>
                <span className="text-[10px] text-gray-500">{area.openViolations} violations</span>
              </div>
              
              <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden mb-2">
                <div className={`h-full rounded-full ${rc.bar}`} style={{ width: `${area.complianceScore}%` }} />
              </div>
              
              <p className="text-[10px] text-gray-500">Last audit: {area.lastAudit}</p>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
