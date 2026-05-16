import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useCCTVSurveillance } from '../hooks/useCCTVSurveillance';
import type { Recording } from '../types/cctv-surveillance.types';

export const RecordingsPanel: React.FC = () => {
  const { useRecordings } = useCCTVSurveillance();
  const { data: response, isLoading } = useRecordings();

  const recordings = response?.data || [
    { id: '1', camera_id: 'CAM-LOBBY-01', file_path: '/archive/2026/05/02/lobby-01-0800.mp4', start_time: '2026-05-02T08:00:00Z', end_time: '2026-05-02T12:00:00Z' },
    { id: '2', camera_id: 'CAM-ICU-03', file_path: '/archive/2026/05/02/icu-03-0600.mp4', start_time: '2026-05-02T06:00:00Z', end_time: '2026-05-02T10:00:00Z' }
  ];

  if (isLoading) return <div>Loading recordings...</div>;

  const duration = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${mins}m`;
  };

  return (
    <Card className="h-full">
      <CardHeader title="Archived Recordings" />
      <CardBody>
        <div className="space-y-3">
          {recordings.map((r: Recording) => (
            <div key={r.id} className="p-4 bg-white/5 rounded-md border border-white/10">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-semibold text-gray-200">{r.camera_id}</span>
                <span className="text-xs text-emerald-400 font-bold">{duration(r.start_time, r.end_time)}</span>
              </div>
              <p className="text-xs text-gray-500 font-mono">{r.file_path}</p>
              <p className="text-xs text-gray-600 mt-1">{new Date(r.start_time).toLocaleString()} → {new Date(r.end_time).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
