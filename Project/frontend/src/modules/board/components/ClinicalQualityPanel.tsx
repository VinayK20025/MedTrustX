'use client';
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine } from 'recharts';
import { ChartCard } from './ChartCard';
import type { ClinicalQualityMetrics } from '../types/board.types';

interface ClinicalQualityPanelProps {
  data: ClinicalQualityMetrics;
}

export function ClinicalQualityPanel({ data }: ClinicalQualityPanelProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-dark border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-md">
          <p className="text-white font-medium mb-1">{payload[0].payload.department}</p>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs">Quality Score:</span>
            <span className="text-teal-400 font-bold">{payload[0].value}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-gray-400 text-xs">Target:</span>
            <span className="text-gray-300 font-medium">{payload[0].payload.target}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartCard title="Clinical Quality Overview" subtitle="Departmental quality scores vs targets">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data.qualityByDepartment} margin={{ top: 20, right: 0, left: -20, bottom: 0 }} barSize={32}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="department" 
            stroke="rgba(255,255,255,0.3)" 
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} 
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.3)" 
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} 
            tickLine={false}
            axisLine={false}
            domain={[80, 100]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
          <ReferenceLine y={90} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'right', value: 'Min Target', fill: '#f59e0b', fontSize: 10 }} />
          <Bar dataKey="score" radius={[4, 4, 0, 0]}>
            {data.qualityByDepartment.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.score >= entry.target ? '#14b8a6' : '#f43f5e'} 
                fillOpacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
