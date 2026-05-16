'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { PatientList } from '@/modules/patient';
import { usePatientEvents } from '@/modules/patient';

export default function PatientsPage() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);

  useEffect(() => {
    setPageMeta('Patients', 'Patient registry and management');
  }, [setPageMeta]);

  // Subscribe to real-time patient events
  usePatientEvents();

  const router = useRouter();

  return (
    <RoleGuard roles={['doctor', 'nurse', 'receptionist', 'nurse_manager', 'department_head', 'chief_medical_officer', 'hospital_admin', 'tenant_admin', 'super_admin']}>
      <div className="space-y-4 animate-fade-in">
        <Breadcrumbs items={[{ label: 'Patients' }]} />
        <PatientList
          onPatientClick={(p) => {
            router.push(`/dashboard/patients/${p.id}`);
          }}
        />
      </div>
    </RoleGuard>
  );
}
