'use client';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { EmergencyCoordinatorDashboard } from '@/modules/emergency-coord';

const EC_ROLES = ['emergency_coordinator', 'er_physician', 'hospital_admin', 'super_admin'];

export default function EmergencyCoordRoute() {
	return (
		<RoleGuard roles={EC_ROLES}>
			<EmergencyCoordinatorDashboard />
		</RoleGuard>
	);
}
