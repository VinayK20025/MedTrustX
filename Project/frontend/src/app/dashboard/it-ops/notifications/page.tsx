'use client';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { NotificationsConsole } from '@/modules/notifications';

const ITOPS_NOTIFICATION_ROLES = ['super_admin', 'hospital_admin', 'tenant_admin', 'security_officer'];

export default function ITOpsNotifications() {
  return (
    <RoleGuard roles={ITOPS_NOTIFICATION_ROLES}>
      <NotificationsConsole mode="it-ops" />
    </RoleGuard>
  );
}
