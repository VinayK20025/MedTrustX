'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { InternLearningModule } from '../types/intern.types';
import { BookOpen, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { modules: InternLearningModule[]; }

export function InternLearningPanel({ modules }: Props) {
  return (
    <Card className="border-indigo-500/30 shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-indigo-500/20 px-5 py-4 flex items-center justify-between bg-indigo-500/5">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white tracking-wide">Contextual Learning</h3>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-4 overflow-y-auto max-h-[600px]">
        {modules.map(m => (
          <div key={m.id} className="p-4 rounded-lg border border-white/[0.06] bg-white/[0.02] flex flex-col gap-3">
            <div>
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm font-bold text-white leading-tight">{m.title}</span>
                <span className="text-[9px] uppercase font-bold text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded">{m.category}</span>
              </div>
              <p className="text-[10px] text-gray-400 font-mono italic">Context: {m.contextMatch}</p>
            </div>
            
            <div className="space-y-1">
               <div className="flex justify-between text-[10px] text-gray-400">
                 <span>Progress</span>
                 <span>{m.completionPercentage}%</span>
               </div>
               <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-indigo-500" style={{ width: `${m.completionPercentage}%` }} />
               </div>
            </div>

            <Button size="sm" className="w-full h-8 text-[11px] bg-white/10 hover:bg-white/20 text-white border-none flex items-center justify-center gap-2">
               {m.completionPercentage === 100 ? 'Review Module' : <><PlayCircle className="w-4 h-4"/> Continue Learning</>}
            </Button>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
