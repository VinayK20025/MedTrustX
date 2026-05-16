'use client';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PatientPanel } from '../components/PatientPanel';
import { PainWorkspace } from '../components/PainWorkspace';
import { usePainDashboard, useUpdatePainScore, useScheduleProcedure } from '../hooks/usePainAnalytics';
import { Activity, Scissors, Users, TrendingDown } from 'lucide-react';

export const PainDashboard: React.FC = () => {
  const { data, isLoading } = usePainDashboard();
  const updatePain = useUpdatePainScore();
  const scheduleProc = useScheduleProcedure();

  const [activePatientId, setActivePatientId] = useState<string | undefined>();

  if (isLoading || !data) {
    return <div className="p-6 text-white animate-pulse">Loading pain management records...</div>;
  }

  const { data: painData } = data;

  const handleUpdatePainScore = (id: string, score: number) => {
    updatePain.mutate({ patientId: id, score });
  };

  const handleScheduleProcedure = (id: string, type: string, date: string) => {
    scheduleProc.mutate({ patientId: id, type, date });
  };

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-8rem)]">
      {/* Header & Metrics */}
      <div className="flex flex-col gap-4 flex-shrink-0">
        <Breadcrumbs items={[{ label: 'Pain Management' }, { label: 'Specialist Dashboard' }]} />
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-surface-dark border border-white/[0.06] rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Patients Treated</p>
              <p className="text-2xl font-bold text-white">{painData.metrics.patientsTreated}</p>
            </div>
          </div>
          <div className="bg-surface-dark border border-white/[0.06] rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Procedures Done</p>
              <p className="text-2xl font-bold text-white">{painData.metrics.proceduresDone}</p>
            </div>
          </div>
          <div className="bg-surface-dark border border-white/[0.06] rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Avg Pain Reduction</p>
              <p className="text-2xl font-bold text-white">{painData.metrics.avgPainReduction}%</p>
            </div>
          </div>
          <div className="bg-surface-dark border border-white/[0.06] rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Follow-Ups Due</p>
              <p className="text-2xl font-bold text-white">{painData.metrics.followUpsDue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Left Sidebar - Patients */}
        <div className="lg:col-span-3 h-full">
          <PatientPanel 
            patients={painData.patients} 
            activePatientId={activePatientId}
            onSelectPatient={setActivePatientId}
          />
        </div>

        {/* Center Workspace */}
        <div className="lg:col-span-9 h-full">
          <PainWorkspace 
            data={painData} 
            activePatientId={activePatientId}
            onUpdatePainScore={handleUpdatePainScore}
            onScheduleProcedure={handleScheduleProcedure}
          />
        </div>
      </div>
    </div>
  );
};
