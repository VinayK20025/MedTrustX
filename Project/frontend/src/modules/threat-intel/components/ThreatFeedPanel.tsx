'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Crosshair, AlertTriangle, Globe, Rss } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { ThreatIndicator, ThreatCampaign, ThreatFeed } from '../types/threat-intel.types';

interface ThreatFeedPanelProps {
  indicators: ThreatIndicator[];
  campaigns: ThreatCampaign[];
  feeds: ThreatFeed[];
  activeView: 'iocs' | 'campaigns' | 'feeds';
  onToggleView: (v: 'iocs' | 'campaigns' | 'feeds') => void;
  onSelectCampaign: (id: string) => void;
  activeCampaignId?: string;
}

const campaignStatusColors: Record<string, string> = {
  Active: 'text-red-400 bg-red-500/10 border-red-500/30',
  Emerging: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  Dormant: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
  Mitigated: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
};

const feedStatusColors: Record<string, string> = {
  Active: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  Stale: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  Error: 'text-red-400 bg-red-500/10 border-red-500/30',
  Disabled: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
};

export const ThreatFeedPanel: React.FC<ThreatFeedPanelProps> = ({ indicators, campaigns, feeds, activeView, onToggleView, onSelectCampaign, activeCampaignId }) => {
  return (
    <Card className="h-full flex flex-col border-white/[0.06] shadow-glass bg-surface-dark">
      <CardHeader
        title="Threat Intelligence"
        icon={<Crosshair className="w-4 h-4 text-red-400" />}
        action={
          <div className="flex gap-1">
            {(['iocs', 'campaigns', 'feeds'] as const).map(v => (
              <button key={v} onClick={() => onToggleView(v)} className={cn("text-[9px] px-2 py-1 rounded border transition-colors capitalize",
                activeView === v ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" : "bg-white/5 text-gray-500 border-white/10 hover:bg-white/10"
              )}>{v === 'iocs' ? 'IOCs' : v}</button>
            ))}
          </div>
        }
      />
      <CardBody className="flex-1 overflow-y-auto p-0">
        {/* IOCs */}
        {activeView === 'iocs' && (
          <div className="divide-y divide-white/[0.04]">
            {indicators.map(ioc => (
              <div key={ioc.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 mr-2">
                    <p className="text-xs font-mono text-white break-all leading-snug">{ioc.indicatorValue}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{ioc.type} · {ioc.source}</p>
                  </div>
                  <div className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 flex items-center gap-1",
                    ioc.riskScore >= 90 ? "bg-red-500/10 text-red-400 border-red-500/20" :
                    ioc.riskScore >= 70 ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                    "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  )}>
                    <AlertTriangle className="w-2.5 h-2.5" /> {ioc.riskScore}
                  </div>
                </div>
                {ioc.enrichment && (
                  <p className="text-[10px] text-indigo-300 bg-indigo-500/5 border border-indigo-500/10 rounded px-2 py-1 mb-2">{ioc.enrichment}</p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {ioc.tags.map(tag => (
                    <span key={tag} className="text-[8px] bg-red-500/5 border border-red-500/15 text-red-300 px-1.5 py-0.5 rounded">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CAMPAIGNS */}
        {activeView === 'campaigns' && (
          <div className="divide-y divide-white/[0.04]">
            {campaigns.map(cam => (
              <div
                key={cam.id}
                onClick={() => onSelectCampaign(cam.id)}
                className={cn(
                  "p-4 cursor-pointer transition-colors hover:bg-white/[0.02] border-l-2",
                  activeCampaignId === cam.id ? "bg-white/[0.04] border-l-red-500" : "border-l-transparent"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-sm font-medium text-white">{cam.campaignName}</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">Adversary: <span className="text-red-300">{cam.adversary}</span></p>
                  </div>
                  <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0", campaignStatusColors[cam.status])}>{cam.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-[10px]">
                  <div className="bg-black/20 rounded p-1.5 border border-white/5">
                    <span className="text-gray-500">IOCs: </span><span className="text-white font-bold">{cam.iocCount}</span>
                  </div>
                  <div className="bg-black/20 rounded p-1.5 border border-white/5">
                    <span className="text-gray-500">Sector: </span><span className="text-gray-300">{cam.targetSector}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {cam.ttps.slice(0, 3).map(ttp => (
                    <span key={ttp} className="text-[8px] bg-purple-500/10 border border-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono">{ttp}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FEEDS */}
        {activeView === 'feeds' && (
          <div className="divide-y divide-white/[0.04]">
            {feeds.map(feed => (
              <div key={feed.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {feed.type === 'OSINT' ? <Globe className="w-4 h-4 text-emerald-400" /> : <Rss className="w-4 h-4 text-indigo-400" />}
                    <div>
                      <h4 className="text-sm font-medium text-white">{feed.feedName}</h4>
                      <p className="text-[10px] text-gray-500">{feed.provider} · {feed.type}</p>
                    </div>
                  </div>
                  <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0", feedStatusColors[feed.status])}>{feed.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-[10px]">
                  <div className="bg-black/20 rounded p-1.5 border border-white/5">
                    <span className="text-gray-500">IOCs Ingested: </span><span className="text-white font-bold">{feed.iocIngested.toLocaleString()}</span>
                  </div>
                  <div className="bg-black/20 rounded p-1.5 border border-white/5">
                    <span className="text-gray-500">Freq: </span><span className="text-gray-300">{feed.updateFrequency}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
