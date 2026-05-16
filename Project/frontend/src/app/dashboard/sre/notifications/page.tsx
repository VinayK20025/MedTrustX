'use client';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { NotificationsConsole } from '@/modules/notifications';

const SRE_NOTIFICATION_ROLES = ['super_admin', 'hospital_admin', 'security_officer', 'compliance_officer', 'tenant_admin'];

export default function SRENotifications() {
  return (
    <RoleGuard roles={SRE_NOTIFICATION_ROLES}>
      <NotificationsConsole mode="sre" />
    </RoleGuard>
  );
}
