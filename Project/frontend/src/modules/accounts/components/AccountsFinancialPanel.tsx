'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { RevenueLine, ExpenseEntry } from '../types/accounts.types';
import { TrendingUp, TrendingDown, Minus, DollarSign, AlertTriangle, Flag } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { revenue: RevenueLine[]; expenses: ExpenseEntry[]; }

const trendIcon: Record<string, React.ReactNode> = {
  up: <TrendingUp className="w-3.5 h-3.5 text-success-light" />,
  down: <TrendingDown className="w-3.5 h-3.5 text-emergency-light" />,
  flat: <Minus className="w-3.5 h-3.5 text-gray-500" />,
};

const expCatColor: Record<ExpenseEntry['category'], string> = {
  Salaries: 'bg-blue-500/15 text-blue-300',
  Equipment: 'bg-violet-500/15 text-violet-300',
  Maintenance: 'bg-amber-500/15 text-amber-300',
  Procurement: 'bg-emerald-500/15 text-emerald-300',
  Utilities: 'bg-indigo-500/15 text-indigo-300',
  Other: 'bg-gray-500/15 text-gray-300',
};

const expStatusStyle: Record<ExpenseEntry['status'], string> = {
  Approved: 'bg-success/20 text-success-light',
  Pending: 'bg-warning/20 text-warning-light',
  Flagged: 'bg-emergency/20 text-emergency-light',
};

export function AccountsFinancialPanel({ revenue, expenses }: Props) {
  const totalToday = revenue.reduce((s, r) => s + r.today, 0);
  const totalMTD = revenue.reduce((s, r) => s + r.mtd, 0);

  return (
    <Card className="border-emerald-500/25 shadow-glass bg-[#030a06] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/15"><DollarSign className="w-4 h-4 text-emerald-400" /></div>
          <h3 className="text-[15px] font-bold text-white tracking-wide">Financial Overview</h3>
        </div>
        <div className="text-right text-[10px] font-mono">
          <span className="text-gray-500">Today</span>
          <span className="text-white font-bold ml-2">₹{(totalToday / 1000).toFixed(0)}K</span>
          <span className="text-gray-600 mx-1">|</span>
          <span className="text-gray-500">MTD</span>
          <span className="text-success-light font-bold ml-2">₹{(totalMTD / 100000).toFixed(1)}L</span>
        </div>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-y-auto">
        {/* Revenue by Department */}
        <div className="p-5 border-b border-white/[0.03]">
          <h4 className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mb-3">Revenue Breakdown</h4>
          <div className="space-y-3">
            {revenue.map(r => (
              <div key={r.department} className="flex items-center gap-3">
                <span className="text-[12px] text-white font-bold w-36 shrink-0 truncate">{r.department}</span>
                <div className="flex-1 bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(r.today / totalToday) * 100}%` }} />
                </div>
                <span className="text-[10px] font-mono text-gray-400 w-16 text-right">₹{(r.today / 1000).toFixed(0)}K</span>
                <span className="shrink-0">{trendIcon[r.trend]}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Recent Expenses */}
        <div className="p-5">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Recent Expenses</h4>
          <div className="space-y-2">
            {expenses.map(e => (
              <div key={e.id} className={cn("p-3 rounded-lg border flex items-center gap-3", e.status === 'Flagged' ? "bg-emergency/[0.04] border-emergency/20" : "bg-white/[0.02] border-white/5")}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded', expCatColor[e.category])}>{e.category}</span>
                    {e.status === 'Flagged' && <Flag className="w-3 h-3 text-emergency-light" />}
                  </div>
                  <span className="text-[12px] text-white font-bold block truncate">{e.description}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[12px] text-white font-mono font-bold block">₹{e.amount.toLocaleString()}</span>
                  <span className={cn('text-[9px] font-bold', expStatusStyle[e.status])}>{e.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
