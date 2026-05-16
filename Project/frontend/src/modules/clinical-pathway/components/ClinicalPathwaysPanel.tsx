import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useClinicalPathway } from '../hooks/useClinicalPathway';
import type { ClinicalPathway } from '../types/clinical-pathway.types';

export const ClinicalPathwaysPanel: React.FC = () => {
  const { usePathways } = useClinicalPathway();
  const { data: response, isLoading } = usePathways();

  const pathways = response?.data || [
    { id: '1', name: 'Acute Myocardial Infarction (AMI)', description: 'Standard care sequence for STEMI/NSTEMI patients.' },
    { id: '2', name: 'Total Knee Arthroplasty (TKA)', description: 'Pre-op, surgical, and post-op rehabilitation pathway.' },
    { id: '3', name: 'Sepsis Recognition & Response', description: 'Early detection and 3-hour bundle execution protocol.' }
  ];

  if (isLoading) return <div>Loading pathways...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Standardized Care Pathways" />
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pathways.map((pw: ClinicalPathway) => (
            <div key={pw.id} className="p-4 border border-white/10 rounded-lg bg-white/5 flex flex-col">
              <h3 className="text-sm font-semibold text-blue-400 mb-2">{pw.name}</h3>
              <p className="text-xs text-gray-400 mb-4 flex-1">
                {pw.description || 'No description available.'}
              </p>
              <div className="text-right">
                <span className="text-[10px] text-gray-500 font-mono">ID: {pw.id.slice(0,8)}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
