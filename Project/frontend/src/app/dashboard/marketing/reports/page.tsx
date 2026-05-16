'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useMarketingDashboard } from '@/modules/marketing/hooks/useMarketingAnalytics';
import { FileText, Download, ArrowRight, ClipboardCheck } from 'lucide-react';

export default function MarketingReports() {
  const { data } = useMarketingDashboard({ period: '30d' });
  const d = data?.data;
  const totalSpend = (d?.campaigns ?? []).reduce((sum, campaign) => sum + campaign.spent, 0);
  const totalConversions = (d?.campaigns ?? []).reduce((sum, campaign) => sum + campaign.conversions, 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto">
      <Breadcrumbs items={[{ label: 'Marketing Command' }, { label: 'Marketing Reports' }]} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardHeader title="Board summary" subtitle="Spend, output, and ROI" icon={<FileText className="w-4 h-4" />} /><CardBody className="text-sm text-gray-300 space-y-2"><div>Total spend: ₹{(totalSpend / 100000).toFixed(1)}L</div><div>Total conversions: {totalConversions.toLocaleString()}</div></CardBody></Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardHeader title="Exports" subtitle="PDF and board decks" icon={<Download className="w-4 h-4" />} /><CardBody className="text-sm text-gray-300 space-y-2"><div>Campaign ROI deck</div><div>Channel attribution report</div><div>Funnel drop-off summary</div></CardBody></Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardHeader title="Linked surfaces" subtitle="Navigate to detailed views" icon={<ArrowRight className="w-4 h-4" />} /><CardBody className="text-sm text-gray-300 space-y-2"><a href="/dashboard/marketing/performance" className="block text-teal-400 hover:text-teal-300">Performance analytics</a><a href="/dashboard/marketing/campaigns" className="block text-teal-400 hover:text-teal-300">Campaign management</a></CardBody></Card>
      </div>

      <Card className="border-white/[0.06] shadow-glass bg-surface-light">
        <CardHeader title="Reporting package" subtitle="What leadership and operations need" icon={<ClipboardCheck className="w-4 h-4" />} />
        <CardBody className="space-y-3 text-sm text-gray-300">
          <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">Package the current 30-day dashboard into a board-ready narrative with spend, ROI, and patient acquisition results.</div>
          <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">Include funnel conversion changes and the top-performing channels for operational follow-up.</div>
          <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">This view is designed to stay aligned with the same live dashboard data used across the marketing routes.</div>
        </CardBody>
      </Card>
    </div>
  );
}
