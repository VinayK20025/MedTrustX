'use client';
import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Tabs } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { 
  usePatient,
  PatientOverviewTab,
  PatientEncountersTab,
  PatientVitalsTab,
  PatientMedicationsTab,
  PatientDiagnosticsTab,
  PatientBillingTab,
  PatientDocumentsTab,
  PatientTimelineTab
} from '@/modules/patient';
import { formatMRN, formatPhone } from '@/utils/format';
import { formatDate } from '@/utils/date';
import { Edit, Phone, Mail, MapPin, Heart, AlertTriangle } from 'lucide-react';

const statusVariant: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'default'> = {
  active: 'success', admitted: 'info', discharged: 'default', deceased: 'danger', inactive: 'warning',
};

export default function PatientDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = usePatient(id);
  const patient = data?.data;
  const [activeTab, setActiveTab] = React.useState('overview');

  useEffect(() => {
    setPageMeta(patient?.fullName ?? 'Patient Detail', formatMRN(patient?.mrn ?? ''));
  }, [setPageMeta, patient]);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!patient) {
    return <div className="text-center text-gray-400 py-20">Patient not found</div>;
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <Breadcrumbs items={[
        { label: 'Patients', href: '/dashboard/patients' },
        { label: patient.fullName },
      ]} />

      {/* Patient Header Card */}
      <Card>
        <CardBody className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Avatar name={patient.fullName} src={patient.avatar} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-white">{patient.fullName}</h1>
              <Badge variant={statusVariant[patient.status] ?? 'default'} dot>{patient.status}</Badge>
              {patient.bloodGroup && <Badge variant="danger" size="sm">{patient.bloodGroup}</Badge>}
            </div>
            <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-gray-400">
              <span className="font-mono text-teal-400">{formatMRN(patient.mrn)}</span>
              <span>{patient.age} years, {patient.gender}</span>
              <span>DOB: {formatDate(patient.dateOfBirth)}</span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              {patient.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{formatPhone(patient.phone)}</span>}
              {patient.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{patient.email}</span>}
            </div>
          </div>
          <Button variant="secondary" size="sm" leftIcon={<Edit className="w-4 h-4" />}>Edit</Button>
        </CardBody>
      </Card>

      {/* Alerts */}
      {patient.allergies && patient.allergies.length > 0 && (
        <Card className="border-warning/20">
          <CardBody className="flex items-center gap-3 py-3">
            <AlertTriangle className="w-5 h-5 text-warning-light flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-warning-light">Known Allergies</p>
              <p className="text-xs text-gray-400 mt-0.5">{patient.allergies.join(', ')}</p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'encounters', label: 'Encounters', count: 12 },
          { id: 'vitals', label: 'Vitals' },
          { id: 'medications', label: 'Medications', count: 4 },
          { id: 'diagnostics', label: 'Diagnostics' },
          { id: 'billing', label: 'Billing' },
          { id: 'documents', label: 'Documents' },
          { id: 'timeline', label: 'Timeline' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'overview' && <PatientOverviewTab patient={patient} />}
        {activeTab === 'encounters' && <PatientEncountersTab patient={patient} />}
        {activeTab === 'vitals' && <PatientVitalsTab patient={patient} />}
        {activeTab === 'medications' && <PatientMedicationsTab patient={patient} />}
        {activeTab === 'diagnostics' && <PatientDiagnosticsTab patient={patient} />}
        {activeTab === 'billing' && <PatientBillingTab patient={patient} />}
        {activeTab === 'documents' && <PatientDocumentsTab patient={patient} />}
        {activeTab === 'timeline' && <PatientTimelineTab patient={patient} />}
      </div>
    </div>
  );
}
