'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { PsychologyAssessment } from '../types/psychology.types';
import { ClipboardCheck, FileText } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { assessments: PsychologyAssessment[]; }

export function PsychologyAssessmentPanel({ assessments }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/15"><ClipboardCheck className="w-4 h-4 text-blue-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Psychological Screens</h3>
        </div>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-500 border-none text-white font-bold text-xs">
          Send Screen
        </Button>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[300px]">
        <div className="divide-y divide-white/[0.03]">
          {assessments.map(assess => (
            <div key={assess.id} className="p-5 hover:bg-white/[0.015] transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-500">{new Date(assess.date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-surface-dark p-3 rounded border border-white/5 text-center">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">{assess.type} Score</span>
                  <span className={cn('text-xl font-bold', assess.severity === 'Severe' || assess.severity === 'Moderately Severe' ? 'text-emergency-light' : 'text-white')}>{assess.score}</span>
                </div>
                <div className="bg-surface-dark p-3 rounded border border-white/5 flex flex-col justify-center">
                  <span className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Clinical Interpretation</span>
                  <span className="text-[12px] font-bold text-white">{assess.interpretation}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
