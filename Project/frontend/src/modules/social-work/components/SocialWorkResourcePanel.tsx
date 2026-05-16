'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { SocialWorkSupportPlan, CommunityResource } from '../types/socialWork.types';
import { Network, ExternalLink } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { plan?: SocialWorkSupportPlan; directory: CommunityResource[]; }

export function SocialWorkResourcePanel({ plan, directory }: Props) {
  if (!plan) return null;

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-emerald-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-emerald-400">COMMUNITY RESOURCES</h3>
        </div>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto">
        <div className="p-4 bg-black/20 border-b border-white/5">
          <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Active Interventions</h4>
          <div className="space-y-2">
            {plan.interventions.map(int => (
               <div key={int.id} className="text-[12px] text-white flex items-center gap-2">
                 <div className={cn("w-2 h-2 rounded-full", int.status === 'In Progress' ? 'bg-warning-500 animate-pulse' : 'bg-gray-500')} />
                 {int.description}
               </div>
            ))}
          </div>
        </div>

        <div className="p-4">
          <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Resource Directory Matches</h4>
          <div className="space-y-3">
            {directory.map(res => (
              <div key={res.id} className="p-3 border border-white/[0.06] rounded-xl bg-surface-dark hover:bg-white/[0.02] transition-colors">
                <div className="flex justify-between items-start mb-1">
                   <h5 className="text-[13px] font-bold text-white">{res.name}</h5>
                   <span className={cn("text-[9px] uppercase font-bold px-1.5 py-0.5 rounded", 
                      res.status === 'Available' ? 'bg-success/10 text-success-light' : 'bg-warning/10 text-warning-light'
                   )}>{res.status}</span>
                </div>
                <span className="text-[10px] text-emerald-400 block mb-2">{res.type}</span>
                <p className="text-[11px] text-gray-400 mb-3">{res.description}</p>
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-mono text-gray-500 truncate w-32">{res.contactInfo}</span>
                   <Button size="sm" className="h-7 text-[10px] bg-white/5 hover:bg-white/10" rightIcon={<ExternalLink className="w-3 h-3"/>}>Match</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
