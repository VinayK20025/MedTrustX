'use client';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { HrExecDashboard } from '@/modules/hr-executive';

const HR_EXEC_ROLES = ['hr_executive', 'super_admin', 'hospital_admin', 'hr_manager'];

export default function HrExecRoute() {
	return (
		<RoleGuard roles={HR_EXEC_ROLES}>
			<HrExecDashboard />
		</RoleGuard>
	);
}
