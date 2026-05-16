'use client';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { TaskPanel } from '../components/TaskPanel';
import { LabWorkspace } from '../components/LabWorkspace';
import { useBloodBankTechDashboard, useRecordScreening, usePerformCrossmatch } from '../hooks/useBloodBankTechAnalytics';
import { Droplet, Activity, TestTube, CheckCircle } from 'lucide-react';

export const BloodBankTechDashboard: React.FC = () => {
  const { data, isLoading } = useBloodBankTechDashboard();
  const recordScreening = useRecordScreening();
  const performCrossmatch = usePerformCrossmatch();

  const [activeTaskId, setActiveTaskId] = useState<string | undefined>();

  if (isLoading || !data) {
    return <div className="p-6 text-white animate-pulse">Loading lab environment...</div>;
  }

  const { data: techData } = data;

  const handleRecordResult = (id: string, result: 'Negative' | 'Positive' | 'Invalid') => {
    recordScreening.mutate({ screeningId: id, result });
  };

  const handlePerformCrossmatch = (id: string, unitIds: string[]) => {
    performCrossmatch.mutate({ requestId: id, unitIds });
  };

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-8rem)]">
      {/* Header & Metrics */}
      <div className="flex flex-col gap-4 flex-shrink-0">
        <Breadcrumbs items={[{ label: 'Lab Execution' }, { label: 'Technician Dashboard' }]} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-dark border border-white/[0.06] rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Droplet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Units Processed</p>
              <p className="text-2xl font-bold text-white">{techData.metrics.unitsProcessed}</p>
            </div>
          </div>
          <div className="bg-surface-dark border border-white/[0.06] rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <TestTube className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Tests Completed</p>
              <p className="text-2xl font-bold text-white">{techData.metrics.testsCompleted}</p>
            </div>
          </div>
          <div className="bg-surface-dark border border-white/[0.06] rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Errors Prevented</p>
              <p className="text-2xl font-bold text-white">{techData.metrics.mismatchesPrevented}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Left Sidebar - Tasks */}
        <div className="lg:col-span-3 h-full">
          <TaskPanel 
            tasks={techData.tasks} 
            activeTaskId={activeTaskId}
            onSelectTask={setActiveTaskId}
          />
        </div>

        {/* Center Workspace */}
        <div className="lg:col-span-9 h-full">
          <LabWorkspace 
            data={techData} 
            onRecordResult={handleRecordResult}
            onPerformCrossmatch={handlePerformCrossmatch}
          />
        </div>
      </div>
    </div>
  );
};
