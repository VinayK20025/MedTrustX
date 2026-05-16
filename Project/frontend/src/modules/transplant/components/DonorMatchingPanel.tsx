'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Network, Activity, FileCheck } from 'lucide-react';
import type { MatchResult } from '../types/transplant.types';
import { cn } from '@/utils/cn';

export function DonorMatchingPanel({ matches }: { matches: MatchResult[] }) {
  return (
    <Card className="h-full border-white/[0.06] bg-surface-dark/50 backdrop-blur-md">
      <CardHeader 
        className="pb-4"
        title="Donor-Recipient Matching"
        subtitle="HLA & Compatibility Analytics"
        icon={<Network className="w-5 h-5" />}
        action={
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20">
            {matches.length} Pending
          </Badge>
        }
      />
      <CardBody className="p-4 space-y-4 overflow-y-auto max-h-[calc(100%-80px)] custom-scrollbar">
        {matches.map((match) => (
          <div key={match.id} className="border border-white/[0.06] rounded-xl p-4 hover:border-emerald-500/30 transition-colors bg-white/[0.01]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">{match.id}</span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" /> Virtual Crossmatch
                </span>
              </div>
              <Badge variant={match.status === 'Accepted' ? 'success' : 'warning'}>
                {match.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-light rounded-lg p-3 border border-white/[0.04]">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Recipient ID</p>
                <p className="text-sm font-medium text-white">{match.patientId}</p>
              </div>
              <div className="bg-surface-light rounded-lg p-3 border border-white/[0.04]">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Donor ID</p>
                <p className="text-sm font-medium text-white">{match.donorId}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase">Compatibility Score</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full", match.compatibilityScore >= 90 ? 'bg-emerald-500' : 'bg-warning')}
                      style={{ width: `${match.compatibilityScore}%` }}
                    />
                  </div>
                  <span className={cn("text-xs font-bold", match.compatibilityScore >= 90 ? 'text-emerald-400' : 'text-warning-light')}>
                    {match.compatibilityScore}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase">Crossmatch</p>
                  <p className={cn("text-xs font-bold", match.crossmatchStatus === 'Negative' ? 'text-emerald-400' : 'text-warning-light')}>
                    {match.crossmatchStatus}
                  </p>
                </div>
                <button className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-emerald-500/20 border border-white/[0.1] hover:border-emerald-500/50 flex items-center justify-center transition-all text-white hover:text-emerald-400">
                  <FileCheck className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
