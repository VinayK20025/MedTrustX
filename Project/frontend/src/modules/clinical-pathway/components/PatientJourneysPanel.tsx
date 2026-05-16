import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useClinicalPathway } from '../hooks/useClinicalPathway';
import type { PatientJourney } from '../types/clinical-pathway.types';

export const PatientJourneysPanel: React.FC = () => {
  const { useJourneys } = useClinicalPathway();
  const { data: response, isLoading } = useJourneys();

  const journeys = response?.data || [
    { id: '1', patient_id: 'PT-9941', pathway_id: 'Acute Myocardial Infarction (AMI)', current_step: 4, status: 'active' },
    { id: '2', patient_id: 'PT-8820', pathway_id: 'Sepsis Recognition & Response', current_step: 2, status: 'deviated' },
    { id: '3', patient_id: 'PT-7711', pathway_id: 'Total Knee Arthroplasty (TKA)', current_step: 12, status: 'completed' }
  ];

  if (isLoading) return <div>Loading patient journeys...</div>;

  const statusVariant = (s: string) => {
    switch (s) {
      case 'active': return 'outline';
      case 'deviated': return 'warning';
      case 'completed': return 'success';
      case 'paused': return 'outline';
      default: return 'outline' as const;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Active Patient Journeys" />
      <CardBody>
        <div className="grid grid-cols-1 gap-3">
          {journeys.map((j: PatientJourney) => (
            <div key={j.id} className="p-3 border border-white/10 rounded bg-white/5 flex justify-between items-center">
              <div>
                <p className="text-sm font-bold text-gray-200">{j.patient_id}</p>
                <p className="text-xs text-gray-400 mt-1">{j.pathway_id} <span className="text-blue-400 ml-2">(Step {j.current_step})</span></p>
              </div>
              <Badge variant={statusVariant(j.status)}>
                {j.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
