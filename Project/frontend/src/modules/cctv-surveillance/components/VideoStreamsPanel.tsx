import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useCCTVSurveillance } from '../hooks/useCCTVSurveillance';
import type { VideoStream } from '../types/cctv-surveillance.types';

export const VideoStreamsPanel: React.FC = () => {
  const { useStreams } = useCCTVSurveillance();
  const { data: response, isLoading } = useStreams();

  const streams = response?.data || [
    { id: '1', camera_id: 'CAM-LOBBY-01', stream_url: 'rtsp://10.0.5.10:554/lobby-01', status: 'active' },
    { id: '2', camera_id: 'CAM-ICU-03', stream_url: 'rtsp://10.0.5.11:554/icu-03', status: 'active' },
    { id: '3', camera_id: 'CAM-OR-02', stream_url: 'rtsp://10.0.5.12:554/or-02', status: 'paused' }
  ];

  if (isLoading) return <div>Loading streams...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Live Video Streams" />
      <CardBody>
        <div className="space-y-3">
          {streams.map((s: VideoStream) => (
            <div key={s.id} className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/10">
              <div>
                <p className="text-sm font-semibold text-gray-200">{s.camera_id}</p>
                <p className="text-xs text-gray-500 font-mono mt-1">{s.stream_url}</p>
              </div>
              <Badge variant={s.status === 'active' ? 'success' : 'warning'}>
                {s.status === 'active' ? '🔴 LIVE' : 'PAUSED'}
              </Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
