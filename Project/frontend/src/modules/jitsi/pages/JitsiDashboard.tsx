import React from 'react';
import { ConferenceRoomsPanel } from '../components/ConferenceRoomsPanel';
import { ParticipantsPanel } from '../components/ParticipantsPanel';
import { ConferenceSessionsPanel } from '../components/ConferenceSessionsPanel';
import { MediaLogsPanel } from '../components/MediaLogsPanel';

export const JitsiDashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      <div className="lg:col-span-2">
        <ConferenceRoomsPanel />
      </div>
      <div className="lg:col-span-1">
        <ParticipantsPanel />
      </div>
      <div className="lg:col-span-1">
        <ConferenceSessionsPanel />
      </div>
      <div className="lg:col-span-2">
        <MediaLogsPanel />
      </div>
    </div>
  );
};
