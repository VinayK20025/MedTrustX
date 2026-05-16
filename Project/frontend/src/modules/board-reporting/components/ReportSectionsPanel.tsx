import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useBoardReporting } from '../hooks/useBoardReporting';
import type { ReportSection } from '../types/board-reporting.types';

export const ReportSectionsPanel: React.FC = () => {
  const { useSections } = useBoardReporting();
  const { data: response, isLoading } = useSections();

  const sections = response?.data || [
    { id: '1', report_id: '1', section_name: 'executive_summary', content: { length: '500 words' } },
    { id: '2', report_id: '1', section_name: 'financials', content: { attachments: 2 } }
  ];

  if (isLoading) return <div>Loading sections...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Report Sections" />
      <CardBody>
        <ul className="space-y-3">
          {sections.map((sec: ReportSection) => (
            <li key={sec.id} className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-sm font-medium text-blue-400 capitalize">
                {sec.section_name.replace('_', ' ')}
              </span>
              <span className="text-xs text-gray-500">
                Data: {JSON.stringify(sec.content)}
              </span>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};
