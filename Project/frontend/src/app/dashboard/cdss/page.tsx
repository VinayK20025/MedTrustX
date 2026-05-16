import { CDSSDashboard } from '@/modules/cdss';
import { RoleGuard } from '@/components/guards/AuthGuard';

export const metadata = {
  title: 'CDSS | MedTrustX',
  description: 'Clinical Decision Support System Dashboard',
};

export default function CDSSPage() {
  return (
    <RoleGuard
      roles={['clinician', 'doctor', 'nurse', 'clinical-informaticist', 'ai-governance-officer', 'super-admin']}
    >
      <CDSSDashboard />
    </RoleGuard>
  );
}
