'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { CashFlowEntry } from '../types/cfo.types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';

interface CashFlowPanelProps {
  data: CashFlowEntry[];
}

export function CashFlowPanel({ data }: CashFlowPanelProps) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <h3 className="text-lg font-semibold text-white tracking-wide">Cash Flow</h3>
        <p className="text-xs text-gray-400 mt-0.5">Inflow vs Outflow (₹ in Lakhs)</p>
      </CardHeader>
      
      <CardBody className="p-4 flex-1">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '12px' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value: number) => [`₹${value}L`, '']}
            />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
            <Bar dataKey="inflow" fill="#10b981" radius={[4, 4, 0, 0]} name="Inflow" />
            <Bar dataKey="outflow" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Outflow" />
          </BarChart>
        </ResponsiveContainer>

        <div className="flex items-center justify-center gap-6 mt-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-success" />
            <span className="text-xs text-gray-400">Inflow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-emergency" />
            <span className="text-xs text-gray-400">Outflow</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
