/**
 * MedTrustX — Patient Module Types
 * Maps to: patient-service backend
 */
import type { BaseEntity, TenantEntity, Address, ContactInfo } from '@/types/common.types';

export type Gender = 'male' | 'female' | 'other' | 'unknown';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type PatientStatus = 'active' | 'admitted' | 'discharged' | 'deceased' | 'inactive';

export interface Patient extends TenantEntity {
  mrn: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  gender: Gender;
  bloodGroup?: BloodGroup;
  status: PatientStatus;
  phone?: string;
  email?: string;
  address?: Address;
  emergencyContact?: ContactInfo & { name: string; relationship: string };
  insuranceId?: string;
  aadhaarHash?: string; // Masked
  avatar?: string;
  allergies?: string[];
  tags?: string[];
}

export interface PatientListFilters {
  status?: PatientStatus;
  gender?: Gender;
  search?: string;
  ward?: string;
  department?: string;
}

export interface CreatePatientPayload {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  phone?: string;
  email?: string;
  bloodGroup?: BloodGroup;
  address?: Address;
}

export interface UpdatePatientPayload extends Partial<CreatePatientPayload> {
  status?: PatientStatus;
  allergies?: string[];
}
