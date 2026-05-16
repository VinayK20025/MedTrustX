'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { PatientFeedback } from '../types/prm.types';
import { MessageSquare, Star, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { feedback: PatientFeedback[]; }

export function PrmFeedbackPanel({ feedback }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-pink-500/15"><MessageSquare className="w-4 h-4 text-pink-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Live Patient Feedback</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[500px]">
        <div className="divide-y divide-white/[0.03]">
          {feedback.map(fb => (
            <div key={fb.id} className="p-5 hover:bg-white/[0.015] transition-colors cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-[14px] font-bold text-white flex items-center gap-2">
                    {fb.patientName}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-1 font-mono">{fb.department}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center">
                    {[1,2,3,4,5].map(star => (
                      <Star key={star} className={cn("w-3.5 h-3.5", star <= fb.rating ? "text-amber-400 fill-amber-400" : "text-gray-600")} />
                    ))}
                  </div>
                  <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider flex items-center gap-1', 
                    fb.sentiment === 'Positive' ? 'bg-success/20 text-success-light' : 
                    fb.sentiment === 'Negative' ? 'bg-emergency/20 text-emergency-light' : 'bg-gray-500/20 text-gray-300'
                  )}>
                    {fb.sentiment === 'Positive' && <ThumbsUp className="w-3 h-3"/>}
                    {fb.sentiment === 'Negative' && <ThumbsDown className="w-3 h-3"/>}
                    {fb.sentiment === 'Neutral' && <Minus className="w-3 h-3"/>}
                    {fb.sentiment}
                  </span>
                </div>
              </div>

              <div className="mt-3 bg-white/[0.02] p-3 rounded border border-white/5 text-[12px] text-gray-300 italic">
                "{fb.comment}"
              </div>

              <div className="flex justify-between items-center mt-3 pt-2 text-[9px] text-gray-500 font-mono">
                <span>ID: {fb.id}</span>
                <span>{new Date(fb.dateReceived).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
