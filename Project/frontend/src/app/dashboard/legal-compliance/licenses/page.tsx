'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLegalComplianceDashboard, useInitiateLicenseRenewal } from '@/modules/legal-compliance/hooks/useLegalComplianceAnalytics';
import { BookOpenCheck, AlertTriangle, CheckCircle2, RefreshCw, Calendar, FileText } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function LicensesPage() {
  const { data } = useLegalComplianceDashboard({});
  const { mutate: initiateRenewal, isPending } = useInitiateLicenseRenewal();
  const licenses = data?.data?.licenses ?? [];
  const active = licenses.filter(l => l.status === 'Active').length;
  const expiring = licenses.filter(l => l.status === 'Expiring Soon').length;
  const expired = licenses.filter(l => l.status === 'Expired').length;

  return (
    <div className="space-y-6 animate-fade-in max-w-[1400px] mx-auto">
      <Breadcrumbs items={[{ label: 'Legal Compliance' }, { label: 'Hospital Licenses' }]} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Active licenses" subtitle="Current and valid" icon={<CheckCircle2 className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-success-light">{active}</CardBody>
        </Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Expiring soon" subtitle="Action required <30d" icon={<AlertTriangle className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-warning-light">{expiring}</CardBody>
        </Card>
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Expired" subtitle="Renewal overdue" icon={<AlertTriangle className="w-4 h-4" />} />
          <CardBody className="text-3xl font-black text-emergency-light">{expired}</CardBody>
        </Card>
      </div>

      <Card className="border-white/[0.06] shadow-glass bg-surface-light">
        <CardHeader title="License portfolio" subtitle="Statutory registrations and renewal tracking" icon={<BookOpenCheck className="w-4 h-4" />} />
        <CardBody className="space-y-3">
          {licenses.map(license => {
            const daysToExpiry = Math.ceil((new Date(license.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return (
              <div key={license.id} className={cn('rounded-xl border p-4 space-y-3', license.status === 'Active' ? 'border-white/[0.06] bg-black/20' : license.status === 'Expiring Soon' ? 'border-warning/30 bg-warning/[0.05]' : 'border-emergency/30 bg-emergency/[0.05]')}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-semibold text-white">{license.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{license.type}</p>
                  </div>
                  <span className={cn('text-[10px] font-bold px-2 py-1 rounded uppercase',
                    license.status === 'Active' ? 'text-success-light bg-success/10' : license.status === 'Expiring Soon' ? 'text-warning-light bg-warning/10' : 'text-emergency-light bg-emergency/10 animate-pulse'
                  )}>{license.status}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-400">
                  <div><span className="block uppercase tracking-widest">Expires</span><span className="text-gray-200 font-semibold">{new Date(license.expiryDate).toLocaleDateString()}</span></div>
                  <div><span className="block uppercase tracking-widest">Days left</span><span className={cn('font-semibold', daysToExpiry <= 30 ? 'text-warning-light' : daysToExpiry < 0 ? 'text-emergency-light' : 'text-gray-200')}>{daysToExpiry < 0 ? 'Expired' : daysToExpiry + ' days'}</span></div>
                  <div><span className="block uppercase tracking-widest">Renewal</span><span className="text-gray-200">{license.renewalStatus}</span></div>
                  <div><span className="block uppercase tracking-widest">Action</span><span className="text-gray-200">{license.renewalStatus === 'Not Started' ? 'Needs renewal' : 'In process'}</span></div>
                </div>
                {license.renewalStatus === 'Not Started' && license.status !== 'Active' && (
                  <Button variant="outline" size="sm" onClick={() => initiateRenewal(license.id)} disabled={isPending}>
                    <RefreshCw className="w-3.5 h-3.5" /> Initiate Renewal
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
