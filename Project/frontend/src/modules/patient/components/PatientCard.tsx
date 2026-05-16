'use client';
import React from 'react';
import { cn } from '@/utils/cn';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import type { Patient } from '../types/patient.types';
import { formatMRN } from '@/utils/format';

interface PatientCardProps {
  patient: Patient;
  onClick?: () => void;
  className?: string;
}

const statusVariant: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'default'> = {
  active: 'success',
  admitted: 'info',
  discharged: 'default',
  deceased: 'danger',
  inactive: 'warning',
};

export function PatientCard({ patient, onClick, className }: PatientCardProps) {
  return (
    <div
      className={cn(
        'glass-card-hover p-4 flex items-center gap-4 cursor-pointer',
        className,
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <Avatar name={patient.fullName} src={patient.avatar} size="md" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white truncate">{patient.fullName}</h3>
          <Badge variant={statusVariant[patient.status] ?? 'default'} size="sm">
            {patient.status}
          </Badge>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-gray-500 font-mono">{formatMRN(patient.mrn)}</span>
          <span className="text-xs text-gray-500">•</span>
          <span className="text-xs text-gray-500">{patient.age}y, {patient.gender}</span>
          {patient.bloodGroup && (
            <>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-emergency-light font-medium">{patient.bloodGroup}</span>
            </>
          )}
        </div>
      </div>

      {patient.allergies && patient.allergies.length > 0 && (
        <Badge variant="warning" size="sm" dot>
          {patient.allergies.length} Allerg{patient.allergies.length > 1 ? 'ies' : 'y'}
        </Badge>
      )}
    </div>
  );
}
