'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { AlertTriangle, Wrench, Server, Siren, BarChart3, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { RiskData, SecurityRisk } from '../types/infosec-risk.types';

interface RiskWorkspaceProps {
  data: RiskData;
  activeRiskId?: string;
  onAddMitigation: (riskId: string, action: string, assignee: string) => void;
}

const impactLabels: Record<number, string> = { 1: 'Negligible', 2: 'Minor', 3: 'Moderate', 4: 'Major', 5: 'Critical' };
const likelihoodLabels: Record<number, string> = { 1: 'Rare', 2: 'Unlikely', 3: 'Possible', 4: 'Likely', 5: 'Almost Certain' };

const HEATMAP_COLORS: Record<number, string> = {
  1: 'bg-teal-500/20 text-teal-300',
  2: 'bg-teal-500/30 text-teal-200',
  3: 'bg-yellow-500/30 text-yellow-200',
  4: 'bg-amber-500/40 text-amber-200',
  5: 'bg-orange-500/40 text-orange-200',
  6: 'bg-amber-600/40 text-amber-100',
  8: 'bg-orange-600/40 text-orange-100',
  9: 'bg-orange-600/40 text-orange-100',
  10: 'bg-red-500/40 text-red-200',
  12: 'bg-red-600/50 text-red-100',
  15: 'bg-red-600/60 text-red-50',
  16: 'bg-red-700/60 text-red-50',
  20: 'bg-red-800/80 text-white',
  25: 'bg-red-900 text-white',
};

function heatmapClass(score: number): string {
  const keys = Object.keys(HEATMAP_COLORS).map(Number).sort((a, b) => a - b);
  for (const k of keys.reverse()) {
    if (score >= k) return HEATMAP_COLORS[k];
  }
  return 'bg-white/5 text-gray-400';
}

const RiskHeatmap: React.FC<{ risks: SecurityRisk[] }> = ({ risks }) => {
  const impacts = [5, 4, 3, 2, 1];
  const likelihoods = [1, 2, 3, 4, 5];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-white">Risk Heatmap — Impact vs Likelihood</h3>
      <div className="flex gap-2 items-start">
        {/* Y axis label */}
        <div className="flex flex-col items-center justify-center h-full w-6 shrink-0">
          <p className="text-[10px] text-gray-500 -rotate-90 whitespace-nowrap mt-16">Impact →</p>
        </div>
        <div>
          {impacts.map(impact => (
            <div key={impact} className="flex gap-2 mb-2 items-center">
              <span className="text-[10px] text-gray-500 w-16 text-right shrink-0">{impactLabels[impact]}</span>
              {likelihoods.map(likelihood => {
                const score = impact * likelihood;
                const cellRisks = risks.filter(r => r.impact === impact && r.likelihood === likelihood);
                return (
                  <div
                    key={likelihood}
                    className={cn(
                      "w-14 h-10 rounded flex flex-col items-center justify-center border border-white/5 transition-all",
                      heatmapClass(score)
                    )}
                    title={`Impact ${impact} × Likelihood ${likelihood} = ${score}`}
                  >
                    <span className="text-xs font-bold">{score}</span>
                    {cellRisks.length > 0 && (
                      <span className="text-[9px] opacity-80">{cellRisks.length} risk{cellRisks.length > 1 ? 's' : ''}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          <div className="flex gap-2 ml-[72px] mt-2">
            {likelihoods.map(l => (
              <div key={l} className="w-14 text-center text-[10px] text-gray-500">{likelihoodLabels[l]}</div>
            ))}
          </div>
          <p className="text-[10px] text-gray-500 text-center mt-1 ml-[72px]">← Likelihood</p>
        </div>
      </div>
    </div>
  );
};

export const RiskWorkspace: React.FC<RiskWorkspaceProps> = ({ data, activeRiskId, onAddMitigation }) => {
  const [activeTab, setActiveTab] = useState('assessment');
  const selectedRisk = data.risks.find(r => r.id === activeRiskId) || data.risks[0];
  const mitigations = data.mitigations[selectedRisk?.id] || [];
  const assets = data.assets[selectedRisk?.id] || [];
  const incidents = data.incidents[selectedRisk?.id] || [];

  if (!selectedRisk) {
    return (
      <Card className="h-full flex items-center justify-center border-white/[0.06] shadow-glass bg-surface-dark">
        <div className="text-gray-500">Select a risk to view details</div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title={selectedRisk.title}
        subtitle={`${selectedRisk.id} • ${selectedRisk.category}`}
        action={
          <div className="flex gap-2 items-center">
            <div className={cn(
              "text-xs font-bold px-2 py-1 rounded border uppercase tracking-wider",
              selectedRisk.riskLevel === 'Critical' ? "bg-red-500/10 text-red-400 border-red-500/20" :
              selectedRisk.riskLevel === 'High' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
              "bg-amber-500/10 text-amber-400 border-amber-500/20"
            )}>
              {selectedRisk.riskLevel}
            </div>
            <Button size="sm" variant="primary" className="bg-indigo-600 hover:bg-indigo-500 text-white h-9"
              onClick={() => onAddMitigation(selectedRisk.id, 'New mitigation action', 'Unassigned')}>
              <Wrench className="w-4 h-4 mr-2" />
              Add Mitigation
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
            { id: 'assessment', label: 'Assessment', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'heatmap', label: 'Heatmap', icon: <AlertTriangle className="w-4 h-4" /> },
            { id: 'mitigation', label: 'Mitigation', icon: <Wrench className="w-4 h-4" />, count: mitigations.length },
            { id: 'assets', label: 'Linked Assets', icon: <Server className="w-4 h-4" /> },
            { id: 'incidents', label: 'Incidents', icon: <Siren className="w-4 h-4" /> },
          ]}
        />

        {activeTab === 'assessment' && (
          <div className="space-y-6">
            <p className="text-sm text-gray-300 bg-white/5 p-4 rounded-xl border border-white/10">
              {selectedRisk.description}
            </p>

            {/* Impact / Likelihood Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-surface rounded-xl border border-white/10 p-4 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Impact</p>
                <p className="text-3xl font-bold text-rose-400">{selectedRisk.impact}</p>
                <p className="text-xs text-gray-500 mt-1">{impactLabels[selectedRisk.impact]}</p>
              </div>
              <div className="bg-surface rounded-xl border border-white/10 p-4 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Likelihood</p>
                <p className="text-3xl font-bold text-amber-400">{selectedRisk.likelihood}</p>
                <p className="text-xs text-gray-500 mt-1">{likelihoodLabels[selectedRisk.likelihood]}</p>
              </div>
              <div className="bg-surface rounded-xl border border-red-500/20 p-4 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Severity Score</p>
                <p className="text-3xl font-bold text-red-400">{selectedRisk.severityScore}</p>
                <p className="text-xs text-gray-500 mt-1">of 25 maximum</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-surface rounded-xl border border-white/10 p-3">
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <span className={cn(
                  "font-medium",
                  selectedRisk.status === 'Open' ? 'text-rose-400' : selectedRisk.status === 'Mitigating' ? 'text-amber-400' : 'text-emerald-400'
                )}>{selectedRisk.status}</span>
              </div>
              <div className="bg-surface rounded-xl border border-white/10 p-3">
                <p className="text-xs text-gray-400 mb-1">Risk Owner</p>
                <span className="text-white font-medium">{selectedRisk.owner}</span>
              </div>
              <div className="bg-surface rounded-xl border border-white/10 p-3">
                <p className="text-xs text-gray-400 mb-1">Date Identified</p>
                <span className="text-white">{new Date(selectedRisk.dateIdentified).toLocaleDateString()}</span>
              </div>
              <div className="bg-surface rounded-xl border border-white/10 p-3">
                <p className="text-xs text-gray-400 mb-1">Category</p>
                <span className="text-white font-medium">{selectedRisk.category}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'heatmap' && (
          <div className="overflow-x-auto">
            <RiskHeatmap risks={data.risks} />
          </div>
        )}

        {activeTab === 'mitigation' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white">Mitigation Actions</h3>
            {mitigations.map(m => (
              <div key={m.id} className="bg-surface rounded-xl border border-white/10 p-4">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm text-white font-medium">{m.action}</p>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded border font-bold uppercase ml-3 shrink-0",
                    m.status === 'Completed' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                    m.status === 'In Progress' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                    "bg-white/5 border-white/10 text-gray-400"
                  )}>
                    {m.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-indigo-400" /> {m.assignee}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-rose-400" /> Due: {new Date(m.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {mitigations.length === 0 && <p className="text-sm text-gray-500">No mitigation actions recorded.</p>}
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white">Linked Assets at Risk</h3>
            {assets.map(asset => (
              <div key={asset.id} className="bg-surface rounded-xl border border-white/10 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-white/5 border border-white/10"><Server className="w-4 h-4 text-indigo-400" /></div>
                  <div>
                    <p className="text-sm font-medium text-white">{asset.name}</p>
                    <p className="text-xs text-gray-500">{asset.type}</p>
                  </div>
                </div>
                <span className={cn(
                  "text-xs font-bold px-2 py-1 rounded border",
                  asset.criticality === 'High' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                  asset.criticality === 'Medium' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                  "bg-teal-500/10 text-teal-400 border-teal-500/20"
                )}>
                  {asset.criticality} Criticality
                </span>
              </div>
            ))}
            {assets.length === 0 && <p className="text-sm text-gray-500">No assets linked to this risk.</p>}
          </div>
        )}

        {activeTab === 'incidents' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white">Related Incidents</h3>
            {incidents.map(inc => (
              <div key={inc.id} className="bg-surface rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-rose-500/20 text-rose-400"><Siren className="w-4 h-4" /></div>
                  <div>
                    <p className="text-sm font-medium text-white">{inc.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(inc.date).toLocaleDateString()} • Impact: {inc.impactScale}</p>
                  </div>
                </div>
              </div>
            ))}
            {incidents.length === 0 && <p className="text-sm text-gray-500">No related incidents found.</p>}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
