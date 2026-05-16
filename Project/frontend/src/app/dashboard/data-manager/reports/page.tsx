'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';
export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in">
      <Breadcrumbs items={[{ label: "Data Manager" }, { label: "Reports" }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light min-h-[400px] flex items-center justify-center">
        <CardBody className="text-gray-500 text-center"><p className="text-lg capitalize">reports</p></CardBody>
      </Card>
    </div>
  );
}
