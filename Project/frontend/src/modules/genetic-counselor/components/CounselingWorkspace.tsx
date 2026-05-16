'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { GitBranch, AlertTriangle, FileText, HeartHandshake, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { GeneticData } from '../types/genetic.types';

interface CounselingWorkspaceProps {
  data: GeneticData;
  activePatientId?: string;
  onLogSession: (patientId: string, summary: string, recommendations: string[]) => void;
}

export const CounselingWorkspace: React.FC<CounselingWorkspaceProps> = ({ data, activePatientId, onLogSession }) => {
  const [activeTab, setActiveTab] = useState('family-history');

  const selectedPatient = data.patients.find(p => p.id === activePatientId) || data.patients[0];
  const familyHistory = data.familyHistories[selectedPatient?.id] || [];
  const riskAnalysis = data.risks[selectedPatient?.id] || [];
  const reports = data.reports[selectedPatient?.id] || [];
  const sessions = data.sessions[selectedPatient?.id] || [];

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
        subtitle={`${selectedPatient.referralReason}`}
        action={
          <div className="flex items-center gap-3">
            <span className={cn(
              "text-xs px-2 py-1 rounded border uppercase tracking-wider font-bold",
              selectedPatient.riskLevel === 'High' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-teal-500/10 text-teal-400 border-teal-500/20"
            )}>
              {selectedPatient.riskLevel} Risk
            </span>
            <Button size="sm" variant="primary" className="bg-indigo-600 hover:bg-indigo-500 text-white h-9" onClick={() => onLogSession(selectedPatient.id, 'New Counseling Session Log', ['Follow up in 6 months'])}>
              <HeartHandshake className="w-4 h-4 mr-2" />
              New Session
            </Button>
          </div>
        }
      />

      <CardBody className="flex-1 overflow-y-auto p-4 md:p-6">
        <Tabs 
          activeTab={activeTab} 
          onChange={setActiveTab} 
          variant="pills"
          className="mb-6 overflow-x-auto pb-2"
          tabs={[
            { id: 'family-history', label: 'Pedigree & History', icon: <GitBranch className="w-4 h-4" /> },
            { id: 'risk', label: 'Risk Analysis', icon: <AlertTriangle className="w-4 h-4" /> },
            { id: 'reports', label: 'Genetic Reports', icon: <FileText className="w-4 h-4" /> },
            { id: 'sessions', label: 'Counseling Sessions', icon: <HeartHandshake className="w-4 h-4" /> }
          ]} 
        />

        {activeTab === 'family-history' && (
          <div className="space-y-4">
            <div className="bg-surface rounded-xl border border-white/10 p-4">
              <h3 className="text-sm font-medium text-white mb-4">Family History Summary</h3>
              {familyHistory.length > 0 ? (
                <div className="space-y-3">
                  {familyHistory.map(fm => (
                    <div key={fm.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                      <div>
                        <p className="text-sm font-medium text-white">{fm.relation}</p>
                        <p className="text-xs text-rose-400 font-medium mt-0.5">{fm.condition} {fm.ageOfOnset && `(Diagnosed at ${fm.ageOfOnset})`}</p>
                      </div>
                      {fm.deceased && <span className="text-[10px] text-gray-500 uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded">Deceased</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No family history documented.</p>
              )}
            </div>
            {/* Visual Pedigree Placeholder */}
            <div className="h-48 bg-surface rounded-xl border border-white/10 border-dashed flex flex-col items-center justify-center text-gray-500">
              <GitBranch className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">Pedigree Visualization Rendered Here</p>
            </div>
          </div>
        )}

        {activeTab === 'risk' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-2">Probabilistic Risk Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {riskAnalysis.map((risk, idx) => (
                <div key={idx} className="bg-surface rounded-xl border border-white/10 p-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-bl-full -mr-4 -mt-4"></div>
                  <h4 className="text-base font-semibold text-white mb-1">{risk.condition}</h4>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl font-bold text-rose-400">{risk.probabilityPercentage}%</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Lifetime Risk</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400 font-medium">Key Risk Factors:</p>
                    <ul className="list-disc list-inside text-xs text-gray-300">
                      {risk.keyFactors.map((factor, i) => <li key={i}>{factor}</li>)}
                    </ul>
                  </div>
                </div>
              ))}
              {riskAnalysis.length === 0 && <p className="text-sm text-gray-500">No risk analysis available.</p>}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-4">
            {reports.map(rep => (
              <div key={rep.id} className="bg-surface rounded-xl border border-white/10 p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-white">{rep.testName}</h4>
                    <p className="text-xs text-gray-400 mt-1">Reported: {new Date(rep.dateReported).toLocaleDateString()}</p>
                  </div>
                  <span className={cn(
                    "text-xs px-2 py-1 rounded border font-bold",
                    rep.pathogenicity === 'Pathogenic' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  )}>
                    {rep.pathogenicity}
                  </span>
                </div>
                <div className="bg-black/20 p-3 rounded-lg border border-white/5 space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-400">Gene: <span className="font-mono text-white ml-1">{rep.gene}</span></div>
                    <div className="text-xs text-gray-400">Variant: <span className="font-mono text-white ml-1">{rep.variant}</span></div>
                  </div>
                  <p className="text-sm text-gray-300 mt-2">{rep.impact}</p>
                </div>
              </div>
            ))}
            {reports.length === 0 && <p className="text-sm text-gray-500">No test results pending or reported.</p>}
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-4">
            {sessions.map(sess => (
              <div key={sess.id} className="bg-surface rounded-xl border border-white/10 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-sm font-medium text-white">Counseling Session</h4>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(sess.date).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-300 mb-4">{sess.discussionSummary}</p>
                <div className="mb-4">
                  <p className="text-xs text-gray-400 font-medium mb-1">Recommendations:</p>
                  <ul className="space-y-1">
                    {sess.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle className="w-3 h-3 text-emerald-400 mt-1" /> {rec}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center gap-2 bg-white/5 p-2 rounded text-xs border border-white/10">
                  <span className="text-gray-400">Patient Understanding:</span>
                  <span className="text-emerald-400 font-medium">{sess.patientUnderstanding}</span>
                </div>
              </div>
            ))}
            {sessions.length === 0 && <p className="text-sm text-gray-500">No counseling sessions recorded.</p>}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
