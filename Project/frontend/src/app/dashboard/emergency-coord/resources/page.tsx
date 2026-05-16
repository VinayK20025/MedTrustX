'use client';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useEcDashboard } from '@/modules/emergency-coord';

const EC_ROLES = ['emergency_coordinator', 'er_physician', 'hospital_admin', 'super_admin'];

export default function EcSubPage() {
  const { data } = useEcDashboard({});
  const resources = data?.data?.resources ?? [];

  return (
    <RoleGuard roles={EC_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1600px]">
        <Breadcrumbs items={[{ label: 'Emergency Coord' }, { label: 'Resources' }]} />
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader className="border-b border-white/[0.04] px-5 py-4">
            <div>
              <h3 className="text-lg font-semibold text-white tracking-wide">Flow Resources</h3>
              <p className="text-xs text-gray-400 mt-0.5">Bed, room, and routing capacity status</p>
            </div>
          </CardHeader>
          <CardBody className="p-4 space-y-4">
            {resources.map((resource) => {
              const pct = Math.round((resource.available / resource.total) * 100);
              return (
                <div key={resource.id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-300">{resource.name}</span>
                    <span className="font-bold text-white">{resource.available}/{resource.total} {resource.unit}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className={`h-2 rounded-full ${resource.status === 'Critical' ? 'bg-red-500' : resource.status === 'Low' ? 'bg-yellow-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>
    </RoleGuard>
  );
}
