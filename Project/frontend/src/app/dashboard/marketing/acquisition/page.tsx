'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useMarketingDashboard } from '@/modules/marketing/hooks/useMarketingAnalytics';
import { Users, Target, ExternalLink } from 'lucide-react';

export default function PatientAcquisition() {
  const { data } = useMarketingDashboard({ period: '30d' });
  const campaigns = data?.data?.campaigns ?? [];
  const totalConversions = campaigns.reduce((sum, campaign) => sum + campaign.conversions, 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto">
      <Breadcrumbs items={[{ label: 'Marketing Command' }, { label: 'Patient Acquisition' }]} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardHeader title="Attributed conversions" subtitle="Campaign-generated patient outcomes" icon={<Users className="w-4 h-4" />} /><CardBody className="text-3xl font-black text-white">{totalConversions.toLocaleString()}</CardBody></Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardHeader title="High-intent campaigns" subtitle="Programs with 300+ conversions" icon={<Target className="w-4 h-4" />} /><CardBody className="text-3xl font-black text-success-light">{campaigns.filter((campaign) => campaign.conversions >= 300).length}</CardBody></Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardHeader title="Route links" subtitle="Move into funnel or performance views" icon={<ExternalLink className="w-4 h-4" />} /><CardBody className="text-sm text-gray-300 space-y-2"><a href="/dashboard/marketing/funnel" className="block text-teal-400 hover:text-teal-300">Funnel analysis</a><a href="/dashboard/marketing/performance" className="block text-teal-400 hover:text-teal-300">Campaign performance</a></CardBody></Card>
      </div>

      <Card className="border-white/[0.06] shadow-glass bg-surface-light">
        <CardHeader title="Acquisition programs" subtitle="Lead source, conversion output, and patient journey readiness" icon={<Users className="w-4 h-4" />} />
        <CardBody className="space-y-3">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="rounded-xl border border-white/[0.06] bg-black/20 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{campaign.name}</p>
                <p className="text-xs text-gray-500 mt-1">{campaign.channel} · {campaign.status} · Started {campaign.startDate}</p>
              </div>
              <div className="text-sm text-gray-300">
                <span className="text-success-light font-semibold">{campaign.conversions}</span> conversions · CPA ₹{campaign.cpa} · ROI {campaign.roi}x
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
