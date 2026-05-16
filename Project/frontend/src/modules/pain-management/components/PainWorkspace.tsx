'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Activity, Scissors, TrendingDown, Pill, FileText, ChevronRight, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { PainData } from '../types/pain-management.types';

interface PainWorkspaceProps {
  data: PainData;
  activePatientId?: string;
  onUpdatePainScore: (patientId: string, score: number) => void;
  onScheduleProcedure: (patientId: string, type: string, date: string) => void;
}

export const PainWorkspace: React.FC<PainWorkspaceProps> = ({ data, activePatientId, onUpdatePainScore, onScheduleProcedure }) => {
  const [activeTab, setActiveTab] = useState('assessment');

  // If no patient selected, just show the first active plan/assessments as a general view, or prompt to select
  const selectedPatient = data.patients.find(p => p.id === activePatientId) || data.patients[0];
  const assessments = data.recentAssessments.filter(a => a.patientId === selectedPatient?.id);
  const activePlan = data.activePlans.find(p => p.patientId === selectedPatient?.id);
  const procedures = data.procedures.filter(p => p.patientId === selectedPatient?.id);

  if (!selectedPatient) {
    return (
      <Card className="h-full flex items-center justify-center border-white/[0.06] shadow-glass bg-surface-dark">
        <div className="text-gray-500">Select a patient to view details</div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader 
        title={`${selectedPatient.name} (${selectedPatient.mrn})`}
        subtitle={`${selectedPatient.primaryDiagnosis} • ${selectedPatient.painType} Pain`}
        action={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-surface p-2 rounded-lg border border-white/10">
              <span className="text-xs text-gray-400">Current Pain:</span>
              <span className="text-lg font-bold text-rose-400">{selectedPatient.currentPainScore}/10</span>
            </div>
            <Button size="sm" variant="primary" className="bg-teal-600 hover:bg-teal-500 text-white h-9" onClick={() => onUpdatePainScore(selectedPatient.id, Math.max(0, selectedPatient.currentPainScore - 1))}>
              <Edit3 className="w-4 h-4 mr-2" />
              Update Score
            </Button>
          </div>
        }
      />

      <CardBody className="flex-1 overflow-y-auto p-4 md:p-6">
        <Tabs 
          activeTab={activeTab} 
          onChange={setActiveTab} 
          variant="pills"
          className="mb-6"
          tabs={[
            { id: 'assessment', label: 'Assessment & Scales', icon: <Activity className="w-4 h-4" /> },
            { id: 'treatment', label: 'Treatment Plan', icon: <Pill className="w-4 h-4" /> },
            { id: 'procedures', label: 'Interventions', icon: <Scissors className="w-4 h-4" /> }
          ]} 
        />

        {activeTab === 'assessment' && (
          <div className="space-y-4">
            <div className="bg-surface rounded-xl border border-white/10 p-4">
              <h3 className="text-sm font-medium text-white mb-4">Visual Analog Scale (VAS)</h3>
              <div className="relative pt-6 pb-2">
                <div className="h-2 bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-600 rounded-full w-full"></div>
                <div 
                  className="absolute top-4 w-4 h-4 bg-white rounded-full border-2 border-surface shadow cursor-pointer transition-all"
                  style={{ left: `calc(${selectedPatient.currentPainScore * 10}% - 8px)` }}
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-medium">
                  <span>0 - No Pain</span>
                  <span>5 - Moderate</span>
                  <span>10 - Worst Possible</span>
                </div>
              </div>
            </div>

            <h3 className="text-sm font-medium text-white mt-6 mb-2">Assessment History</h3>
            <div className="grid grid-cols-1 gap-4">
              {assessments.map(a => (
                <div key={a.id} className="bg-surface rounded-xl border border-white/10 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center font-bold">{a.score}</div>
                      <div>
                        <span className="text-xs bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-gray-300 mr-2">{a.scaleType}</span>
                        <span className="text-xs text-gray-400">{new Date(a.assessedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 space-y-1 pl-10">
                    <p><strong className="text-gray-300">Location:</strong> {a.location}</p>
                    <p><strong className="text-gray-300">Characteristics:</strong> {a.characteristics.join(', ')}</p>
                    <p><strong className="text-gray-300">Notes:</strong> {a.notes}</p>
                  </div>
                </div>
              ))}
              {assessments.length === 0 && <p className="text-xs text-gray-500">No recent assessments.</p>}
            </div>
          </div>
        )}

        {activeTab === 'treatment' && (
          <div className="space-y-4">
            {activePlan ? (
              <div className="bg-surface rounded-xl border border-white/10 p-4">
                <div className="flex items-center justify-between mb-4 border-b border-white/[0.06] pb-3">
                  <h3 className="text-sm font-medium text-white">Active Management Plan</h3>
                  <span className="text-xs bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded border border-teal-500/20">{activePlan.status}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Pill className="w-3 h-3"/> Medications</h4>
                    <ul className="space-y-2">
                      {activePlan.medications.map((m, i) => (
                        <li key={i} className="text-sm text-gray-300 bg-white/5 p-2 rounded flex justify-between">
                          <span>{m.name} <span className="text-xs text-gray-500 ml-1">{m.dosage}</span></span>
                          <span className="text-xs text-gray-400">{m.frequency}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Activity className="w-3 h-3"/> Therapies</h4>
                    <ul className="space-y-2">
                      {activePlan.therapies.map((t, i) => (
                        <li key={i} className="text-sm text-gray-300 bg-white/5 p-2 rounded flex justify-between">
                          <span>{t.type}</span>
                          <span className="text-xs text-gray-400">{t.frequency}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 bg-surface rounded-xl border border-white/10">
                <p className="text-sm text-gray-400">No active treatment plan.</p>
                <Button size="sm" variant="outline" className="mt-4 border-teal-500/30 text-teal-400">Create Plan</Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'procedures' && (
          <div className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button size="sm" variant="primary" className="bg-indigo-600 hover:bg-indigo-500 text-white" onClick={() => onScheduleProcedure(selectedPatient.id, 'Nerve Block', new Date().toISOString())}>
                Schedule Intervention
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {procedures.map(p => (
                <div key={p.id} className="bg-surface rounded-xl border border-white/10 p-4 flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-medium text-white">{p.type}</h4>
                    <p className="text-xs text-gray-400 mt-1">Scheduled: {new Date(p.scheduledAt).toLocaleString()}</p>
                    {p.outcome && <p className="text-xs text-emerald-400 mt-1">Outcome: {p.outcome}</p>}
                  </div>
                  <span className={cn(
                    "text-xs px-2 py-1 rounded border",
                    p.status === 'Completed' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  )}>
                    {p.status}
                  </span>
                </div>
              ))}
              {procedures.length === 0 && <p className="text-xs text-gray-500">No procedures scheduled.</p>}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
