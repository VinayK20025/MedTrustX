import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useJitsi } from '../hooks/useJitsi';
import type { ConferenceRoom } from '../types/jitsi.types';

export const ConferenceRoomsPanel: React.FC = () => {
  const { useRooms } = useJitsi();
  const { data: response, isLoading } = useRooms();

  const rooms = response?.data || [
    { id: 'room-1', room_name: 'clinical-board-mtg', created_by: 'u-101' },
    { id: 'room-2', room_name: 'telemed-consult-89', created_by: 'u-402' },
    { id: 'room-3', room_name: 'er-triage-video', created_by: 'u-108' },
  ];

  if (isLoading) return <div>Loading rooms...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Conference Rooms Registry" />
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rooms.map((room: ConferenceRoom) => (
            <div key={room.id} className="p-4 border border-white/10 rounded-lg bg-white/5 flex flex-col gap-3 hover:bg-white/10 transition-colors">
              <div className="flex items-start justify-between">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </div>
                <span className="text-[10px] text-gray-500 font-mono bg-white/5 px-2 py-1 rounded border border-white/5">{room.id.split('-')[1]}</span>
              </div>
              <h3 className="text-sm font-bold text-gray-200">{room.room_name}</h3>
              <div className="flex gap-2 text-[10px] font-mono">
                <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded">Owner: {room.created_by}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
