'use client';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PatientPanel } from '../components/PatientPanel';
import { CounselingWorkspace } from '../components/CounselingWorkspace';
import { useGeneticDashboard, useLogCounselingSession } from '../hooks/useGeneticAnalytics';
import { Users, AlertTriangle, FileText, CheckCircle } from 'lucide-react';

export const GeneticDashboard: React.FC = () => {
  const { data, isLoading } = useGeneticDashboard();
  const logSession = useLogCounselingSession();

  const [activePatientId, setActivePatientId] = useState<string | undefined>();

  if (isLoading || !data) {
    return <div className="p-6 text-white animate-pulse">Loading genetic risk data...</div>;
  }

  const { data: geneticData } = data;

  const handleLogSession = (id: string, summary: string, recommendations: string[]) => {
    logSession.mutate({ patientId: id, summary, recommendations });
  };

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-8rem)]">
      {/* Header & Metrics */}
      <div className="flex flex-col gap-4 flex-shrink-0">
        <Breadcrumbs items={[{ label: 'Clinical Genetics' }, { label: 'Counseling Dashboard' }]} />
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-surface-dark border border-white/[0.06] rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Active Cases</p>
              <p className="text-2xl font-bold text-white">{geneticData.metrics.activeCases}</p>
            </div>
          </div>
          <div className="bg-surface-dark border border-white/[0.06] rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Sessions Conducted</p>
              <p className="text-2xl font-bold text-white">{geneticData.metrics.sessionsConducted}</p>
            </div>
          </div>
          <div className="bg-surface-dark border border-white/[0.06] rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">High-Risk Patients</p>
              <p className="text-2xl font-bold text-white">{geneticData.metrics.highRiskPatients}</p>
            </div>
          </div>
          <div className="bg-surface-dark border border-white/[0.06] rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Follow-Up Rate</p>
              <p className="text-2xl font-bold text-white">{geneticData.metrics.followUpRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Left Sidebar - Patients */}
        <div className="lg:col-span-3 h-full">
          <PatientPanel 
            patients={geneticData.patients} 
            activePatientId={activePatientId}
            onSelectPatient={setActivePatientId}
          />
        </div>

        {/* Center Workspace */}
        <div className="lg:col-span-9 h-full">
          <CounselingWorkspace 
            data={geneticData} 
            activePatientId={activePatientId}
            onLogSession={handleLogSession}
          />
        </div>
      </div>
    </div>
  );
};
