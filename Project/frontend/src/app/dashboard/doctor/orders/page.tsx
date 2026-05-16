'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Spinner';
import { PatientListPanel, SchedulePanel, DoctorAlertsPanel, TimelinePanel, useDoctorDashboard, usePrescribe } from '@/modules/doctor';

const DOCTOR_ROLES = ['doctor', 'hospital_admin', 'super_admin'];

export default function Orders() {
  const { data, isLoading } = useDoctorDashboard({ view: 'all' });
  const { mutate: prescribe, isPending } = usePrescribe();
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>();

  useEffect(() => {
    if (!selectedPatientId && data?.data?.patients?.length) {
      setSelectedPatientId(data.data.patients[0].id);
    }
  }, [data, selectedPatientId]);

  const d = data?.data;
  const selectedPatient = useMemo(
    () => d?.patients.find((patient) => patient.id === selectedPatientId),
    [d?.patients, selectedPatientId]
  );

  return (
    <RoleGuard roles={DOCTOR_ROLES}>
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <Breadcrumbs items={[{ label: 'Doctor' }, { label: 'Prescriptions & Orders' }]} />

        {isLoading ? (
          <Skeleton className="h-[760px] w-full rounded-xl" />
        ) : !d ? (
          <div className="text-gray-500 py-20 text-center">No data available</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardBody className="p-4"><p className="text-[10px] uppercase tracking-widest text-gray-400">Patients</p><p className="text-3xl font-black text-white mt-2">{d.patients.length}</p></CardBody></Card>
              <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardBody className="p-4"><p className="text-[10px] uppercase tracking-widest text-gray-400">Orders Pending</p><p className="text-3xl font-black text-warning-light mt-2">{d.patients.reduce((sum, patient) => sum + patient.pendingActions, 0)}</p></CardBody></Card>
              <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardBody className="p-4"><p className="text-[10px] uppercase tracking-widest text-gray-400">Critical Cases</p><p className="text-3xl font-black text-emergency-light mt-2">{d.patients.filter((patient) => patient.status === 'critical').length}</p></CardBody></Card>
              <Card className="border-white/[0.06] shadow-glass bg-surface-light"><CardBody className="p-4"><p className="text-[10px] uppercase tracking-widest text-gray-400">Scheduled</p><p className="text-3xl font-black text-success-light mt-2">{d.appointments.filter((appointment) => appointment.status === 'scheduled' || appointment.status === 'in_progress').length}</p></CardBody></Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
              <div className="xl:col-span-4 flex flex-col gap-5">
                <PatientListPanel patients={d.patients} />
                <Card className="border-teal-500/20 shadow-glass bg-surface-light">
                  <CardHeader className="border-b border-white/[0.04] px-5 py-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white tracking-wide">Order Composer</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Send prescriptions and diagnostic orders for the selected patient</p>
                    </div>
                  </CardHeader>
                  <CardBody className="p-4 space-y-3">
                    <div className="rounded-lg border border-white/[0.08] bg-surface-dark p-3">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400">Selected patient</p>
                      <p className="text-white font-semibold mt-1">{selectedPatient?.name ?? 'Select a patient'}</p>
                      <p className="text-xs text-gray-500 mt-1">{selectedPatient?.diagnosis ?? 'No diagnosis selected'}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { label: 'Order CBC + CMP', payload: { type: 'lab_order', details: { tests: ['CBC', 'CMP'] } } },
                        { label: 'Prescribe IV Antibiotic', payload: { type: 'medication', details: { drug: 'Piperacillin/Tazobactam', dosage: '4.5g', frequency: 'Q8H', route: 'IV' } } },
                        { label: 'Request CXR', payload: { type: 'imaging', details: { study: 'Chest X-Ray PA View' } } },
                      ].map((action) => (
                        <Button
                          key={action.label}
                          disabled={!selectedPatient || isPending}
                          onClick={() => selectedPatient && prescribe({ patientId: selectedPatient.id, rx: action.payload })}
                          className="h-11 justify-start bg-white/5 hover:bg-white/10 text-white border border-white/10"
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>
              <div className="xl:col-span-5 flex flex-col gap-5">
                <SchedulePanel appointments={d.appointments} />
                <TimelinePanel entries={d.recentTimeline} />
              </div>
              <div className="xl:col-span-3">
                <DoctorAlertsPanel alerts={d.alerts} />
              </div>
            </div>
          </>
        )}
      </div>
    </RoleGuard>
  );
}
