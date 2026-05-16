'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ComplianceMetric } from '../types/ciso.types';
import { ShieldCheck } from 'lucide-react';

interface CompliancePanelProps {
  metrics: ComplianceMetric[];
}

export function CompliancePanel({ metrics }: CompliancePanelProps) {
  const getScoreColor = (score: number, target: number) => {
    if (score >= target) return 'text-success-light';
    if (score >= target - 5) return 'text-warning-light';
    return 'text-emergency-light';
  };

  const getBarColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-success';
      case 'at_risk': return 'bg-warning';
      case 'non_compliant': return 'bg-emergency';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-success/20 text-success-light border border-success/30';
      case 'at_risk': return 'bg-warning/20 text-warning-light border border-warning/30';
      case 'non_compliant': return 'bg-emergency/20 text-emergency-light border border-emergency/30';
      default: return 'bg-white/10 text-gray-300';
    }
  };

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-success-light" />
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Compliance Posture</h3>
          <p className="text-xs text-gray-400 mt-0.5">Regulatory framework adherence</p>
        </div>
      </CardHeader>
      
      <CardBody className="p-4 flex-1 overflow-y-auto space-y-4">
        {metrics.map((metric) => (
          <div key={metric.id} className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-white">{metric.framework}</h4>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${getStatusBadge(metric.status)}`}>
                {metric.status.replace('_', ' ')}
              </span>
            </div>
            
            <div className="flex items-end justify-between mb-2">
              <span className={`text-2xl font-black font-mono ${getScoreColor(metric.score, metric.target)}`}>
                {metric.score}%
              </span>
              <span className="text-[10px] text-gray-500 font-mono">target: {metric.target}%</span>
            </div>
            
            <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden mb-3">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${getBarColor(metric.status)}`} 
                style={{ width: `${metric.score}%` }} 
              />
            </div>
            
            <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
              <span>Violations: <span className={metric.violations > 0 ? 'text-warning-light' : 'text-gray-400'}>{metric.violations}</span></span>
              <span>Audited: {metric.lastAudit}</span>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
