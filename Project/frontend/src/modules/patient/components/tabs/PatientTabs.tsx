'use client';

import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import type { Patient } from '../../types/patient.types';

export function PatientOverviewTab({ patient }: { patient: Patient }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader title="Demographics" />
        <CardBody>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-500 w-24 inline-block">Name:</span> {patient.fullName}</p>
            <p><span className="text-gray-500 w-24 inline-block">DOB:</span> {patient.dateOfBirth}</p>
            <p><span className="text-gray-500 w-24 inline-block">Gender:</span> {patient.gender}</p>
            <p><span className="text-gray-500 w-24 inline-block">Blood Group:</span> {patient.bloodGroup || 'Unknown'}</p>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Contact Information" />
        <CardBody>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-500 w-24 inline-block">Phone:</span> {patient.phone || 'N/A'}</p>
            <p><span className="text-gray-500 w-24 inline-block">Email:</span> {patient.email || 'N/A'}</p>
            <p><span className="text-gray-500 w-24 inline-block">Address:</span> {patient.address ? `${patient.address.city}, ${patient.address.country}` : 'N/A'}</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export function PatientEncountersTab({ patient }: { patient: Patient }) {
  return (
    <Card>
      <CardHeader title="Encounters & Admissions" subtitle={`History for ${patient.fullName}`} />
      <CardBody>
        <div className="text-sm text-gray-400 py-8 text-center border border-dashed border-white/10 rounded-lg">
          No recent encounters found.
        </div>
      </CardBody>
    </Card>
  );
}

export function PatientVitalsTab({ patient }: { patient: Patient }) {
  return (
    <Card>
      <CardHeader title="Vital Signs" />
      <CardBody>
        <div className="text-sm text-gray-400 py-8 text-center border border-dashed border-white/10 rounded-lg">
          Vitals monitoring history will appear here.
        </div>
      </CardBody>
    </Card>
  );
}

export function PatientMedicationsTab({ patient }: { patient: Patient }) {
  return (
    <Card>
      <CardHeader title="Medications" />
      <CardBody>
        <div className="text-sm text-gray-400 py-8 text-center border border-dashed border-white/10 rounded-lg">
          No active prescriptions.
        </div>
      </CardBody>
    </Card>
  );
}

export function PatientDiagnosticsTab({ patient }: { patient: Patient }) {
  return (
    <Card>
      <CardHeader title="Diagnostics & Labs" />
      <CardBody>
        <div className="text-sm text-gray-400 py-8 text-center border border-dashed border-white/10 rounded-lg">
          Lab results and imaging reports will appear here.
        </div>
      </CardBody>
    </Card>
  );
}

export function PatientBillingTab({ patient }: { patient: Patient }) {
  return (
    <Card>
      <CardHeader title="Billing & Insurance" />
      <CardBody>
        <div className="text-sm text-gray-400 py-8 text-center border border-dashed border-white/10 rounded-lg">
          No pending invoices.
        </div>
      </CardBody>
    </Card>
  );
}

export function PatientDocumentsTab({ patient }: { patient: Patient }) {
  return (
    <Card>
      <CardHeader title="Documents & Consents" />
      <CardBody>
        <div className="text-sm text-gray-400 py-8 text-center border border-dashed border-white/10 rounded-lg">
          No uploaded documents.
        </div>
      </CardBody>
    </Card>
  );
}

export function PatientTimelineTab({ patient }: { patient: Patient }) {
  return (
    <Card>
      <CardHeader title="Clinical Timeline" />
      <CardBody>
        <div className="text-sm text-gray-400 py-8 text-center border border-dashed border-white/10 rounded-lg">
          Timeline of events will be populated here.
        </div>
      </CardBody>
    </Card>
  );
}
