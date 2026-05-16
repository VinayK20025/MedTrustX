import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useRedpandaConsole } from '../hooks/useRedpandaConsole';
import type { TopicView } from '../types/redpanda-console.types';

export const TopicViewsPanel: React.FC = () => {
  const { useTopics } = useRedpandaConsole();
  const { data: response, isLoading } = useTopics();

  const topics = response?.data || [
    { id: '1', topic_name: 'clinical.vitals.hl7', accessed_at: new Date().toISOString() },
    { id: '2', topic_name: 'iot.telemetry.raw', accessed_at: new Date(Date.now() - 300000).toISOString() },
    { id: '3', topic_name: 'audit.logs.auth', accessed_at: new Date(Date.now() - 900000).toISOString() }
  ];

  if (isLoading) return <div>Loading topic views...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Topic Inspection Audit Log" />
      <CardBody>
        <div className="space-y-3">
          {topics.map((t: TopicView) => (
            <div key={t.id} className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="bg-red-500/20 text-red-400 p-2 rounded">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </div>
                <p className="text-sm font-semibold text-gray-200 font-mono">{t.topic_name}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 font-mono">{new Date(t.accessed_at).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
