'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useMarketingDashboard } from '@/modules/marketing/hooks/useMarketingAnalytics';
import { Share2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function ChannelPerformance() {
  const { data } = useMarketingDashboard({ period: '30d' });
  const channels = data?.data?.channels ?? [];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto">
      <Breadcrumbs items={[{ label: 'Marketing Command' }, { label: 'Channel Performance' }]} />

      <Card className="border-white/[0.06] shadow-glass bg-surface-light">
        <CardHeader title="Acquisition channels" subtitle="ROI, CPA, conversion output and directional trend" icon={<Share2 className="w-4 h-4" />} />
        <CardBody className="p-0 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="text-[10px] text-gray-500 uppercase bg-white/[0.02] border-b border-white/[0.04]">
              <tr>
                <th className="px-4 py-3 font-medium text-left">Channel</th>
                <th className="px-4 py-3 font-medium text-right">Leads</th>
                <th className="px-4 py-3 font-medium text-right">Conversions</th>
                <th className="px-4 py-3 font-medium text-right">Spend</th>
                <th className="px-4 py-3 font-medium text-right">CPA</th>
                <th className="px-4 py-3 font-medium text-right">ROI</th>
                <th className="px-4 py-3 font-medium text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {channels.map((channel) => (
                <tr key={channel.channel} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-gray-200 font-semibold text-xs">{channel.channel}</td>
                  <td className="px-4 py-3 text-right text-xs text-gray-300 font-mono">{channel.leads}</td>
                  <td className="px-4 py-3 text-right text-xs text-success-light font-bold font-mono">{channel.conversions}</td>
                  <td className="px-4 py-3 text-right text-xs text-gray-300 font-mono">₹{channel.spend.toLocaleString()}</td>
                  <td className={`px-4 py-3 text-right text-xs font-mono ${channel.cpa > 1500 ? 'text-emergency-light' : channel.cpa > 800 ? 'text-warning-light' : 'text-success-light'}`}>₹{channel.cpa}</td>
                  <td className={`px-4 py-3 text-right text-xs font-bold font-mono ${channel.roi >= 4 ? 'text-success-light' : channel.roi >= 2 ? 'text-warning-light' : 'text-emergency-light'}`}>{channel.roi}x</td>
                  <td className="px-4 py-3 text-right">
                    <div className={`inline-flex items-center justify-end gap-1 text-xs font-bold ${channel.trend >= 0 ? 'text-success-light' : 'text-emergency-light'}`}>
                      {channel.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {channel.trend >= 0 ? '+' : ''}{channel.trend}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardHeader title="Channel mix" subtitle="Highest lead volume vs efficiency" icon={<DollarSign className="w-4 h-4" />} /><CardBody className="text-sm text-gray-300">Compare this view with campaign performance to decide where to shift budget next.</CardBody></Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardHeader title="Budget discipline" subtitle="Spend pacing and CPA" icon={<DollarSign className="w-4 h-4" />} /><CardBody className="text-sm text-gray-300">Offline spend remains the highest CPA channel, while email is the strongest efficiency channel in the current mock data set.</CardBody></Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardHeader title="Route links" subtitle="Cross-navigation into funnel and reports" icon={<Share2 className="w-4 h-4" />} /><CardBody className="text-sm text-gray-300 space-y-2"><a href="/dashboard/marketing/funnel" className="block text-teal-400 hover:text-teal-300">Open lead funnel</a><a href="/dashboard/marketing/reports" className="block text-teal-400 hover:text-teal-300">Open reports</a></CardBody></Card>
      </div>
    </div>
  );
}
