'use client';

import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Microscope, Image as ImageIcon, Plus, Activity, AlertCircle } from 'lucide-react';
import { useOrderTest } from '../hooks/useDiagnostics';

interface Props {
  roleTitle?: string;
  isQualityView?: boolean;
}

export function DiagnosticsWorkspace({ roleTitle = 'Diagnostics', isQualityView = false }: Props) {
  const { mutate: orderTest, isPending } = useOrderTest();
  
  const handleOrder = () => {
    orderTest({
      type: 'lab',
      testName: 'Complete Blood Count (CBC)',
      status: 'pending',
      timestamp: new Date().toISOString(),
    });
  };

  if (isQualityView) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader title="Lab Turnaround Time (TAT)" icon={<Activity className="w-5 h-5 text-teal-400" />} />
          <CardBody className="flex flex-col items-center justify-center py-10">
            <h3 className="text-4xl font-bold text-white mb-2">42 min</h3>
            <p className="text-sm text-gray-400">Average TAT across all departments</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Validation Error Rate" icon={<AlertCircle className="w-5 h-5 text-rose-400" />} />
          <CardBody className="flex flex-col items-center justify-center py-10">
            <h3 className="text-4xl font-bold text-white mb-2">1.2%</h3>
            <p className="text-sm text-gray-400">Errors requiring re-run</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Total Tests Today" icon={<Microscope className="w-5 h-5 text-blue-400" />} />
          <CardBody className="flex flex-col items-center justify-center py-10">
            <h3 className="text-4xl font-bold text-white mb-2">1,248</h3>
            <p className="text-sm text-gray-400">+12% from yesterday</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      <Card className="flex flex-col h-[600px]">
        <CardHeader 
          title="Lab Results" 
          icon={<Microscope className="w-5 h-5" />} 
          action={<Button leftIcon={<Plus className="w-4 h-4" />} size="sm" onClick={handleOrder} isLoading={isPending}>Order Lab</Button>}
        />
        <CardBody className="flex-1 overflow-y-auto">
          <div className="text-sm text-gray-500 text-center py-20 border border-dashed border-white/10 rounded-lg">
            No lab results available. Select a patient or order a test.
          </div>
        </CardBody>
      </Card>

      <Card className="flex flex-col h-[600px]">
        <CardHeader 
          title="Imaging & Radiology" 
          icon={<ImageIcon className="w-5 h-5" />} 
          action={<Button leftIcon={<Plus className="w-4 h-4" />} size="sm">Order Imaging</Button>}
        />
        <CardBody className="flex-1 overflow-y-auto">
          <div className="text-sm text-gray-500 text-center py-20 border border-dashed border-white/10 rounded-lg">
            No imaging reports available. Select a patient.
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
