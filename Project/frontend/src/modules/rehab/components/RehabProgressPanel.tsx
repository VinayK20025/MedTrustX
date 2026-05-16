'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { metrics: { date: string; mobility: number; pain: number; independence: number }[]; }

export function RehabProgressPanel({ metrics }: Props) {
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
          <h3 className="text-[15px] font-bold text-white tracking-wide">Progress Tracking</h3>
        </div>
      </CardHeader>

      <CardBody className="p-4 flex-1">
        <div className="flex justify-between items-center mb-6 px-2">
          <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-teal-400"/> Mobility</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emergency-light"/> Pain (x10)</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-400"/> Independence</span>
          </div>
        </div>
        
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="mobility" name="Mobility" stroke="#2dd4bf" strokeWidth={2} dot={{ fill: '#2dd4bf', r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="independence" name="Independence" stroke="#818cf8" strokeWidth={2} dot={{ fill: '#818cf8', r: 3 }} activeDot={{ r: 5 }} />
              {/* Scale pain by 10 for better visualization on the same axis */}
              <Line type="monotone" dataKey={(d) => d.pain * 10} name="Pain" stroke="#f87171" strokeWidth={2} dot={{ fill: '#f87171', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
}
