'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { InternFeedback } from '../types/intern.types';
import { MessageSquare, Star } from 'lucide-react';

interface Props { feedback: InternFeedback[]; }

export function InternFeedbackPanel({ feedback }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-gray-400" />
        <h3 className="text-lg font-semibold text-white tracking-wide">Supervisor Feedback</h3>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[300px]">
        {feedback.map(f => (
          <div key={f.id} className="p-3 rounded-lg border border-white/[0.04] bg-surface-dark">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-300">{f.supervisor}</span>
              <span className="text-[9px] text-gray-500 font-mono">{f.date}</span>
            </div>
            <div className="flex mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < f.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
              ))}
            </div>
            <p className="text-xs text-gray-300 italic">"{f.comment}"</p>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
