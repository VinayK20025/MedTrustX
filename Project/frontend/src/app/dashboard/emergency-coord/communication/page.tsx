'use client';
import { useState } from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useEcBroadcast, useEcDashboard } from '@/modules/emergency-coord';

const EC_ROLES = ['emergency_coordinator', 'er_physician', 'hospital_admin', 'super_admin'];

export default function EcSubPage() {
  const { data } = useEcDashboard({});
  const { mutate: broadcast, isPending } = useEcBroadcast();
  const [message, setMessage] = useState('');

  return (
    <RoleGuard roles={EC_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1600px]">
        <Breadcrumbs items={[{ label: 'Emergency Coord' }, { label: 'Communication' }]} />
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <Card className="xl:col-span-7 border-white/[0.06] shadow-glass bg-surface-light">
            <CardHeader className="border-b border-white/[0.04] px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-white tracking-wide">Broadcast Center</h3>
                <p className="text-xs text-gray-400 mt-0.5">Send concise instructions to ER, ICU, ambulance, and transport teams</p>
              </div>
            </CardHeader>
            <CardBody className="p-4 space-y-3">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={5}
                placeholder="Broadcast message to all active emergency teams..."
                className="w-full rounded-xl border border-white/10 bg-surface-dark px-4 py-3 text-sm text-white outline-none focus:border-indigo-400"
              />
              <div className="flex flex-wrap gap-2">
                {['Prepare ER Bay 2 for incoming Red patient', 'Request ICU bed confirmation', 'Escalate transport standby'].map((template) => (
                  <button
                    key={template}
                    type="button"
                    onClick={() => setMessage(template)}
                    className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-gray-300 hover:bg-white/5"
                  >
                    {template}
                  </button>
                ))}
              </div>
              <Button
                disabled={isPending || !message.trim()}
                onClick={() => broadcast(message)}
                className="h-10 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30"
              >
                Broadcast Message
              </Button>
            </CardBody>
          </Card>
          <Card className="xl:col-span-5 border-white/[0.06] shadow-glass bg-surface-light">
            <CardHeader className="border-b border-white/[0.04] px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-white tracking-wide">Flow Pressure</h3>
                <p className="text-xs text-gray-400 mt-0.5">Queue and task load informing broadcast priority</p>
              </div>
            </CardHeader>
            <CardBody className="p-4 space-y-3 text-sm">
              <div className="rounded-lg border border-white/[0.08] bg-surface-dark p-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-400">Patients in flow</p>
                <p className="text-2xl font-bold text-white mt-1">{data?.data?.patients.length ?? 0}</p>
              </div>
              <div className="rounded-lg border border-white/[0.08] bg-surface-dark p-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-400">Open tasks</p>
                <p className="text-2xl font-bold text-white mt-1">{(data?.data?.tasks ?? []).filter((task) => task.status !== 'Done').length}</p>
              </div>
              <div className="rounded-lg border border-white/[0.08] bg-surface-dark p-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-400">Available ambulances</p>
                <p className="text-2xl font-bold text-white mt-1">{(data?.data?.ambulances ?? []).filter((ambulance) => ambulance.status === 'Available').length}</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
