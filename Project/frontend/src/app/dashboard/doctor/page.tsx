'use client';
import { DoctorDashboard } from '@/modules/doctor';
import { RoleGuard } from '@/components/guards/AuthGuard';

export default function DoctorRoute() { 
  return (
    <RoleGuard roles={['doctor', 'gp', 'super_admin']} requireAll={false}>
      <DoctorDashboard />
    </RoleGuard>
  ); 
}
