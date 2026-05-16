'use client';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { ERParamedicDashboard } from '@/modules/er-paramedic';

const PARAMEDIC_ROLES = ['paramedic', 'er_paramedic', 'hospital_admin', 'super_admin'];

export default function ERParamedicRoute() {
	return (
		<RoleGuard roles={PARAMEDIC_ROLES}>
			<ERParamedicDashboard />
		</RoleGuard>
	);
}
