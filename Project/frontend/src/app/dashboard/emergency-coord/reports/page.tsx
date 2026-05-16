'use client';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useEcDashboard } from '@/modules/emergency-coord';

const EC_ROLES = ['emergency_coordinator', 'er_physician', 'hospital_admin', 'super_admin'];

export default function EcSubPage() {
  const { data } = useEcDashboard({});
  const kpis = data?.data?.kpis ?? [];
  const patients = data?.data?.patients ?? [];
  const ambulances = data?.data?.ambulances ?? [];
  const tasks = data?.data?.tasks ?? [];

  return (
    <RoleGuard roles={EC_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1600px]">
        <Breadcrumbs items={[{ label: 'Emergency Coord' }, { label: 'Reports' }]} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kpis.map((kpi) => (
            <Card key={kpi.id} className="border-white/[0.06] shadow-glass bg-surface-light">
              <CardBody className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{kpi.label}</p>
                <p className="text-3xl font-black text-white mt-2">{kpi.value}</p>
                {kpi.subLabel && <p className="text-xs text-gray-500 mt-1">{kpi.subLabel}</p>}
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <Card className="xl:col-span-7 border-white/[0.06] shadow-glass bg-surface-light">
            <CardHeader className="border-b border-white/[0.04] px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-white tracking-wide">Flow Summary</h3>
                <p className="text-xs text-gray-400 mt-0.5">Patient, ambulance, and task movement through the department</p>
              </div>
            </CardHeader>
            <CardBody className="p-4 space-y-3 text-sm">
              <div className="rounded-lg border border-white/[0.08] bg-surface-dark p-3 flex items-center justify-between">
                <span className="text-gray-300">Patients in motion</span>
                <span className="font-bold text-white">{patients.length}</span>
              </div>
              <div className="rounded-lg border border-white/[0.08] bg-surface-dark p-3 flex items-center justify-between">
                <span className="text-gray-300">Ambulance units</span>
                <span className="font-bold text-white">{ambulances.length}</span>
              </div>
              <div className="rounded-lg border border-white/[0.08] bg-surface-dark p-3 flex items-center justify-between">
                <span className="text-gray-300">Open tasks</span>
                <span className="font-bold text-white">{tasks.filter((task) => task.status !== 'Done').length}</span>
              </div>
            </CardBody>
          </Card>

          <Card className="xl:col-span-5 border-white/[0.06] shadow-glass bg-surface-light">
            <CardHeader className="border-b border-white/[0.04] px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-white tracking-wide">Patient Mix</h3>
                <p className="text-xs text-gray-400 mt-0.5">Current triage distribution across the department</p>
              </div>
            </CardHeader>
            <CardBody className="p-4 space-y-3">
              {['Red', 'Yellow', 'Green', 'Black'].map((priority) => (
                <div key={priority} className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-surface-dark p-3">
                  <span className="text-gray-300">{priority}</span>
                  <span className="font-bold text-white">{patients.filter((patient) => patient.priority === priority).length}</span>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
