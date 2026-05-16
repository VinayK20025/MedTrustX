'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Spinner';
import { useIomtDashboard, useRevokeCertificate } from '@/modules/iomt-device';

export default function IomtAuthPage() {
  const { data, isLoading } = useIomtDashboard();
  const revoke = useRevokeCertificate();

  if (isLoading) {
    return <Skeleton className="h-[500px] w-full rounded-xl" />;
  }

  const certificates = data?.data?.certificates ?? [];

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Devices' }, { label: 'Authentication' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light">
        <CardHeader title="mTLS Certificates" subtitle="Device authentication lifecycle" />
        <CardBody className="space-y-3">
          {certificates.map((cert) => (
            <div
              key={cert.certId}
              className="flex items-center justify-between gap-4 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]"
            >
              <div>
                <p className="text-sm text-white font-semibold">{cert.deviceId}</p>
                <p className="text-xs text-gray-500">Issuer {cert.issuer} · {cert.encryption}</p>
                <p className="text-2xs text-gray-600">Expires {new Date(cert.expiryDate).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  size="sm"
                  variant={cert.status === 'Valid' ? 'success' : cert.status === 'Expired' ? 'warning' : cert.status === 'Revoked' ? 'danger' : 'outline'}
                >
                  {cert.status}
                </Badge>
                {cert.status === 'Valid' && (
                  <button
                    className="text-xs text-red-400 hover:text-red-300"
                    onClick={() => revoke.mutate({ deviceId: cert.deviceId })}
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
          {certificates.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-8">No certificates available.</div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
