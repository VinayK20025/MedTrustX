'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Users, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { CohortDefinition } from '../types/data-scientist.types';

interface ExplorationPanelProps {
  cohorts: CohortDefinition[];
  onExportCohort: (id: string) => void;
}

export const ExplorationPanel: React.FC<ExplorationPanelProps> = ({ cohorts, onExportCohort }) => {
  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title="Cohort Exploration"
        icon={<Users className="w-4 h-4" />}
        action={<Button size="sm" variant="ghost" className="h-7 px-2"><Filter className="w-3.5 h-3.5 mr-1" /> New</Button>}
      />
      <CardBody className="flex-1 overflow-y-auto p-4 space-y-4">
        {cohorts.map(cohort => (
          <div key={cohort.id} className="bg-surface rounded-xl border border-white/10 p-4 hover:border-indigo-500/30 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 mr-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-gray-500">{cohort.id}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded border bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-bold">
                    {cohort.patientCount.toLocaleString()} Patients
                  </span>
                </div>
                <h4 className="text-sm font-medium text-white">{cohort.name}</h4>
              </div>
              <Button size="sm" variant="outline" className="text-[10px] h-7 px-2 border-white/10 shrink-0" onClick={() => onExportCohort(cohort.id)}>
                <Download className="w-3 h-3" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 mb-3">
              <div className="bg-black/20 rounded p-2 text-center border border-white/5">
                <p className="text-[9px] text-gray-500 uppercase">Avg Age</p>
                <p className="text-sm font-bold text-white mt-0.5">{cohort.avgAge} yrs</p>
              </div>
              <div className="bg-black/20 rounded p-2 text-center border border-white/5">
                <p className="text-[9px] text-gray-500 uppercase">Primary Cond.</p>
                <p className="text-[10px] font-bold text-white mt-1 truncate px-1" title={cohort.primaryCondition}>{cohort.primaryCondition}</p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1.5">Inclusion Criteria</p>
              {cohort.criteria.map((criterion, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[10px] text-gray-300 bg-white/5 px-2 py-1 rounded">
                  <Filter className="w-3 h-3 text-indigo-400" />
                  {criterion}
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
};
