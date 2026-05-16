import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useClinicalPathway } from '../hooks/useClinicalPathway';
import type { PathwayStep } from '../types/clinical-pathway.types';

export const PathwayStepsPanel: React.FC = () => {
  const { useSteps } = useClinicalPathway();
  const { data: response, isLoading } = useSteps();

  const steps = response?.data || [
    { id: 'step-1', pathway_id: 'Sepsis Recognition & Response', sequence: 1, step_name: 'Lactate Measurement', metadata: { target_time: '1h' } },
    { id: 'step-2', pathway_id: 'Sepsis Recognition & Response', sequence: 2, step_name: 'Blood Cultures', metadata: { constraint: 'prior_to_antibiotics' } },
    { id: 'step-3', pathway_id: 'Sepsis Recognition & Response', sequence: 3, step_name: 'Broad-spectrum Antibiotics', metadata: { target_time: '1h' } }
  ];

  if (isLoading) return <div>Loading pathway steps...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Pathway Steps Definition" />
      <CardBody>
        <div className="space-y-4">
          {steps.map((step: PathwayStep) => (
            <div key={step.id} className="flex items-center p-3 border border-white/10 rounded-lg bg-white/5">
              <div className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 shrink-0">
                {step.sequence}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-200">{step.step_name}</p>
                <p className="text-[10px] text-gray-500 font-mono mt-1">Pathway: {step.pathway_id}</p>
              </div>
              <div className="bg-black/40 p-2 rounded text-[10px] text-gray-400 font-mono hidden md:block w-48 break-words text-right">
                {JSON.stringify(step.metadata)}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
