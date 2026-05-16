'use client';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { ERDashboard } from '@/modules/er';

const ER_ROLES = ['er_physician', 'emergency_physician', 'hospital_admin', 'super_admin'];

export default function ERRoute() {
	return (
		<RoleGuard roles={ER_ROLES}>
			<ERDashboard />
		</RoleGuard>
	);
}
