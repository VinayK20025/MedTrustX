'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { SpeechAssessment } from '../types/speech.types';
import { ClipboardCheck, FileText } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { assessments: SpeechAssessment[]; }

export function SpeechAssessmentPanel({ assessments }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/15"><ClipboardCheck className="w-4 h-4 text-blue-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Language Assessments</h3>
        </div>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-500 border-none text-white font-bold text-xs">
          New Eval
        </Button>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[300px]">
        <div className="divide-y divide-white/[0.03]">
          {assessments.map(assess => (
            <div key={assess.id} className="p-5 hover:bg-white/[0.015] transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider', 
                    assess.type === 'Speech' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-400'
                  )}>
                    {assess.type}
                  </span>
                  <span className="text-[11px] text-gray-500">{new Date(assess.date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-3">
                <div className="bg-surface-dark p-2 rounded border border-white/5 text-center">
                  <span className="text-[9px] text-gray-500 block">Artic.</span>
                  <span className="text-sm font-bold text-white">{assess.articulationScore}%</span>
                </div>
                <div className="bg-surface-dark p-2 rounded border border-white/5 text-center">
                  <span className="text-[9px] text-gray-500 block">Fluency</span>
                  <span className="text-sm font-bold text-white">{assess.fluencyScore}%</span>
                </div>
                <div className="bg-surface-dark p-2 rounded border border-white/5 text-center">
                  <span className="text-[9px] text-gray-500 block">Comp.</span>
                  <span className="text-sm font-bold text-teal-400">{assess.comprehensionScore}%</span>
                </div>
                <div className="bg-surface-dark p-2 rounded border border-white/5 text-center">
                  <span className="text-[9px] text-gray-500 block">Swallow</span>
                  <span className={cn('text-sm font-bold', assess.swallowingScore < 7 ? 'text-emergency-light' : 'text-success-light')}>{assess.swallowingScore}/10</span>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-white/5 p-2.5 rounded-lg text-[10px] text-gray-400 italic">
                <FileText className="w-3 h-3 flex-shrink-0 mt-0.5 text-blue-300" />
                <p>"{assess.notes}"</p>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
