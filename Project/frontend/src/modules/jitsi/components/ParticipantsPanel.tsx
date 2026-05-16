import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useJitsi } from '../hooks/useJitsi';
import type { Participant } from '../types/jitsi.types';

export const ParticipantsPanel: React.FC = () => {
  const { useParticipants } = useJitsi();
  const { data: response, isLoading } = useParticipants();

  const participants = response?.data || [
    { id: 'part-1', room_id: 'room-1', user_id: 'u-101', role: 'host', joined_at: '2026-05-02T13:00:05Z' },
    { id: 'part-2', room_id: 'room-1', user_id: 'u-405', role: 'attendee', joined_at: '2026-05-02T13:02:10Z' },
    { id: 'part-3', room_id: 'room-3', user_id: 'u-108', role: 'host', joined_at: '2026-05-02T13:45:00Z' },
  ];

  if (isLoading) return <div>Loading participants...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Active Participants" />
      <CardBody>
        <div className="space-y-3">
          {participants.map((p: Participant) => (
            <div key={p.id} className="p-3 border border-white/10 rounded-lg bg-white/5 flex items-center gap-4">
              <div className={`p-2 rounded-full ${p.role === 'host' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-gray-200">{p.user_id}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${p.role === 'host' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {p.role}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-mono">Room: {p.room_id}</span>
                  <span className="text-gray-600 font-mono">Joined: {new Date(p.joined_at).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
