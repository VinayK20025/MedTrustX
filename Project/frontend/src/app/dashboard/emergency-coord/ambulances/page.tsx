'use client';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useEcDashboard, useRedirectAmbulance } from '@/modules/emergency-coord';

const EC_ROLES = ['emergency_coordinator', 'er_physician', 'hospital_admin', 'super_admin'];

export default function EcSubPage() {
  const { data } = useEcDashboard({});
  const { mutate: redirectAmbulance, isPending } = useRedirectAmbulance();

  return (
    <RoleGuard roles={EC_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1600px]">
        <Breadcrumbs items={[{ label: 'Emergency Coord' }, { label: 'Ambulances' }]} />
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader className="border-b border-white/[0.04] px-5 py-4">
            <div>
              <h3 className="text-lg font-semibold text-white tracking-wide">Ambulance Fleet</h3>
              <p className="text-xs text-gray-400 mt-0.5">Live location, load, and dispatch readiness</p>
            </div>
          </CardHeader>
          <CardBody className="p-4 space-y-3">
            {(data?.data?.ambulances ?? []).map((ambulance) => (
              <div key={ambulance.id} className="rounded-lg border border-white/[0.08] bg-surface-dark p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-white font-semibold">{ambulance.callSign}</p>
                  <p className="text-xs text-gray-400">{ambulance.currentLocation} · {ambulance.patientCount} patient(s)</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400">{ambulance.status}</span>
                  {ambulance.status === 'Available' && (
                    <Button
                      size="sm"
                      disabled={isPending}
                      onClick={() => redirectAmbulance({ ambId: ambulance.id, instruction: 'Dispatch to scene' })}
                      className="h-8 bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20"
                    >
                      Dispatch
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </RoleGuard>
  );
}
