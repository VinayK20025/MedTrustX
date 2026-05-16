'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { ChannelMetric } from '../types/marketing.types';
import { Share2, TrendingUp, TrendingDown } from 'lucide-react';

interface Props { channels: ChannelMetric[]; }

export function ChannelPanel({ channels }: Props) {
  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <Share2 className="w-5 h-5 text-indigo-400" />
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Channel Performance</h3>
          <p className="text-xs text-gray-400 mt-0.5">ROI & CPA by acquisition channel</p>
        </div>
      </CardHeader>
      <CardBody className="p-0 flex-1 overflow-x-auto">
        <table className="w-full text-sm text-left min-w-[600px]">
          <thead className="text-[10px] text-gray-500 uppercase bg-white/[0.02] border-b border-white/[0.04]">
            <tr>
              <th className="px-4 py-3 font-medium">Channel</th>
              <th className="px-4 py-3 font-medium text-right">Leads</th>
              <th className="px-4 py-3 font-medium text-right">Conv.</th>
              <th className="px-4 py-3 font-medium text-right">CPA</th>
              <th className="px-4 py-3 font-medium text-right">ROI</th>
              <th className="px-4 py-3 font-medium text-right">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {channels.map(ch => (
              <tr key={ch.channel} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 text-gray-200 font-semibold text-xs">{ch.channel}</td>
                <td className="px-4 py-3 text-right text-xs text-gray-300 font-mono">{ch.leads}</td>
                <td className="px-4 py-3 text-right text-xs text-success-light font-bold font-mono">{ch.conversions}</td>
                <td className={`px-4 py-3 text-right text-xs font-mono ${ch.cpa > 1500 ? 'text-emergency-light' : ch.cpa > 800 ? 'text-warning-light' : 'text-success-light'}`}>₹{ch.cpa}</td>
                <td className={`px-4 py-3 text-right text-xs font-bold font-mono ${ch.roi >= 4 ? 'text-success-light' : ch.roi >= 2 ? 'text-warning-light' : 'text-emergency-light'}`}>{ch.roi}x</td>
                <td className="px-4 py-3 text-right">
                  <div className={`flex items-center justify-end gap-1 text-xs font-bold ${ch.trend >= 0 ? 'text-success-light' : 'text-emergency-light'}`}>
                    {ch.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {ch.trend >= 0 ? '+' : ''}{ch.trend}%
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}
