'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Spinner';
import { TaskBoard, ResidentPatientPanel, ResidentAlertsPanel, useResidentDashboard, useUpdateResidentTask } from '@/modules/resident';

const RESIDENT_ROLES = ['resident', 'hospital_admin', 'super_admin'];

export default function ResidentOrders() {
  const { data, isLoading } = useResidentDashboard({ view: 'tasks' });
  const { mutate: updateTask, isPending } = useUpdateResidentTask();
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();

  useEffect(() => {
    if (!selectedTaskId && data?.data?.tasks?.length) {
      setSelectedTaskId(data.data.tasks.find((task) => task.status !== 'done')?.id ?? data.data.tasks[0].id);
    }
  }, [data, selectedTaskId]);

  const d = data?.data;
  const selectedTask = useMemo(
    () => d?.tasks.find((task) => task.id === selectedTaskId),
    [d?.tasks, selectedTaskId]
  );

  return (
    <RoleGuard roles={RESIDENT_ROLES}>
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <Breadcrumbs items={[{ label: 'Resident Doctor' }, { label: 'Orders Execution' }]} />

        {isLoading ? (
          <Skeleton className="h-[720px] w-full rounded-xl" />
        ) : !d ? (
          <div className="text-gray-500 py-20 text-center">No data available</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {d.kpis.map((kpi) => (
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
              <div className="xl:col-span-7 h-[720px]">
                <TaskBoard tasks={d.tasks} />
              </div>
              <div className="xl:col-span-5 flex flex-col gap-5">
                <ResidentPatientPanel patients={d.patients} />
                <Card className="border-warning/20 shadow-glass bg-surface-light">
                  <CardHeader className="border-b border-white/[0.04] px-5 py-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white tracking-wide">Execution Console</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Track and complete active orders and treatment tasks</p>
                    </div>
                  </CardHeader>
                  <CardBody className="p-4 space-y-3">
                    <div className="rounded-lg border border-white/[0.08] bg-surface-dark p-3">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400">Selected task</p>
                      <p className="text-white font-semibold mt-1">{selectedTask?.title ?? 'Select a task'}</p>
                      <p className="text-xs text-gray-500 mt-1">{selectedTask?.patientName ?? 'No task selected'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        disabled={!selectedTask || isPending}
                        onClick={() => selectedTask && updateTask({ taskId: selectedTask.id, status: 'in_progress' })}
                        className="h-10 bg-warning/15 hover:bg-warning/20 text-warning-light border border-warning/20"
                      >
                        Start
                      </Button>
                      <Button
                        disabled={!selectedTask || isPending}
                        onClick={() => selectedTask && updateTask({ taskId: selectedTask.id, status: 'done' })}
                        className="h-10 bg-success/15 hover:bg-success/20 text-success-light border border-success/20"
                      >
                        Complete
                      </Button>
                    </div>
                  </CardBody>
                </Card>
                <div className="h-[280px]"><ResidentAlertsPanel alerts={d.alerts} /></div>
              </div>
            </div>
          </>
        )}
      </div>
    </RoleGuard>
  );
}
