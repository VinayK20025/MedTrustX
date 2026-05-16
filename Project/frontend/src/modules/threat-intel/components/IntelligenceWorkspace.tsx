'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { GitMerge, Zap, CheckCircle2, AlertTriangle, ArrowRight, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { ThreatIntelData } from '../types/threat-intel.types';

interface IntelligenceWorkspaceProps {
  data: ThreatIntelData;
  onPushRule: (id: string) => void;
}

export const IntelligenceWorkspace: React.FC<IntelligenceWorkspaceProps> = ({ data, onPushRule }) => {
  const [activeTab, setActiveTab] = useState('correlation');

  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader title="Intelligence Analysis Hub" subtitle="Correlation Engine & Detection Integration" />
      <CardBody className="flex-1 overflow-y-auto p-4 md:p-6">
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pills"
          className="mb-6 overflow-x-auto pb-2"
          tabs={[
            { id: 'correlation', label: 'Correlation Engine', icon: <GitMerge className="w-4 h-4" /> },
            { id: 'detection', label: 'Detection Rule Feeds', icon: <Zap className="w-4 h-4" /> },
          ]}
        />

        {/* CORRELATION ENGINE */}
        {activeTab === 'correlation' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
              <GitMerge className="w-4 h-4 text-indigo-400" /> Internal ↔ External Threat Correlation
            </h3>
            {data.correlations.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No correlations found.</p>
            ) : (
              <div className="grid gap-4">
                {data.correlations.map(cor => (
                  <div key={cor.id} className={cn("bg-[#0f111a] rounded-xl border p-4",
                    cor.confidence >= 90 ? "border-red-500/30 bg-red-500/5" : "border-white/10"
                  )}>
                    <div className="flex justify-between items-start mb-3">
                      <span className={cn("text-[9px] px-1.5 py-0.5 rounded border font-bold flex items-center gap-1",
                        cor.confidence >= 90 ? "bg-red-500/10 text-red-400 border-red-500/20" :
                        cor.confidence >= 70 ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                        "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      )}>
                        <AlertTriangle className="w-2.5 h-2.5" /> Confidence: {cor.confidence}%
                      </span>
                      <p className="text-[10px] text-gray-500 font-mono">{new Date(cor.timestamp).toLocaleString()}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-center">
                      {/* Internal Event */}
                      <div className="bg-black/40 rounded-lg border border-white/10 p-3">
                        <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Internal Event</p>
                        <p className="text-xs text-white font-medium">{cor.internalEvent}</p>
                        <p className="text-[10px] text-indigo-300 mt-1">{cor.internalSource}</p>
                      </div>

                      <ArrowRight className="w-5 h-5 text-red-400 shrink-0 hidden md:block" />

                      {/* External Threat */}
                      <div className="bg-red-500/5 rounded-lg border border-red-500/20 p-3">
                        <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">External Threat</p>
                        <p className="text-xs text-white font-medium">{cor.externalThreat}</p>
                        <p className="text-[10px] text-red-300 font-mono mt-1">IOC: {cor.matchedIoc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DETECTION RULE FEEDS */}
        {activeTab === 'detection' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-2">Detection System Integration</h3>
            <div className="grid gap-3">
              {data.detectionRules.map(rule => (
                <div key={rule.id} className={cn("bg-surface rounded-xl border p-4 flex items-center justify-between",
                  rule.status === 'Testing' ? "border-amber-500/20 bg-amber-500/5" : "border-white/10"
                )}>
                  <div className="flex items-start gap-3">
                    {rule.status === 'Enabled' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" /> :
                     <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />}
                    <div>
                      <h4 className="text-sm font-medium text-white">{rule.ruleName}</h4>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px]">
                        <span className="bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20">{rule.targetSystem}</span>
                        <span className="text-gray-500">Linked IOCs: <span className="text-white font-bold">{rule.linkedIocs}</span></span>
                        <span className="text-gray-500">Hits: <span className="text-white font-mono">{rule.hitCount}</span></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={cn("text-[9px] px-1.5 py-0.5 rounded border font-bold",
                      rule.status === 'Enabled' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      rule.status === 'Testing' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      "bg-gray-500/10 text-gray-400 border-gray-500/20"
                    )}>{rule.status}</span>
                    <Button size="sm" variant="outline" className="text-[9px] h-7 px-3 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10" onClick={() => onPushRule(rule.id)}>
                      <Upload className="w-3 h-3 mr-1" /> Push
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
