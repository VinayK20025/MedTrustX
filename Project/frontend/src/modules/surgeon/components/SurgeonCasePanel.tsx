'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { SurgicalCase } from '../types/surgeon.types';
import { Calendar, User, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { cases: SurgicalCase[]; }

export function SurgeonCasePanel({ cases }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/15"><Calendar className="w-4 h-4 text-blue-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Daily OR Schedule</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[450px]">
        <div className="divide-y divide-white/[0.03]">
          {cases.map(c => (
            <div key={c.id} className={cn('p-5 transition-colors group cursor-pointer', c.status === 'In Progress' ? 'bg-blue-500/5 border-l-2 border-blue-500' : 'hover:bg-white/[0.015]')}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    {c.procedure}
                    <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider', 
                      c.type === 'Emergency' ? 'bg-emergency/20 text-emergency-light' : 
                      c.type === 'Urgent' ? 'bg-warning/20 text-warning-light' : 'bg-white/5 text-gray-400'
                    )}>{c.type}</span>
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1"><User className="w-3 h-3"/> {c.patientName} ({c.mrn})</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                    c.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400 animate-pulse' : 
                    c.status === 'Completed' ? 'bg-success/20 text-success-light' : 'bg-gray-500/20 text-gray-400'
                  )}>
                    {c.status}
                  </span>
                  <span className="text-[11px] text-gray-300 font-bold">{c.otRoom}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-[10px] text-gray-500 mt-4">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {c.scheduledTime} ({c.estimatedDuration} min est.)</span>
                <span className="text-blue-300 font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  View Pre-Op Board <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
