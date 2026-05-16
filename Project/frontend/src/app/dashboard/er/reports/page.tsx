'use client';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useERDashboard } from '@/modules/er';

const ER_ROLES = ['er_physician', 'emergency_physician', 'hospital_admin', 'super_admin'];

export default function Reports() {
  const { data } = useERDashboard({ view: 'all' });
  const d = data?.data;

  return (
    <RoleGuard roles={ER_ROLES}>
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <Breadcrumbs items={[{ label: 'ER Physician' }, { label: 'Reports' }]} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {d?.kpis.map((kpi) => (
            <Card key={kpi.id} className="border-white/[0.06] shadow-glass bg-surface-light">
              <CardBody className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{kpi.title}</p>
                <p className="text-3xl font-black text-white mt-2">{kpi.value}</p>
                {kpi.delta && <p className="text-xs text-gray-500 mt-1">{kpi.delta}</p>}
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <Card className="xl:col-span-7 border-white/[0.06] shadow-glass bg-surface-light">
            <CardHeader className="border-b border-white/[0.04] px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-white tracking-wide">Triage Efficiency</h3>
                <p className="text-xs text-gray-400 mt-0.5">Live queue characteristics and waiting pressure</p>
              </div>
            </CardHeader>
            <CardBody className="p-4 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] text-gray-400">
                    <th className="px-2 py-2 text-left">Patient</th>
                    <th className="px-2 py-2 text-left">Priority</th>
                    <th className="px-2 py-2 text-left">Wait</th>
                    <th className="px-2 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {d?.triageQueue.map((patient) => (
                    <tr key={patient.id} className="border-b border-white/[0.04]">
                      <td className="px-2 py-2 text-white">{patient.patientName}</td>
                      <td className="px-2 py-2 text-gray-300">{patient.priority}</td>
                      <td className="px-2 py-2 text-gray-300">{patient.waitingTime}m</td>
                      <td className="px-2 py-2 text-gray-300">{patient.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>

          <Card className="xl:col-span-5 border-white/[0.06] shadow-glass bg-surface-light">
            <CardHeader className="border-b border-white/[0.04] px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-white tracking-wide">Resource Summary</h3>
                <p className="text-xs text-gray-400 mt-0.5">Capacity available for critical arrivals</p>
              </div>
            </CardHeader>
            <CardBody className="p-4 space-y-3">
              {d?.resources.map((resource) => {
                const pct = Math.round((resource.available / resource.total) * 100);
                return (
                  <div key={resource.id}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-300">{resource.label}</span>
                      <span className="font-bold text-white">{resource.available}/{resource.total}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-2 rounded-full bg-red-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </CardBody>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
