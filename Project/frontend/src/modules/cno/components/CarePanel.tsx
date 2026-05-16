'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { CareStatus } from '../types/cno.types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface CarePanelProps {
  data: CareStatus;
}

export function CarePanel({ data }: CarePanelProps) {
  const chartData = [
    { name: 'On Time', value: data.onTime, color: '#10b981' },
    { name: 'Delayed', value: data.delayed, color: '#f59e0b' },
    { name: 'Missed', value: data.missed, color: '#f43f5e' },
  ];

  const total = data.onTime + data.delayed + data.missed;

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Patient Care Status</h3>
          <p className="text-xs text-gray-400 mt-0.5">Execution of bedside care</p>
        </div>
      </CardHeader>
      
      <CardBody className="p-5 flex-1 flex flex-col md:flex-row items-center gap-6">
        <div className="w-32 h-32 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={45}
                outerRadius={60}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-white leading-none">{total}</span>
            <span className="text-[10px] text-gray-500 uppercase font-semibold">Total</span>
          </div>
        </div>

        <div className="flex-1 w-full space-y-3">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between p-2 rounded bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-300 font-medium">{item.name}</span>
              </div>
              <span className="text-sm font-bold text-white font-mono">{item.value}</span>
            </div>
          ))}
          <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-center justify-between">
            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Critical Patients</span>
            <span className="text-lg font-black text-emergency-light font-mono">{data.criticalPatients}</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
