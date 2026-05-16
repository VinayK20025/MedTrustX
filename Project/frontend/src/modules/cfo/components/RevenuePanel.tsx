'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { RevenueTrend } from '../types/cfo.types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface RevenuePanelProps {
  data: RevenueTrend[];
}

export function RevenuePanel({ data }: RevenuePanelProps) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <h3 className="text-lg font-semibold text-white tracking-wide">Revenue vs Expenses vs Profit</h3>
        <p className="text-xs text-gray-400 mt-0.5">6-month trend analysis (₹ in Lakhs)</p>
      </CardHeader>
      
      <CardBody className="p-4 flex-1">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '12px' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value: number) => [`₹${value}L`, '']}
            />
            <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#gradRevenue)" name="Revenue" />
            <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} fill="url(#gradExpenses)" name="Expenses" />
            <Area type="monotone" dataKey="profit" stroke="#6366f1" strokeWidth={2} fill="url(#gradProfit)" name="Profit" />
          </AreaChart>
        </ResponsiveContainer>

        <div className="flex items-center justify-center gap-6 mt-4">
          {[
            { label: 'Revenue', color: '#10b981' },
            { label: 'Expenses', color: '#f43f5e' },
            { label: 'Profit', color: '#6366f1' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-3 h-1 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-gray-400">{item.label}</span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
