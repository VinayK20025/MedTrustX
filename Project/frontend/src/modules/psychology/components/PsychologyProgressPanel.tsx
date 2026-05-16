'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface Props { metrics: { date: string; phq9: number; gad7: number; moodScore: number }[]; }

export function PsychologyProgressPanel({ metrics }: Props) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-dark border border-white/10 p-3 rounded-lg shadow-xl text-xs">
          <p className="text-white font-bold mb-2">{label}</p>
          {payload.map((e: any, i: number) => (
            <div key={i} className="flex justify-between gap-4">
              <span className="text-gray-400">{e.name}:</span>
              <span className="text-white font-bold" style={{ color: e.color }}>{e.value}</span>
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
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-500/15"><TrendingUp className="w-4 h-4 text-teal-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Clinical Progress</h3>
        </div>
      </CardHeader>

      <CardBody className="p-4 flex-1">
        <div className="flex justify-between items-center mb-6 px-2">
          <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-400"/> PHQ-9 (Depression)</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-400"/> GAD-7 (Anxiety)</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400"/> Self-Reported Mood (x2)</span>
          </div>
        </div>
        
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="phq9" name="PHQ-9 Score" stroke="#60a5fa" strokeWidth={2} dot={{ fill: '#60a5fa', r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="gad7" name="GAD-7 Score" stroke="#fb923c" strokeWidth={2} dot={{ fill: '#fb923c', r: 3 }} activeDot={{ r: 5 }} />
              {/* Scale mood for better charting visualization against standard 0-27 scales */}
              <Line type="monotone" dataKey={(d) => d.moodScore * 2} name="Mood (scaled)" stroke="#34d399" strokeWidth={2} dot={{ fill: '#34d399', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
}
