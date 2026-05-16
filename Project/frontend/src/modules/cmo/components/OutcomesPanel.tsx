'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { OutcomesMetrics } from '../types/cmo.types';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, CartesianGrid } from 'recharts';

interface OutcomesPanelProps {
  data: OutcomesMetrics;
}

export function OutcomesPanel({ data }: OutcomesPanelProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-dark border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-md">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between items-center gap-4 text-sm mb-1">
              <span className="text-gray-400 capitalize">{entry.name}:</span>
              <span className="text-white font-semibold font-mono">
                {entry.value}%
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Outcomes Trend</h3>
          <p className="text-xs text-gray-400 mt-0.5">Mortality & Readmissions (%)</p>
        </div>
      </CardHeader>
      
      <CardBody className="p-5 flex-1 flex flex-col justify-between">
        <div className="flex-1 min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.monthlyTrend} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMortality" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorReadmission" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickLine={false} axisLine={false} dy={5} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="readmission" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorReadmission)" strokeWidth={2} />
              <Area type="monotone" dataKey="mortality" stroke="#f43f5e" fillOpacity={1} fill="url(#colorMortality)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/[0.04]">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">Complications Rate</p>
            <p className="text-xl font-bold text-white font-mono">{data.complicationsRate}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">Avg Length of Stay</p>
            <p className="text-xl font-bold text-white font-mono">{data.avgLos} days</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
