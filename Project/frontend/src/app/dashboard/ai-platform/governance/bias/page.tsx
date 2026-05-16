'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { useGovernanceRecords } from '@/modules/ai-platform';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { Eye, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';

export default function AiPlatformBiasPage() {
  const setPageMeta = useUIStore(s => s.setPageMeta);
  const { data: records, isLoading } = useGovernanceRecords();

  useEffect(() => {
    setPageMeta('Bias & Explainability', 'Fairness metrics, demographic bias detection, and XAI coverage across all clinical AI models');
  }, [setPageMeta]);

  if (isLoading || !records) return <div className="animate-pulse space-y-4"><Skeleton className="h-10 w-64 rounded-xl" /><Skeleton className="h-[500px] rounded-2xl" /></div>;

  const biasFlags = records.filter(r => r.complianceFlags.some(f => f.includes('BIAS')));

  return (
    <div className="space-y-5 animate-fade-in max-w-[1400px]">
      <div className="flex items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'AI Platform' }, { label: 'Governance' }, { label: 'Bias & Explainability' }]} />
        {biasFlags.length > 0
          ? <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2"><AlertTriangle className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-semibold text-amber-300">{biasFlags.length} Bias Flag(s)</span></div>
          : <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span className="text-xs font-semibold text-emerald-300">No Bias Detected</span></div>
        }
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: 'Models Audited',  v: records.length, c: 'text-fuchsia-400' },
          { l: 'Bias Flags',      v: biasFlags.length, c: biasFlags.length > 0 ? 'text-amber-400' : 'text-emerald-400' },
          { l: 'Avg Ethics Score',v: `${Math.round(records.filter(r=>r.ethicsScore>0).reduce((s,r)=>s+r.ethicsScore,0)/Math.max(records.filter(r=>r.ethicsScore>0).length,1))}`, c: 'text-indigo-400' },
          { l: 'XAI Coverage',   v: '100%', c: 'text-emerald-400' },
        ].map(k => (
          <div key={k.l} className="bg-surface-dark border border-white/[0.06] rounded-xl p-4">
            <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">{k.l}</p>
            <p className={cn('text-2xl font-black font-mono', k.c)}>{k.v}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {records.filter(r => r.ethicsScore > 0 || r.biasScore > 0).map(r => (
          <div key={r.id} className={cn('rounded-2xl border bg-surface-dark p-5', r.complianceFlags.length > 0 ? 'border-amber-500/20' : 'border-white/[0.06]')}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-white">{r.modelName}</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">{r.reviewType}</p>
              </div>
              {r.complianceFlags.map(f => (
                <span key={f} className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-md">{f.replace(/_/g,' ')}</span>
              ))}
            </div>
            <div className="space-y-2.5 mb-3">
              {[
                { label: 'Bias Score',   value: r.biasScore,   good: r.biasScore >= 80 },
                { label: 'Ethics Score', value: r.ethicsScore, good: r.ethicsScore >= 80 },
              ].map(b => (
                <div key={b.label}>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-gray-500">{b.label}</span>
                    <span className={cn('font-mono font-bold', b.good ? 'text-emerald-400' : 'text-rose-400')}>{b.value}/100</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06]">
                    <div className={cn('h-full rounded-full', b.good ? 'bg-emerald-500' : 'bg-rose-500')} style={{ width: `${b.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 bg-white/[0.03] rounded-lg px-3 py-2 leading-relaxed">{r.findings}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface-dark border border-indigo-500/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2"><Eye className="w-4 h-4 text-indigo-400" /><h3 className="text-sm font-bold text-white">Explainability Coverage (XAI)</h3><span className="ml-auto text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">SHAP + LIME Active</span></div>
        <p className="text-xs text-gray-400 leading-relaxed">All production models generate SHAP and LIME explanations per inference, ensuring clinical staff can inspect AI recommendations. Aligned with GDPR Article 22 and FDA AI/ML SaMD guidelines.</p>
      </div>
    </div>
  );
}
