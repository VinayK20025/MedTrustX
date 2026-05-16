'use client';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useEcDashboard, useEcUpdateTask } from '@/modules/emergency-coord';

const EC_ROLES = ['emergency_coordinator', 'er_physician', 'hospital_admin', 'super_admin'];

export default function EcSubPage() {
  const { data } = useEcDashboard({});
  const tasks = data?.data?.tasks ?? [];
  const { mutate: updateTask, isPending } = useEcUpdateTask();

  return (
    <RoleGuard roles={EC_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1600px]">
        <Breadcrumbs items={[{ label: 'Emergency Coord' }, { label: 'Tasks' }]} />
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader className="border-b border-white/[0.04] px-5 py-4">
            <div>
              <h3 className="text-lg font-semibold text-white tracking-wide">Task Board</h3>
              <p className="text-xs text-gray-400 mt-0.5">Cross-team operational tasks and coordination steps</p>
            </div>
          </CardHeader>
          <CardBody className="p-4 space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.08] bg-surface-dark p-3">
                <div>
                  <p className="text-white font-semibold">{task.title}</p>
                  <p className="text-xs text-gray-400">{task.owner} · {task.department}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400">{task.status}</span>
                  {task.status !== 'Done' && (
                    <Button
                      size="sm"
                      disabled={isPending}
                      onClick={() => updateTask({ id: task.id, status: 'Done' })}
                      className="h-8 bg-success/15 text-success-light border border-success/20 hover:bg-success/20"
                    >
                      Complete
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
