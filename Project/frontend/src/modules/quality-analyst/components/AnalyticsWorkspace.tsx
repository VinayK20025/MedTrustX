'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { DepartmentComparison, TrendDataPoint } from '../types/quality-analyst.types';
import { useGenerateReport } from '../hooks/useQualityAnalytics';
import { BarChart3, TrendingUp, GitCompare, FileText, Download, Activity } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { comparisons: DepartmentComparison[]; trends: TrendDataPoint[]; }

export function AnalyticsWorkspace({ comparisons, trends }: Props) {
  const { mutate: generate } = useGenerateReport();
  const [tab, setTab] = useState<'trends' | 'comparison' | 'reports'>('trends');

  const tabs = [
    { key: 'trends' as const, label: 'Trend Analysis', icon: TrendingUp },
    { key: 'comparison' as const, label: 'Department Comparison', icon: GitCompare },
    { key: 'reports' as const, label: 'Report Generation', icon: FileText },
  ];

  return (
    <Card className="border-purple-500/20 shadow-glass bg-[#050308] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-800 via-fuchsia-600 to-indigo-600" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <h3 className="text-[16px] font-black text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-400" /> Quality Analytics Workspace
        </h3>
        <p className="text-[11px] text-gray-500 mt-0.5">Explore metrics, validate data accuracy, and generate actionable reports.</p>
      </CardHeader>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.05] px-5 bg-black/20">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors mr-1',
              tab === t.key ? 'text-purple-400 border-purple-400' : 'text-gray-500 border-transparent hover:text-gray-300'
            )}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto">

        {/* TRENDS TAB */}
        {tab === 'trends' && (
          <div className="p-5 animate-fade-in space-y-6">
            <div>
              <p className="text-[13px] font-bold text-white mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-400" /> Compliance vs Infection Rate (7 Days)</p>
              
              {/* Pseudo-Chart Visualization */}
              <div className="h-64 flex items-end justify-between gap-2 px-2 pb-6 border-b border-white/10 relative">
                {trends.map((t, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-12 bg-black/90 border border-white/10 p-2 rounded text-[10px] hidden group-hover:block z-10 w-32 shadow-xl">
                      <p className="font-bold text-white mb-1">{t.date}</p>
                      <p className="text-emerald-400">Compliance: {t.complianceScore}%</p>
                      <p className="text-emergency-light">Infections: {t.infectionRate}%</p>
                    </div>

                    <div className="w-full flex justify-center items-end gap-1 h-48">
                      {/* Compliance Bar (Green) */}
                      <div className="w-1/2 bg-emerald-500/80 rounded-t-sm transition-all group-hover:bg-emerald-400" style={{ height: `${t.complianceScore}%` }} />
                      {/* Infection Rate Bar (Red) - Scaled for visibility */}
                      <div className="w-1/2 bg-emergency-light/80 rounded-t-sm transition-all group-hover:bg-red-400" style={{ height: `${(t.infectionRate / 3) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-500 absolute -bottom-6">{t.date}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-8 justify-center">
                <span className="text-[11px] text-gray-400 flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-500/80" /> Compliance %</span>
                <span className="text-[11px] text-gray-400 flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emergency-light/80" /> Infection Rate</span>
              </div>
            </div>
          </div>
        )}

        {/* COMPARISON TAB */}
        {tab === 'comparison' && (
          <div className="p-5 animate-fade-in space-y-3">
            {comparisons.map(comp => (
              <div key={comp.id} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 flex items-center gap-6 transition-colors hover:bg-white/[0.04]">
                <div className="w-1/4">
                  <p className="text-[14px] font-bold text-white">{comp.department}</p>
                  <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded uppercase mt-1 inline-block',
                    comp.status === 'Above Average' ? 'bg-success/15 text-success-light' :
                    comp.status === 'Below Target' ? 'bg-emergency/15 text-emergency-light' : 'bg-white/10 text-gray-300'
                  )}>{comp.status}</span>
                </div>

                <div className="flex-1 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Quality Score</p>
                    <p className={cn('text-[18px] font-black font-mono', comp.score >= 90 ? 'text-success-light' : comp.score < 80 ? 'text-emergency-light' : 'text-white')}>{comp.score}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Incident Rate</p>
                    <p className="text-[18px] font-black text-white font-mono">{comp.incidentRate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Compliance</p>
                    <p className="text-[18px] font-black text-white font-mono">{comp.complianceRate}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* REPORTS TAB */}
        {tab === 'reports' && (
          <div className="p-5 animate-fade-in grid grid-cols-2 gap-4">
            {[
              { id: 'R1', title: 'Monthly Infection Control Report', desc: 'Aggregated HAI rates and audit compliances.' },
              { id: 'R2', title: 'Department Quality Scorecard', desc: 'Comparative analysis of all clinical departments.' },
              { id: 'R3', title: 'Regulatory Compliance Export', desc: 'Formatted data export for external health authorities.' },
              { id: 'R4', title: 'Incident & Anomaly Summary', desc: 'Log of all flagged safety risks and resolutions.' },
            ].map(r => (
              <div key={r.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <h4 className="text-[14px] font-bold text-white mb-1">{r.title}</h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed mb-4">{r.desc}</p>
                </div>
                <Button onClick={() => generate(r.title)}
                  className="w-full h-9 text-[11px] bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30"
                  leftIcon={<Download className="w-3.5 h-3.5" />}>
                  Generate & Download
                </Button>
              </div>
            ))}
          </div>
        )}

      </CardBody>
    </Card>
  );
}
