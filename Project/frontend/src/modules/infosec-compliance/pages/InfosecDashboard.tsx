'use client';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { FrameworkPanel } from '../components/FrameworkPanel';
import { ComplianceWorkspace } from '../components/ComplianceWorkspace';
import { useInfosecDashboard } from '../hooks/useInfosecAnalytics';
import { ShieldCheck, AlertTriangle, FileSearch, Siren } from 'lucide-react';

export const InfosecDashboard: React.FC = () => {
  const { data, isLoading } = useInfosecDashboard();
  const [activeFrameworkId, setActiveFrameworkId] = useState<string | undefined>();

  if (isLoading || !data) {
    return <div className="p-6 text-white animate-pulse">Loading compliance data...</div>;
  }

  const { data: grcData } = data;

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-8rem)]">
      {/* Header & Metrics */}
      <div className="flex flex-col gap-4 flex-shrink-0">
        <Breadcrumbs items={[{ label: 'Information Security' }, { label: 'GRC Dashboard' }]} />
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-surface-dark border border-white/[0.06] rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Overall Score</p>
              <p className="text-2xl font-bold text-white">{grcData.metrics.overallScore}%</p>
            </div>
          </div>
          <div className="bg-surface-dark border border-white/[0.06] rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Open Risks</p>
              <p className="text-2xl font-bold text-white">{grcData.metrics.openRisks}</p>
            </div>
          </div>
          <div className="bg-surface-dark border border-white/[0.06] rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <FileSearch className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Active Audits</p>
              <p className="text-2xl font-bold text-white">{grcData.metrics.activeAudits}</p>
            </div>
          </div>
          <div className="bg-surface-dark border border-white/[0.06] rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Siren className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Open Incidents</p>
              <p className="text-2xl font-bold text-white">{grcData.metrics.openIncidents}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Left Sidebar - Frameworks */}
        <div className="lg:col-span-3 h-full">
          <FrameworkPanel 
            frameworks={grcData.frameworks} 
            activeFrameworkId={activeFrameworkId}
            onSelectFramework={setActiveFrameworkId}
          />
        </div>

        {/* Center Workspace */}
        <div className="lg:col-span-9 h-full">
          <ComplianceWorkspace 
            data={grcData} 
            activeFrameworkId={activeFrameworkId}
          />
        </div>
      </div>
    </div>
  );
};
