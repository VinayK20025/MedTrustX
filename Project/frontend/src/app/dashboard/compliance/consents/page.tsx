'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useComplianceDashboard, useUpdateConsentRecord } from '@/modules/compliance/hooks/useComplianceAnalytics';
import { CheckCircle2, AlertTriangle, FileText, Calendar } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function ConsentsPage() {
  const { data } = useComplianceDashboard({});
  const { mutate: updateConsent, isPending } = useUpdateConsentRecord();
  const consents = data?.data?.consents ?? [];
  const consented = consents.filter(c => c.status === 'Consented').length;
  const pending = consents.filter(c => c.status === 'Pending').length;
  const withdrawn = consents.filter(c => c.status === 'Withdrawn').length;

  return (
    <div className="space-y-6 animate-fade-in max-w-[1400px] mx-auto">
      <Breadcrumbs items={[{ label: 'Compliance' }, { label: 'Patient Consents' }]} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Consented" subtitle="Valid authorizations" icon={<CheckCircle2 className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-success-light">{consented}</CardBody>
        </Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Pending" subtitle="Awaiting signature" icon={<AlertTriangle className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-warning-light">{pending}</CardBody>
        </Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Withdrawn" subtitle="Authorization revoked" icon={<AlertTriangle className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-orange-400">{withdrawn}</CardBody>
        </Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Total Records" subtitle="All consents tracked" icon={<FileText className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-white">{consents.length}</CardBody>
        </Card>
      </div>

      <Card className="border-white/[0.06] shadow-glass bg-surface-light">
        <CardHeader title="Patient Consent Records" subtitle="Treatment, surgery, research, and data sharing authorizations" icon={<CheckCircle2 className="w-4 h-4" />} />
        <CardBody className="space-y-3">
          {consents.map(consent => {
            const daysUntilExpiry = consent.expiryDate ? Math.ceil((new Date(consent.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
            return (
              <div key={consent.id} className={cn('rounded-xl border p-4 space-y-3', consent.status === 'Consented' ? 'border-white/[0.06] bg-black/20' : consent.status === 'Pending' ? 'border-warning/30 bg-warning/[0.05]' : 'border-white/10 bg-white/[0.02]')}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">Consent Type: <span className="capitalize">{consent.consentType.replace('-', ' ')}</span></p>
                    <p className="text-xs text-gray-500 mt-1">Patient: {consent.patientId || 'N/A'} • {consent.department}</p>
                  </div>
                  <span className={cn('text-[10px] font-bold px-2 py-1 rounded uppercase shrink-0',
                    consent.status === 'Consented' ? 'text-success-light bg-success/10' : consent.status === 'Pending' ? 'text-warning-light bg-warning/10 animate-pulse' : 'text-orange-400 bg-orange-500/10'
                  )}>{consent.status}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-gray-400">
                  <div><span className="block uppercase tracking-widest mb-0.5 text-gray-500">Obtained By</span><span className="text-gray-200">{consent.obtainedBy}</span></div>
                  {consent.obtainedDate && (
                    <div><span className="block uppercase tracking-widest mb-0.5 text-gray-500">Obtained Date</span><span className="text-gray-200">{new Date(consent.obtainedDate).toLocaleDateString()}</span></div>
                  )}
                  {consent.expiryDate && (
                    <div><span className="block uppercase tracking-widest mb-0.5 text-gray-500">Expiry</span><span className={cn('text-gray-200', daysUntilExpiry && daysUntilExpiry < 30 ? 'text-warning-light' : daysUntilExpiry && daysUntilExpiry < 0 ? 'text-emergency-light' : '')}>{daysUntilExpiry && daysUntilExpiry > 0 ? `${daysUntilExpiry}d` : 'Expired'}</span></div>
                  )}
                </div>
                {consent.witnessName && (
                  <div className="bg-black/30 rounded-lg p-3 border border-white/5 text-xs text-gray-400">
                    <p className="uppercase tracking-widest text-gray-500 mb-1">Witness</p>
                    <p className="text-gray-200">{consent.witnessName}</p>
                  </div>
                )}
                {consent.notes && (
                  <div className="bg-black/30 rounded-lg p-3 border border-white/5 text-xs text-gray-400">
                    <p className="uppercase tracking-widest text-gray-500 mb-1">Notes</p>
                    <p className="text-gray-200">{consent.notes}</p>
                  </div>
                )}
                {consent.status === 'Pending' && (
                  <Button size="sm" onClick={() => updateConsent({ consentId: consent.id, payload: { status: 'Consented' } })} disabled={isPending}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Consented
                  </Button>
                )}
              </div>
            );
          })}
        </CardBody>
      </Card>
    </div>
  );
}
