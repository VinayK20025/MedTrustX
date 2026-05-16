'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Spinner';
import { PatientGrid, UnitAlertsPanel, UnitStaffPanel, useUnitHeadDashboard, useTriggerIntervention, useAcknowledgeAlert } from '@/modules/unit-head';

const UNIT_HEAD_ROLES = ['department_head', 'hospital_admin', 'super_admin'];

export default function Orders() {
  const { data, isLoading } = useUnitHeadDashboard({ unit: 'icu' });
  const { mutate: triggerIntervention, isPending } = useTriggerIntervention();
  const { mutate: acknowledgeAlert } = useAcknowledgeAlert();
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>();

  useEffect(() => {
    if (!selectedPatientId && data?.data?.patients?.length) {
      setSelectedPatientId(data.data.patients.find((patient) => patient.severity === 'critical')?.id ?? data.data.patients[0].id);
    }
  }, [data, selectedPatientId]);

  const d = data?.data;
  const selectedPatient = useMemo(
    () => d?.patients.find((patient) => patient.id === selectedPatientId),
    [d?.patients, selectedPatientId]
  );
  const criticalAlerts = d?.alerts.filter((alert) => !alert.acknowledged) ?? [];

  return (
    <RoleGuard roles={UNIT_HEAD_ROLES}>
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <Breadcrumbs items={[{ label: 'Unit Head' }, { label: 'Orders & Procedures' }]} />

        {isLoading ? (
          <Skeleton className="h-[760px] w-full rounded-xl" />
        ) : !d ? (
          <div className="text-gray-500 py-20 text-center">No unit data available</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {d.kpis.map((kpi) => (
                <Card key={kpi.id} className="border-white/[0.06] shadow-glass bg-surface-light">
                  <CardBody className="p-4">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">{kpi.title}</p>
                    <p className="text-3xl font-black text-white mt-2">{kpi.value}</p>
                    {kpi.delta && <p className="text-xs text-gray-500 mt-1">{kpi.delta}</p>}
                  </CardBody>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
              <div className="xl:col-span-7 space-y-5">
                <PatientGrid patients={d.patients} />
                <UnitStaffPanel staff={d.staff} />
              </div>
              <div className="xl:col-span-5 flex flex-col gap-5">
                <Card className="border-white/[0.06] shadow-glass bg-surface-light">
                  <CardHeader className="border-b border-white/[0.04] px-5 py-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white tracking-wide">Intervention Console</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Escalate procedures and order-response actions</p>
                    </div>
                  </CardHeader>
                  <CardBody className="p-4 space-y-3">
                    <div className="rounded-lg border border-white/[0.08] bg-surface-dark p-3">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400">Selected patient</p>
                      <p className="text-white font-semibold mt-1">{selectedPatient?.name ?? 'Select a patient'}</p>
                      <p className="text-xs text-gray-500 mt-1">{selectedPatient?.diagnosis ?? 'No patient selected'}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {['Vasopressor review', 'Repeat ABG', '12-lead ECG', 'Ventilator check'].map((action) => (
                        <Button
                          key={action}
                          disabled={!selectedPatient || isPending}
                          onClick={() => selectedPatient && triggerIntervention({ patientId: selectedPatient.id, type: action })}
                          className="h-11 justify-start bg-white/5 hover:bg-white/10 text-white border border-white/10"
                        >
                          {action}
                        </Button>
                      ))}
                    </div>
                  </CardBody>
                </Card>
                <UnitAlertsPanel alerts={d.alerts} />
                {criticalAlerts.length > 0 && (
                  <Card className="border-emergency/20 shadow-glass bg-emergency/5">
                    <CardHeader className="border-b border-emergency/10 px-5 py-4">
                      <div>
                        <h3 className="text-lg font-semibold text-emergency-light tracking-wide">Critical Alert Actions</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Acknowledge active high-risk alerts</p>
                      </div>
                    </CardHeader>
                    <CardBody className="p-4 space-y-2">
                      {criticalAlerts.map((alert) => (
                        <Button
                          key={alert.id}
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="w-full h-10 bg-emergency/15 hover:bg-emergency/25 text-emergency-light border border-emergency/20"
                        >
                          Acknowledge {alert.patientName ?? alert.bed ?? alert.id}
                        </Button>
                      ))}
                    </CardBody>
                  </Card>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </RoleGuard>
  );
}
