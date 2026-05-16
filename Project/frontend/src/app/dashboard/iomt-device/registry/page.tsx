'use client';
import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { DeviceRegistryPanel } from '@/modules/iomt-device';
import { useIomtDashboard, useApproveDevice } from '@/modules/iomt-device';

export default function IomtRegistryPage() {
  const { data, isLoading } = useIomtDashboard();
  const approve = useApproveDevice();
  const [activeDeviceId, setActiveDeviceId] = useState<string | undefined>();

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full rounded-xl" />;
  }

  const iomt = data?.data;
  if (!iomt) {
    return <div className="text-gray-500 py-20 text-center">No data available</div>;
  }

  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Devices' }, { label: 'Registry' }]} />
      <div className="h-[700px]">
        <DeviceRegistryPanel
          devices={iomt.devices}
          activeDeviceId={activeDeviceId}
          onSelectDevice={setActiveDeviceId}
          onApproveDevice={(id) => approve.mutate({ deviceId: id })}
        />
      </div>
    </div>
  );
}
