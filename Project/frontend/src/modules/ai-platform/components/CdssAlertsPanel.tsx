'use client';
import React from 'react';
import { cn } from '@/utils/cn';
import { AlertTriangle, CheckCircle2, Clock, Eye, XCircle, Siren, Stethoscope, Pill, ShieldAlert, FileText } from 'lucide-react';
import type { CdssAlert, CdssAlertSeverity, CdssAlertType } from '../types';

const SEVERITY_CONFIG: Record<CdssAlertSeverity, { color: string; pulse?: boolean }> = {
  Critical: { color: 'border-rose-500/40 bg-rose-500/5 text-rose-300',    pulse: true },
  High:     { color: 'border-amber-500/40 bg-amber-500/5 text-amber-300', pulse: false },
  Medium:   { color: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-300', pulse: false },
  Low:      { color: 'border-white/[0.06] bg-white/[0.02] text-gray-400',  pulse: false },
};

const TYPE_ICON: Record<CdssAlertType, React.ElementType> = {
  'Drug Interaction':       Pill,
  'Clinical Warning':       AlertTriangle,
  'Diagnostic Suggestion':  Stethoscope,
  'Protocol Deviation':     ShieldAlert,
  'Risk Score':             FileText,
};

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

interface Props {
  alerts: CdssAlert[];
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}

export const CdssAlertsPanel: React.FC<Props> = ({ alerts, onAcknowledge, onResolve }) => {
  const active = alerts.filter(a => a.status === 'Active');
  const acked  = alerts.filter(a => a.status === 'Acknowledged');

  return (
    <div className="h-full flex flex-col bg-surface-dark border border-white/[0.06] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10">
            <Siren className="w-4 h-4 text-rose-400" />
          </div>
          <h3 className="text-sm font-bold text-white">CDSS Alerts</h3>
          {active.length > 0 && (
            <span className="ml-auto flex items-center gap-1 text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              {active.length} Active
            </span>
          )}
        </div>
        <div className="flex gap-3 mt-2 text-[10px] text-gray-500">
          <span className="text-rose-400 font-semibold">{alerts.filter(a => a.severity === 'Critical' && a.status === 'Active').length} Critical</span>
          <span className="text-amber-400 font-semibold">{alerts.filter(a => a.severity === 'High' && a.status === 'Active').length} High</span>
          <span className="text-gray-400">{acked.length} Acknowledged</span>
        </div>
      </div>

      {/* Alert List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04] p-2 space-y-1.5">
        {alerts.map(alert => {
          const sev = SEVERITY_CONFIG[alert.severity];
          const TypeIcon = TYPE_ICON[alert.alertType];
          const isActive = alert.status === 'Active';
          const isAcked = alert.status === 'Acknowledged';

          return (
            <div
              key={alert.id}
              className={cn(
                'rounded-xl border p-3 transition-all duration-200',
                sev.color,
                alert.status === 'Resolved' && 'opacity-50',
              )}
            >
              {/* Alert header */}
              <div className="flex items-start gap-2 mb-1.5">
                <div className={cn('p-1 rounded-md flex-shrink-0', 
                  alert.severity === 'Critical' ? 'bg-rose-500/20' : 
                  alert.severity === 'High' ? 'bg-amber-500/20' : 'bg-yellow-500/10'
                )}>
                  <TypeIcon className="w-3 h-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">{alert.alertType}</span>
                    <span className="text-[9px] px-1.5 rounded bg-white/[0.06] text-gray-400">{alert.severity}</span>
                    {sev.pulse && isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                    )}
                    <span className="ml-auto text-[9px] text-gray-500">{formatTimeAgo(alert.triggeredAt)}</span>
                  </div>
                  <p className="text-[10px] font-semibold text-white mt-0.5">
                    {alert.patientName} <span className="text-gray-500">— {alert.ward}</span>
                  </p>
                </div>
              </div>

              {/* Message */}
              <p className="text-[11px] text-gray-300 leading-relaxed mb-1.5">{alert.message}</p>

              {/* Recommendation */}
              <div className="bg-white/[0.03] rounded-lg px-2.5 py-1.5 mb-2">
                <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Recommendation</p>
                <p className="text-[10px] text-gray-300">{alert.recommendation}</p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-gray-600 font-mono">
                    {alert.generatedBy} · {alert.confidenceScore.toFixed(1)}% confidence
                  </span>
                </div>
                <div className="flex gap-1">
                  {isActive && (
                    <>
                      <button
                        onClick={() => onAcknowledge(alert.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/10 text-amber-400 text-[9px] font-semibold hover:bg-amber-500/20 transition-colors border border-amber-500/20"
                      >
                        <Eye className="w-2.5 h-2.5" /> Acknowledge
                      </button>
                      <button
                        onClick={() => onResolve(alert.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[9px] font-semibold hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
                      >
                        <CheckCircle2 className="w-2.5 h-2.5" /> Resolve
                      </button>
                    </>
                  )}
                  {isAcked && (
                    <button
                      onClick={() => onResolve(alert.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[9px] font-semibold hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
                    >
                      <CheckCircle2 className="w-2.5 h-2.5" /> Resolve
                    </button>
                  )}
                  {alert.status === 'Resolved' && (
                    <span className="flex items-center gap-1 text-[9px] text-emerald-500">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Resolved
                    </span>
                  )}
                  {alert.status === 'Dismissed' && (
                    <span className="flex items-center gap-1 text-[9px] text-gray-500">
                      <XCircle className="w-2.5 h-2.5" /> Dismissed
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-600">
            <CheckCircle2 className="w-8 h-8 mb-2 text-emerald-600 opacity-50" />
            <p className="text-xs">No active CDSS alerts</p>
          </div>
        )}
      </div>
    </div>
  );
};
