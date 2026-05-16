'use client';
import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ChartCard } from './ChartCard';
import type { FinancialMetrics } from '../types/board.types';

interface FinancialPanelProps {
  data: FinancialMetrics;
}

export function FinancialPanel({ data }: FinancialPanelProps) {
  // Custom tooltip for premium look
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-dark border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-gray-300 mb-2 font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-3 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-400 text-sm">{entry.name}:</span>
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
    <ChartCard title="Financial Performance" subtitle="Revenue vs Operating Costs vs Profit (Trailing 6 Months)">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data.monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorCosts" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="month" 
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
            tickFormatter={(value) => new Intl.NumberFormat('en-IN', { notation: 'compact' }).format(value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
          <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
          <Area type="monotone" dataKey="costs" name="Operating Costs" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorCosts)" />
          <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
