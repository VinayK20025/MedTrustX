'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { RiskItem } from '../types/legal-risk.types';
import { ShieldAlert, AlertTriangle, TrendingUp } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { risks: RiskItem[]; selectedId?: string; onSelect: (id: string) => void; }

const severityColor = { Critical: 'border-emergency bg-emergency/[0.05]', High: 'border-orange-500 bg-orange-500/[0.05]', Medium: 'border-warning-light bg-warning/[0.05]', Low: 'border-blue-500 bg-blue-500/[0.05]' };

export function RiskListPanel({ risks, selectedId, onSelect }: Props) {
  // Simple risk probability/impact heatmap matrix logic
  const matrix = {
    High: { High: 0, Medium: 0, Low: 0 },
    Medium: { High: 0, Medium: 0, Low: 0 },
    Low: { High: 0, Medium: 0, Low: 0 },
  };
  risks.forEach(r => matrix[r.impact][r.probability]++);

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-4 py-3">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-orange-400" /> Active Risk Intelligence
        </h3>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto flex flex-col">
        {/* Heatmap visualization */}
        <div className="p-4 border-b border-white/[0.04] bg-black/20">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
             Impact vs Probability Matrix
          </p>
          <div className="grid grid-cols-4 gap-1 text-[10px] font-mono font-bold text-center">
            <div /> <div className="text-gray-500">Prob: Low</div> <div className="text-gray-500">Prob: Med</div> <div className="text-gray-500">Prob: High</div>
            
            <div className="text-gray-500 flex items-center justify-end pr-2">Imp: High</div>
            <div className="bg-yellow-500/20 text-yellow-500 p-2 rounded">{matrix.High.Low}</div>
            <div className="bg-orange-500/20 text-orange-400 p-2 rounded">{matrix.High.Medium}</div>
            <div className="bg-emergency/30 text-emergency-light p-2 rounded animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]">{matrix.High.High}</div>

            <div className="text-gray-500 flex items-center justify-end pr-2">Imp: Med</div>
            <div className="bg-blue-500/20 text-blue-300 p-2 rounded">{matrix.Medium.Low}</div>
            <div className="bg-yellow-500/20 text-yellow-500 p-2 rounded">{matrix.Medium.Medium}</div>
            <div className="bg-orange-500/20 text-orange-400 p-2 rounded">{matrix.Medium.High}</div>

            <div className="text-gray-500 flex items-center justify-end pr-2">Imp: Low</div>
            <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded">{matrix.Low.Low}</div>
            <div className="bg-blue-500/20 text-blue-300 p-2 rounded">{matrix.Low.Medium}</div>
            <div className="bg-yellow-500/20 text-yellow-500 p-2 rounded">{matrix.Low.High}</div>
          </div>
        </div>

        {/* Risk List */}
        <div className="flex-1 divide-y divide-white/[0.03]">
          {risks.map(r => (
            <div key={r.id} onClick={() => onSelect(r.id)}
              className={cn('p-4 cursor-pointer transition-all border-l-4 group relative',
                severityColor[r.severity],
                selectedId === r.id ? 'ring-1 ring-inset ring-white/15 bg-white/[0.06]' : 'hover:bg-white/[0.04]'
              )}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-gray-500">{r.id}</span>
                <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wider',
                  r.severity === 'Critical' ? 'text-emergency-light bg-emergency/15' : 
                  r.severity === 'High' ? 'text-orange-400 bg-orange-500/15' : 'text-blue-300 bg-blue-500/15'
                )}>{r.severity}</span>
              </div>
              
              <h4 className="text-[13px] font-bold text-white mb-1.5 leading-snug pr-2">{r.title}</h4>
              
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-gray-400 uppercase bg-black/30 border border-white/10 px-1.5 py-0.5 rounded">{r.category}</span>
                <span className="text-[9px] text-gray-500">{r.department}</span>
              </div>
            </div>
          ))}
        </div>

      </CardBody>
    </Card>
  );
}
