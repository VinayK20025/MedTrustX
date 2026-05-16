'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { IAMReview } from '../types/iam.types';
import { FileSearch, Clock, Calendar } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { reviews: IAMReview[]; }

export function IamReviewPanel({ reviews }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/15"><FileSearch className="w-4 h-4 text-emerald-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Access Reviews & Certification</h3>
        </div>
      </CardHeader>

      <CardBody className="p-5 flex-1 overflow-y-auto max-h-[400px]">
        <div className="space-y-4">
          {reviews.map(rev => (
            <div key={rev.id} className="p-4 rounded-xl border border-white/[0.06] bg-surface-dark transition-all hover:bg-white/[0.02]">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-sm font-bold text-white">{rev.title}</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Target: <span className="text-gray-300 font-semibold">{rev.targetRole}</span></p>
                </div>
                <span className={cn('text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider',
                  rev.status === 'ongoing' ? 'bg-amber-500/20 text-amber-400' :
                  rev.status === 'completed' ? 'bg-success/20 text-success-light' : 'bg-blue-500/20 text-blue-400'
                )}>
                  {rev.status}
                </span>
              </div>

              {rev.status === 'ongoing' && (
                <div className="mb-3">
                  <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{rev.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${rev.progress}%` }} />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-white/[0.04] text-[10px] text-gray-500">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due: {rev.dueDate}</span>
                <span>Reviewer: <strong className="text-gray-300">{rev.reviewer}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
