'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { SocialWorkCase } from '../types/socialWork.types';
import { Heart, AlertTriangle, CalendarDays } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { cases: SocialWorkCase[]; }

export function SocialWorkCaseList({ cases }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-500/15"><Heart className="w-4 h-4 text-teal-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Active Support Cases</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[500px]">
        <div className="divide-y divide-white/[0.03]">
          {cases.map(c => (
            <div key={c.id} className={cn("p-5 transition-colors cursor-pointer", c.riskLevel === 'Critical' ? "bg-emergency/5 border-l-2 border-emergency" : "hover:bg-white/[0.015]")}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-[14px] font-bold text-white flex items-center gap-2">
                    {c.patientName}
                    {c.riskLevel === 'Critical' && <AlertTriangle className="w-4 h-4 text-emergency-light animate-pulse" />}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-2 font-mono">
                    {c.mrn} <span>•</span> {c.id}
                  </p>
                </div>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                  c.riskLevel === 'Critical' || c.riskLevel === 'High' ? 'bg-emergency/20 text-emergency-light' : 'bg-teal-500/20 text-teal-400'
                )}>
                  {c.riskLevel} Risk
                </span>
              </div>

              <div className="flex justify-between items-center mt-4 border-t border-white/[0.04] pt-3">
                <div className="flex gap-2">
                  <span className={cn("text-[10px] uppercase font-bold px-2 py-1 rounded border", 
                     c.status === 'Assessment Pending' ? 'text-warning-400 border-warning-500/30 bg-warning-500/10' : 
                     'text-teal-400 border-teal-500/30 bg-teal-500/10'
                  )}>{c.status}</span>
                </div>
                <span className="flex items-center gap-1 text-[9px] font-mono text-gray-500">
                  <CalendarDays className="w-3 h-3" /> Assigned: {new Date(c.assignedDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
