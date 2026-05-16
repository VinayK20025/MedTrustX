'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { StudentModule } from '../types/student.types';
import { BookOpen, FileText, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props { modules: StudentModule[]; }

export function StudentAcademicPanel({ modules }: Props) {
  const icons: Record<string, any> = { protocol: BookOpen, pathway: FileText, research: FlaskConical };

  return (
    <Card className="border-teal-500/20 shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-teal-500/20 px-5 py-4 flex items-center justify-between bg-teal-500/5">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-teal-400" />
          <h3 className="text-lg font-semibold text-white tracking-wide">Academic Modules</h3>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 space-y-4 overflow-y-auto max-h-[600px]">
        {modules.map(m => {
          const Icon = icons[m.type] || BookOpen;
          return (
            <div key={m.id} className="p-4 rounded-lg border border-white/[0.06] bg-surface-dark/50 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-teal-500/10 rounded-lg text-teal-400">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-bold text-white leading-tight">{m.title}</span>
                  </div>
                  <p className="text-[10px] text-teal-300/70 font-mono italic">Context: {m.contextMatch}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                 <div className="flex justify-between text-[10px] text-gray-400">
                   <span>Progress</span>
                   <span>{m.completionPercentage}%</span>
                 </div>
                 <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-teal-500" style={{ width: `${m.completionPercentage}%` }} />
                 </div>
              </div>
  
              <Button size="sm" className="w-full h-8 text-[11px] bg-teal-600 hover:bg-teal-700 text-white border-none">
                 {m.completionPercentage === 100 ? 'Review Module' : 'Continue Learning'}
              </Button>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
