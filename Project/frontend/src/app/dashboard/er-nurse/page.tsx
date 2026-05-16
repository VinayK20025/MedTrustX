'use client';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { ERDashboard } from '@/modules/er-nurse';

const ER_NURSE_ROLES = ['er_nurse', 'nurse', 'nurse_manager', 'hospital_admin', 'super_admin'];

export default function ERNurseRoute() {
	return (
		<RoleGuard roles={ER_NURSE_ROLES}>
			<ERDashboard />
		</RoleGuard>
	);
}
