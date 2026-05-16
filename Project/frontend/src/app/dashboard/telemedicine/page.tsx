'use client';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { TelemedicineDashboard } from '@/modules/telemedicine';

const TELEMEDICINE_ROLES = ['doctor', 'hospital_admin', 'super_admin'];

export default function TelemedicineRoute() {
	return (
		<RoleGuard roles={TELEMEDICINE_ROLES}>
			<TelemedicineDashboard />
		</RoleGuard>
	);
}
