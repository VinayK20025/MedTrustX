'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';

export default function AccountsExpensesPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1200px]">
      <Breadcrumbs items={[{ label: 'Finance' }, { label: 'Expense Tracking' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light min-h-[400px] flex items-center justify-center">
        <CardBody className="text-gray-500 text-center">
          <p className="text-lg">Expense Management</p>
          <p className="text-sm">Category-wise expense tracking, procurement costs, and anomaly detection.</p>
        </CardBody>
      </Card>
    </div>
  );
}
