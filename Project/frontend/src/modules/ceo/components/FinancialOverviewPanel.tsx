'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { FinancialOverview } from '../types/ceo.types';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

interface FinancialOverviewPanelProps {
  data?: FinancialOverview;
}

const DEFAULT_FIN: FinancialOverview = {
  revenueToday: 0, revenueVsTarget: 0, operationalCosts: 0,
  pendingApprovalsValue: 0, monthlyTrend: [],
};

export function FinancialOverviewPanel({ data }: FinancialOverviewPanelProps) {
  const f = data ?? DEFAULT_FIN;
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-dark border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-md">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between items-center gap-4 text-sm mb-1">
              <span className="text-gray-400">{entry.name}:</span>
              <span className="text-white font-semibold">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(entry.value)}
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
          <h3 className="text-lg font-semibold text-white tracking-wide">Financial Pulse</h3>
          <p className="text-xs text-gray-400 mt-0.5">Revenue tracking vs costs</p>
        </div>
      </CardHeader>
      
      <CardBody className="p-5 flex-1 flex flex-col justify-between">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Revenue vs Target</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold text-white">{f.revenueVsTarget}%</p>
              <span className="text-xs text-success-light bg-success/10 px-1.5 py-0.5 rounded mb-1">On Track</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Pending Approvals</p>
            <p className="text-2xl font-bold text-white">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(f.pendingApprovalsValue)}
            </p>
          </div>
        </div>

        <div className="flex-1 min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={f.monthlyTrend} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickLine={false} axisLine={false} dy={5} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {(f.monthlyTrend ?? []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#14b8a6" fillOpacity={0.8} />
                ))}
              </Bar>
              <Line type="monotone" dataKey="costs" name="Costs" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3, fill: '#f43f5e', strokeWidth: 0 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
}
