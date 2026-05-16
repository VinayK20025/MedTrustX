'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileSignature } from 'lucide-react';
import { useSubmitRecommendation } from '../hooks/useIntensivistAnalytics';

interface Props { caseId: string; }

export function RecommendationsPanel({ caseId }: Props) {
  const { mutate: submit, isPending } = useSubmitRecommendation();

  return (
    <Card className="border-indigo-500/30 shadow-glass bg-indigo-500/5 h-full flex flex-col">
      <CardHeader className="border-b border-indigo-500/20 px-5 py-4 flex items-center gap-2">
        <FileSignature className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-semibold text-white tracking-wide">Expert Recommendation</h3>
      </CardHeader>
      <CardBody className="p-4 flex-1 flex flex-col gap-3">
        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1.5 block">Priority Level</label>
          <select className="w-full bg-surface-dark border border-white/[0.08] rounded-lg p-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50">
            <option value="immediate">Immediate Action</option>
            <option value="high">High Priority</option>
            <option value="routine">Routine</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1.5 block">Clinical Directives</label>
          <textarea 
            className="w-full h-full bg-surface-dark border border-white/[0.08] rounded-lg p-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 resize-none min-h-[100px]"
            placeholder="Type your recommendations, medication changes, or suggested interventions here..."
          ></textarea>
        </div>
        <Button 
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-auto transition-colors font-bold"
          onClick={() => submit({ caseId, data: {} })}
          disabled={isPending}
        >
          Submit to Primary Team
        </Button>
      </CardBody>
    </Card>
  );
}
