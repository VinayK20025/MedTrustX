'use client';
import React from 'react';
import { cn } from '@/utils/cn';
import { Scale, FileSearch, CheckCircle2, Clock, AlertTriangle, XCircle, Shield, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { GovernanceRecord } from '../types';

const STATUS_CFG: Record<string, { color: string; icon: React.ElementType }> = {
  'Approved':     { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
  'Pending':      { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',       icon: Clock        },
  'Under Review': { color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',    icon: FileSearch   },
  'Rejected':     { color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',          icon: XCircle      },
};

interface Props {
  records: GovernanceRecord[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const GovernancePanel: React.FC<Props> = ({ records, onApprove, onReject }) => {
  const pending = records.filter(r => r.status === 'Pending' || r.status === 'Under Review');

  return (
    <div className="h-full flex flex-col bg-surface-dark border border-white/[0.06] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-fuchsia-500/10">
            <Scale className="w-4 h-4 text-fuchsia-400" />
          </div>
          <h3 className="text-sm font-bold text-white">AI Governance</h3>
          {pending.length > 0 && (
            <span className="ml-auto flex items-center gap-1 text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full">
              <Clock className="w-3 h-3" /> {pending.length} Pending Review
            </span>
          )}
        </div>
        <p className="text-[10px] text-gray-500 mt-1">
          Ethics board approvals, bias audits, and compliance oversight
        </p>
      </div>

      {/* Records */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04] p-2 space-y-1.5">
        {records.map(rec => {
          const cfg = STATUS_CFG[rec.status];
          const Icon = cfg.icon;
          const needsAction = rec.status === 'Pending' || rec.status === 'Under Review';
          const hasFlags = rec.complianceFlags.length > 0;

          return (
            <div
              key={rec.id}
              className={cn(
                'rounded-xl border bg-surface-light p-3 transition-all duration-200',
                hasFlags ? 'border-amber-500/20' : 'border-white/[0.06]',
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-xs font-semibold text-white">{rec.modelName}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{rec.reviewType}</p>
                </div>
                <span className={cn('flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md border flex-shrink-0', cfg.color)}>
                  <Icon className="w-2.5 h-2.5" /> {rec.status}
                </span>
              </div>

              {/* Scores */}
              {rec.ethicsScore > 0 && (
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  <div className="bg-white/[0.03] rounded-lg px-2 py-1.5">
                    <div className="flex justify-between text-[9px] mb-1">
                      <span className="text-gray-500">Ethics Score</span>
                      <span className={cn('font-mono font-bold', rec.ethicsScore >= 80 ? 'text-emerald-400' : 'text-amber-400')}>
                        {rec.ethicsScore}/100
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-white/[0.06]">
                      <div className={cn('h-full rounded-full', rec.ethicsScore >= 80 ? 'bg-emerald-500' : 'bg-amber-500')}
                        style={{ width: `${rec.ethicsScore}%` }} />
                    </div>
                  </div>
                  <div className="bg-white/[0.03] rounded-lg px-2 py-1.5">
                    <div className="flex justify-between text-[9px] mb-1">
                      <span className="text-gray-500">Bias Score</span>
                      <span className={cn('font-mono font-bold', rec.biasScore >= 80 ? 'text-emerald-400' : 'text-rose-400')}>
                        {rec.biasScore}/100
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-white/[0.06]">
                      <div className={cn('h-full rounded-full', rec.biasScore >= 80 ? 'bg-emerald-500' : 'bg-rose-500')}
                        style={{ width: `${rec.biasScore}%` }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Compliance Flags */}
              {hasFlags && (
                <div className="flex gap-1 flex-wrap mb-2">
                  {rec.complianceFlags.map(flag => (
                    <span key={flag} className="flex items-center gap-1 text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-md">
                      <AlertTriangle className="w-2.5 h-2.5" /> {flag.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              )}

              {/* Findings */}
              <p className="text-[10px] text-gray-400 bg-white/[0.02] rounded-lg px-2.5 py-2 mb-2 leading-relaxed">
                {rec.findings}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between gap-2">
                <div className="text-[9px] text-gray-600">
                  <Shield className="w-3 h-3 inline mr-1" />
                  {rec.reviewedBy} · Expires {rec.expiresAt}
                </div>
                {needsAction && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => onReject(rec.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-rose-500/10 text-rose-400 text-[9px] font-semibold hover:bg-rose-500/20 transition-colors border border-rose-500/20"
                    >
                      <ThumbsDown className="w-2.5 h-2.5" /> Reject
                    </button>
                    <button
                      onClick={() => onApprove(rec.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[9px] font-semibold hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
                    >
                      <ThumbsUp className="w-2.5 h-2.5" /> Approve
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
