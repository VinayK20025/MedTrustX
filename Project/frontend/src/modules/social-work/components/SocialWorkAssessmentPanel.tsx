'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { PsychosocialAssessment } from '../types/socialWork.types';
import { useUpdateAssessment } from '../hooks/useSocialWorkAnalytics';
import { ClipboardEdit, Home, Brain, DollarSign } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { assessment?: PsychosocialAssessment; }

export function SocialWorkAssessmentPanel({ assessment }: Props) {
  const { mutate: completeAssessment, isPending } = useUpdateAssessment();

  if (!assessment) return null;

  return (
    <Card className="border-teal-500/30 shadow-glass bg-[#020808] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-teal-500" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardEdit className="w-4 h-4 text-teal-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-teal-400">PSYCHOSOCIAL ASSESSMENT</h3>
        </div>
        <div className="text-[10px] text-gray-400 font-mono">Case: {assessment.caseId}</div>
      </CardHeader>

      <CardBody className="p-0 flex-1 flex flex-col overflow-y-auto">
        <div className="p-5 space-y-6">
          
          {/* Social Factors */}
          <div className="bg-white/[0.02] rounded-xl border border-white/5 p-4">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Home className="w-3.5 h-3.5 text-teal-500"/> Environment & Social
            </h4>
            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between"><span className="text-gray-500">Living Arrangement</span><span className="text-white">{assessment.socialFactors.livingArrangement}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Family Support</span><span className="text-white">{assessment.socialFactors.familySupport}</span></div>
            </div>
          </div>

          {/* Emotional Status */}
          <div className="bg-white/[0.02] rounded-xl border border-white/5 p-4">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Brain className="w-3.5 h-3.5 text-purple-500"/> Mental & Emotional
            </h4>
            <ul className="list-disc list-inside text-[13px] text-white space-y-1 mb-2">
              {assessment.emotionalStatus.mentalHealthIndicators.map((ind, i) => <li key={i}>{ind}</li>)}
            </ul>
            <div className="flex justify-between text-[13px] pt-2 border-t border-white/5">
              <span className="text-gray-500">Observed Coping Mechanism</span>
              <span className="text-emergency-light font-bold">{assessment.emotionalStatus.copingMechanism}</span>
            </div>
          </div>

          {/* Financial Status */}
          <div className="bg-white/[0.02] rounded-xl border border-emergency/20 p-4">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5 text-emergency-500"/> Financial Vulnerability
            </h4>
            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between"><span className="text-gray-500">Income Bracket</span><span className="text-white font-mono">{assessment.financialStatus.incomeBracket}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Insurance</span><span className="text-emergency-light font-bold font-mono">{assessment.financialStatus.insuranceCoverage}</span></div>
            </div>
          </div>

          {/* Core Needs Identified */}
          <div>
            <h4 className="text-[11px] font-bold text-warning-light uppercase tracking-widest mb-3">Identified Needs</h4>
            <div className="flex flex-wrap gap-2">
              {assessment.needsIdentified.map((need, idx) => (
                <span key={idx} className="bg-warning/10 text-warning-light border border-warning/20 text-[11px] px-3 py-1.5 rounded-full font-bold">
                  {need}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Action Bar */}
        <div className="p-4 border-t border-white/10 bg-black/40 mt-auto flex justify-end">
          <Button 
            disabled={isPending || assessment.assessmentComplete} 
            onClick={() => completeAssessment(assessment.caseId)}
            className="bg-teal-600 hover:bg-teal-500 text-white font-bold h-10 px-8"
          >
            {assessment.assessmentComplete ? 'ASSESSMENT LOCKED' : 'FINALIZE ASSESSMENT'}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
