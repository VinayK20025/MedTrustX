'use client';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useERDashboard } from '@/modules/er';

const ER_ROLES = ['er_physician', 'emergency_physician', 'hospital_admin', 'super_admin'];

export default function EmergencyOrders() {
  const { data } = useERDashboard({ view: 'critical' });
  const criticalPatients = data?.data?.criticalPatients ?? [];
  const resources = data?.data?.resources ?? [];

  const orderSets = [
    { title: 'Cardiac Emergency Bundle', subtitle: 'ECG, cardiac enzymes, oxygen escalation, and ICU prep', target: 'STEMI / Code Blue' },
    { title: 'Trauma Stabilization Bundle', subtitle: 'Imaging, blood products, surgical prep, and airway readiness', target: 'Polytrauma / RTA' },
    { title: 'Respiratory Distress Bundle', subtitle: 'Nebulization, ABG, ventilator readiness, and step-down review', target: 'Severe dyspnea / Hypoxia' },
  ];

  return (
    <RoleGuard roles={ER_ROLES}>
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <Breadcrumbs items={[{ label: 'ER Physician' }, { label: 'Emergency Orders' }]} />
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {orderSets.map((orderSet) => (
              <Card key={orderSet.title} className="border-teal-500/20 shadow-glass bg-surface-light">
                <CardHeader className="border-b border-white/[0.04] px-5 py-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white tracking-wide">{orderSet.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{orderSet.target}</p>
                  </div>
                </CardHeader>
                <CardBody className="p-4">
                  <p className="text-sm text-gray-300">{orderSet.subtitle}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-2 py-1 rounded text-[10px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20">1-click ready</span>
                    <span className="px-2 py-1 rounded text-[10px] font-bold bg-white/5 text-gray-300 border border-white/10">ER standardized</span>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
          <div className="xl:col-span-4 flex flex-col gap-5">
            <Card className="border-white/[0.06] shadow-glass bg-surface-light">
              <CardHeader className="border-b border-white/[0.04] px-5 py-4">
                <div>
                  <h3 className="text-lg font-semibold text-white tracking-wide">Critical Patient Targets</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Live cases driving rapid order execution</p>
                </div>
              </CardHeader>
              <CardBody className="p-4 space-y-2">
                {criticalPatients.map((patient) => (
                  <div key={patient.id} className="rounded-lg border border-white/[0.08] bg-surface-dark p-3">
                    <p className="text-white font-semibold">{patient.patientName}</p>
                    <p className="text-xs text-gray-400">{patient.diagnosis} · {patient.location}</p>
                  </div>
                ))}
              </CardBody>
            </Card>
            <Card className="border-white/[0.06] shadow-glass bg-surface-light flex-1">
              <CardHeader className="border-b border-white/[0.04] px-5 py-4">
                <div>
                  <h3 className="text-lg font-semibold text-white tracking-wide">Resource Readiness</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Stock and capacity constraints affecting orders</p>
                </div>
              </CardHeader>
              <CardBody className="p-4 space-y-3 text-sm">
                {resources.map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-surface-dark p-3">
                    <span className="text-gray-300">{resource.label}</span>
                    <span className="font-bold text-white">{resource.available}/{resource.total}</span>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
