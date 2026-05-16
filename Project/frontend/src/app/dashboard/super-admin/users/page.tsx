'use client';
import { SuperAdminUsersPage } from '@/modules/super-admin';
import { RoleGuard } from '@/components/guards/AuthGuard';

export default function SuperAdminUsersRoute() {
  return (
    <RoleGuard roles={['super_admin', 'ceo', 'enterprise-root']} requireAll={false}>
      <SuperAdminUsersPage />
    </RoleGuard>
  );
}
