import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useEvidenceManagement } from '../hooks/useEvidenceManagement';
import type { EvidenceMetadata } from '../types/evidence.types';

export const EvidenceMetadataPanel: React.FC = () => {
  const { useMetadata } = useEvidenceManagement();
  const { data: response, isLoading } = useMetadata();

  const metadata = response?.data || [
    { id: '1', evidence_id: '1', metadata_json: { ai_classification: 'surveillance', relevance_score: 0.92, duration_seconds: 3600 } },
    { id: '2', evidence_id: '2', metadata_json: { ai_classification: 'consent_form', relevance_score: 0.85, pages: 4 } }
  ];

  if (isLoading) return <div>Loading metadata...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="AI-Enriched Metadata" />
      <CardBody>
        <div className="space-y-3">
          {metadata.map((m: EvidenceMetadata) => (
            <div key={m.id} className="p-3 bg-white/5 rounded border border-white/10">
              <p className="text-xs text-gray-500 mb-2">Evidence ID: {m.evidence_id}</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(m.metadata_json).map(([key, val]) => (
                  <div key={key} className="text-xs">
                    <span className="text-gray-500 capitalize">{key.replace('_', ' ')}:</span>{' '}
                    <span className="text-white font-medium">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
