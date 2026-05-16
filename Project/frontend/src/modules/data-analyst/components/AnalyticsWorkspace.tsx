'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { BarChart3, Lightbulb, FileText, TrendingUp, TrendingDown, CheckCircle, RefreshCw, Download, Siren, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { DataAnalystData } from '../types/analyst.types';

interface AnalyticsWorkspaceProps {
  data: DataAnalystData;
  onGenerateReport: (id: string) => void;
  onMarkInsightReviewed: (id: string) => void;
}

const severityConfig: Record<string, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  Critical: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', icon: <Siren className="w-3.5 h-3.5" /> },
  High:     { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', icon: <Siren className="w-3.5 h-3.5" /> },
  Medium:   { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', icon: <Siren className="w-3.5 h-3.5" /> },
  Low:      { bg: 'bg-white/5', border: 'border-white/10', text: 'text-gray-400', icon: null },
  Positive: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: <CheckCircle className="w-3.5 h-3.5" /> },
};

const categoryColors: Record<string, string> = {
  Clinical: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  Financial: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Operational: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Quality: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

// Simple sparkline-style bar chart
const MiniBarChart: React.FC<{ points: { period: string; value: number }[]; color: string; unit: string }> = ({ points, color, unit }) => {
  const max = Math.max(...points.map(p => p.value));
  const min = Math.min(...points.map(p => p.value));
  const range = max - min || 1;
  return (
    <div className="flex items-end gap-1 h-16">
      {points.map((p, i) => {
        const height = ((p.value - min) / range) * 100;
        const isLast = i === points.length - 1;
        return (
          <div key={p.period} className="flex flex-col items-center gap-1 flex-1">
            <div className="w-full rounded-sm relative group" style={{ height: `${Math.max(height, 8)}%`, backgroundColor: isLast ? color : `${color}60` }}>
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 hidden group-hover:block text-[9px] text-white bg-black/80 px-1 py-0.5 rounded whitespace-nowrap z-10">
                {p.value}{unit === '%' ? '%' : unit === '₹L' ? '₹L' : ''}
              </div>
            </div>
            {isLast && <span className="text-[8px] text-gray-500">{p.period}</span>}
          </div>
        );
      })}
    </div>
  );
};

// Simple donut-style percentage bar
const DistributionBar: React.FC<{ segments: { label: string; value: number; color: string }[]; total: number }> = ({ segments, total }) => (
  <div className="space-y-2">
    <div className="flex h-4 rounded-full overflow-hidden gap-px">
      {segments.map(seg => (
        <div key={seg.label} className="transition-all" style={{ width: `${(seg.value / total) * 100}%`, backgroundColor: seg.color }} />
      ))}
    </div>
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {segments.map(seg => (
        <div key={seg.label} className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
          <span className="text-[10px] text-gray-400">{seg.label}</span>
          <span className="text-[10px] font-bold text-white">{((seg.value / total) * 100).toFixed(0)}%</span>
        </div>
      ))}
    </div>
  </div>
);

export const AnalyticsWorkspace: React.FC<AnalyticsWorkspaceProps> = ({ data, onGenerateReport, onMarkInsightReviewed }) => {
  const [activeTab, setActiveTab] = useState('trends');
  const newInsights = data.insights.filter(i => i.status === 'New');

  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title="Analytics Workspace"
        subtitle="Healthcare insights · April 2026"
        action={
          newInsights.length > 0
            ? <span className="text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-1 rounded-full">{newInsights.length} new insights</span>
            : null
        }
      />
      <CardBody className="flex-1 overflow-y-auto p-4 md:p-6">
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pills"
          className="mb-6 overflow-x-auto pb-2"
          tabs={[
            { id: 'trends', label: 'Trends', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'distribution', label: 'Distribution', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'insights', label: 'Insights', icon: <Lightbulb className="w-4 h-4" />, count: newInsights.length },
            { id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" />, count: data.reports.filter(r => r.status === 'Ready').length },
          ]}
        />

        {/* TRENDS */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <h3 className="text-sm font-medium text-white mb-4">8-Month Performance Trends</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.trends.map(trend => {
                const last = trend.points[trend.points.length - 1].value;
                const prev = trend.points[trend.points.length - 2].value;
                const chg = (((last - prev) / prev) * 100).toFixed(1);
                const isUp = last > prev;
                return (
                  <div key={trend.id} className="bg-surface rounded-xl border border-white/10 p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-sm font-medium text-white">{trend.label}</h4>
                        <p className="text-2xl font-bold mt-1" style={{ color: trend.color }}>
                          {trend.unit === '₹L' ? `₹${last}L` : trend.unit === '%' ? `${last}%` : last.toLocaleString()}
                        </p>
                      </div>
                      <div className={cn("flex items-center gap-1 text-xs font-bold mt-1",
                        isUp ? "text-emerald-400" : "text-rose-400"
                      )}>
                        {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {isUp ? '+' : ''}{chg}%
                      </div>
                    </div>
                    <MiniBarChart points={trend.points} color={trend.color} unit={trend.unit} />
                    <div className="flex justify-between mt-2">
                      <span className="text-[10px] text-gray-600">{trend.points[0].period}</span>
                      <span className="text-[10px] text-gray-600">{trend.points[trend.points.length - 1].period}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DISTRIBUTION */}
        {activeTab === 'distribution' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl border border-white/10 p-5">
              <h3 className="text-sm font-medium text-white mb-1">Admissions by Department</h3>
              <p className="text-xs text-gray-400 mb-4">
                Total: <span className="text-white font-bold">{data.admissionsByDept.reduce((s, d) => s + d.value, 0).toLocaleString()}</span> patients this month
              </p>
              <DistributionBar segments={data.admissionsByDept} total={data.admissionsByDept.reduce((s, d) => s + d.value, 0)} />
              <div className="mt-4 space-y-2">
                {data.admissionsByDept.map(dept => (
                  <div key={dept.label} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dept.color }} />
                    <span className="text-xs text-gray-300 flex-1">{dept.label}</span>
                    <span className="text-xs font-bold text-white">{dept.value.toLocaleString()}</span>
                    <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(dept.value / Math.max(...data.admissionsByDept.map(d => d.value))) * 100}%`, backgroundColor: dept.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-white/10 p-5">
              <h3 className="text-sm font-medium text-white mb-1">Revenue by Payer Mix</h3>
              <p className="text-xs text-gray-400 mb-4">Total: ₹<span className="text-white font-bold">182.4 Lakh</span> this month</p>
              <DistributionBar segments={data.revenueByPayer} total={100} />
              <div className="mt-4 space-y-2">
                {data.revenueByPayer.map(payer => (
                  <div key={payer.label} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: payer.color }} />
                    <span className="text-xs text-gray-300 flex-1">{payer.label}</span>
                    <span className="text-xs font-bold text-white">{payer.value}%</span>
                    <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${payer.value}%`, backgroundColor: payer.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* INSIGHTS */}
        {activeTab === 'insights' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-white">AI-Generated Insights</h3>
              <span className="text-xs text-gray-400">{data.insights.length} findings</span>
            </div>
            {data.insights.map(insight => {
              const scfg = severityConfig[insight.severity] || severityConfig.Low;
              return (
                <div key={insight.id} className={cn("bg-surface rounded-xl border p-4", scfg.border, insight.severity === 'Critical' ? 'bg-red-500/5' : '')}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start gap-2 flex-1 mr-3">
                      <div className={cn("p-1.5 rounded shrink-0", scfg.bg, scfg.text)}>{scfg.icon}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-bold", categoryColors[insight.category])}>{insight.category}</span>
                          <span className={cn("text-[10px] font-bold uppercase", scfg.text)}>{insight.severity}</span>
                        </div>
                        <h4 className="text-sm font-medium text-white">{insight.title}</h4>
                        <p className="text-xs text-gray-400 mt-1">{insight.description}</p>
                      </div>
                    </div>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded border shrink-0",
                      insight.status === 'New' ? "bg-white/5 text-gray-400 border-white/10" :
                      insight.status === 'Action Taken' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                    )}>{insight.status}</span>
                  </div>
                  <div className="bg-black/20 rounded-lg px-3 py-2 border border-white/5 mb-3">
                    <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider">Impact</p>
                    <p className="text-xs text-gray-300">{insight.impact}</p>
                  </div>
                  <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-lg px-3 py-2 mb-3">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-indigo-200">{insight.recommendation}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-gray-500">{new Date(insight.detectedAt).toLocaleString()}</p>
                    {insight.status === 'New' && (
                      <Button size="sm" variant="outline" className="text-[10px] border-white/10 text-white h-7 px-2"
                        onClick={() => onMarkInsightReviewed(insight.id)}>
                        <CheckSquare className="w-3 h-3 mr-1" />Mark Reviewed
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white mb-4">Analytics Reports</h3>
            {data.reports.map(report => (
              <div key={report.id} className="bg-surface rounded-xl border border-white/10 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 mr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-bold", categoryColors[report.category] || 'bg-white/5 text-gray-400 border-white/10')}>
                        {report.category}
                      </span>
                      <span className="text-[10px] bg-white/5 border border-white/10 text-gray-400 px-1.5 py-0.5 rounded">{report.format}</span>
                    </div>
                    <h4 className="text-sm font-medium text-white">{report.title}</h4>
                  </div>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0",
                    report.status === 'Ready' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    report.status === 'Generating' ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                    report.status === 'Scheduled' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    "bg-red-500/10 text-red-400 border-red-500/20"
                  )}>{report.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-[10px] text-gray-500">
                    {report.generatedAt && <span>Generated: {new Date(report.generatedAt).toLocaleString()}</span>}
                    <span>{report.recipients} recipients</span>
                  </div>
                  <div className="flex gap-2">
                    {report.status === 'Ready' && (
                      <Button size="sm" variant="outline" className="text-[10px] border-white/10 text-white h-7 px-2">
                        <Download className="w-3 h-3 mr-1" />Download
                      </Button>
                    )}
                    {(report.status === 'Scheduled' || report.status === 'Failed') && (
                      <Button size="sm" variant="outline" className="text-[10px] border-indigo-500/20 text-indigo-400 h-7 px-2"
                        onClick={() => onGenerateReport(report.id)}>
                        <RefreshCw className="w-3 h-3 mr-1" />Generate Now
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
