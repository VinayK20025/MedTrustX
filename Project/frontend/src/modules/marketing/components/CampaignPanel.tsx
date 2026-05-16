'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Campaign } from '../types/marketing.types';
import { Megaphone, Pause } from 'lucide-react';
import { usePauseCampaign } from '../hooks/useMarketingAnalytics';

interface Props { campaigns: Campaign[]; }

const statusStyle: Record<string, string> = {
  active:    'bg-success/20 text-success-light border border-success/30',
  paused:    'bg-warning/20 text-warning-light border border-warning/30',
  completed: 'bg-white/10 text-gray-300 border border-white/20',
  draft:     'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
};

const channelLabel: Record<string, string> = {
  google_ads: 'Google Ads', meta: 'Meta', email: 'Email', sms: 'SMS', offline: 'Offline', referral: 'Referral',
};

export function CampaignPanel({ campaigns }: Props) {
  const { mutate: pause, isPending } = usePauseCampaign();

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center gap-2">
        <Megaphone className="w-5 h-5 text-indigo-400" />
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Campaign Performance</h3>
          <p className="text-xs text-gray-400 mt-0.5">{campaigns.filter(c => c.status === 'active').length} active campaigns</p>
        </div>
      </CardHeader>
      <CardBody className="p-4 flex-1 overflow-y-auto space-y-3 max-h-[420px]">
        {campaigns.map(c => {
          const spendPct = Math.round((c.spent / c.budget) * 100);
          return (
            <div key={c.id} className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:border-white/[0.08] transition-colors group">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${statusStyle[c.status]}`}>{c.status}</span>
                  <span className="text-[10px] text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded">{channelLabel[c.channel]}</span>
                </div>
                <span className={`text-sm font-black font-mono ${c.roi >= 4 ? 'text-success-light' : c.roi >= 2 ? 'text-warning-light' : 'text-emergency-light'}`}>{c.roi}x ROI</span>
              </div>
              <h4 className="text-sm font-semibold text-white mb-2">{c.name}</h4>
              <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden mb-2">
                <div className={`h-full rounded-full ${spendPct > 80 ? 'bg-emergency' : spendPct > 50 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${spendPct}%` }} />
              </div>
              <div className="grid grid-cols-4 gap-2 text-[10px] text-gray-500 font-mono">
                <div><span className="block">Spend</span><span className="text-gray-300">₹{(c.spent / 1000).toFixed(0)}K/{(c.budget / 1000).toFixed(0)}K</span></div>
                <div><span className="block">Clicks</span><span className="text-gray-300">{c.clicks.toLocaleString()}</span></div>
                <div><span className="block">Conv.</span><span className="text-success-light font-bold">{c.conversions}</span></div>
                <div><span className="block">CPA</span><span className={c.cpa > 1000 ? 'text-warning-light' : 'text-gray-300'}>₹{c.cpa}</span></div>
              </div>
              {c.status === 'active' && (
                <Button variant="outline" size="sm" className="mt-2 text-xs h-7 gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => pause(c.id)} disabled={isPending}>
                  <Pause className="w-3 h-3" /> Pause
                </Button>
              )}
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
