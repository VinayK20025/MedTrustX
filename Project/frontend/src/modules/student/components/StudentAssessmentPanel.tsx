'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { StudentAssessment } from '../types/student.types';
import { Target, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { assessments: StudentAssessment[]; }

export function StudentAssessmentPanel({ assessments }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-gray-400" />
        <h3 className="text-lg font-semibold text-white tracking-wide">Assessments & Quizzes</h3>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[300px]">
        {assessments.map(a => (
          <div key={a.id} className="p-3 rounded-lg border border-white/[0.04] bg-white/[0.02] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-200 block mb-1">{a.title}</span>
              {a.status === 'completed' ? (
                 <span className="text-[10px] text-success-light flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Score: {a.score}%</span>
              ) : (
                 <span className="text-[10px] text-warning-light">Pending Completion</span>
              )}
            </div>
            {a.status === 'pending' && (
              <Button size="sm" className="h-7 text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white border-none">Start</Button>
            )}
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
