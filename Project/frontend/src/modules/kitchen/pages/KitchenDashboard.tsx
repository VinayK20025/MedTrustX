'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { MealTasksPanel } from '../components/MealTasksPanel';
import { KitchenWorkspace } from '../components/KitchenWorkspace';
import { useKitchenDashboard } from '../hooks/useKitchenAnalytics';
import type { KitchenKPI } from '../types/kitchen.types';
import { ChefHat, AlertTriangle } from 'lucide-react';

function KitKPICard({ kpi }: { kpi: KitchenKPI }) {
  const sc: Record<string, string> = { success: 'border-success/20 bg-success/[0.02]', normal: 'border-white/[0.06]', warning: 'border-warning/20 bg-warning/[0.02]', critical: 'border-emergency/20 bg-emergency/[0.04]' };
  const vc: Record<string, string> = { success: 'text-success-light', normal: 'text-white', warning: 'text-warning-light', critical: 'text-emergency-light' };

  return (
    <div className={cn('rounded-xl border p-4 flex flex-col justify-between shadow-glass-sm', sc[kpi.status])}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.label}</p>
      <div className="flex items-end justify-between mt-2">
        <p className={cn('text-3xl font-black font-mono', vc[kpi.status])}>{kpi.value}</p>
      </div>
    </div>
  );
}

export function KitchenDashboard() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useKitchenDashboard({});
  const [selectedMealId, setSelectedMealId] = useState<string | undefined>();

  useEffect(() => {
    setPageMeta('Diet Kitchen Worker', 'Patient-specific meal preparation, diet adherence, and kitchen hygiene');
  }, [setPageMeta]);

  useEffect(() => {
    if (data?.data?.meals && !selectedMealId) {
      const active = data.data.meals.find(m => m.status === 'Cooking' || m.status === 'Pending');
      setSelectedMealId(active ? active.id : data.data.meals[0]?.id);
    }
  }, [data, selectedMealId]);

  if (isLoading) return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      <Skeleton className="h-[600px] rounded-xl" />
    </div>
  );

  const d = data?.data;
  if (!d) return <div className="text-gray-500 py-20 text-center">No data available</div>;

  const selectedMeal = d.meals.find(m => m.id === selectedMealId);
  const pendingSpecialDiets = d.meals.filter(m => m.dietType !== 'Normal' && m.status === 'Pending').length;

  return (
    <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto">
      {/* ALERTS BANNER */}
      {pendingSpecialDiets > 0 && (
        <div className="bg-warning/20 border border-warning/40 rounded-xl px-5 py-3 flex items-center gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-warning-light shrink-0" />
          <div className="flex-1">
            <span className="text-[12px] font-black text-warning-light uppercase tracking-widest">SPECIAL DIETS PENDING</span>
            <p className="text-[11px] text-orange-200 mt-0.5">{pendingSpecialDiets} clinical diets require preparation. Ensure strict adherence to clinical instructions and ingredient restrictions.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'Facility Management' }, { label: 'Diet Kitchen Services' }]} />
        <div className="text-[12px] font-bold text-orange-400 flex items-center gap-2 bg-orange-500/10 px-4 py-2 rounded-lg border border-orange-500/25">
          <ChefHat className="w-4 h-4" /> Nutrition Tracking Active
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {d.kpis.map(k => <KitKPICard key={k.id} kpi={k} />)}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-[calc(100vh-290px)] min-h-[600px]">
        <div className="xl:col-span-4 h-full">
          <MealTasksPanel meals={d.meals} selectedId={selectedMealId} onSelect={setSelectedMealId} />
        </div>
        <div className="xl:col-span-8 h-full">
          <KitchenWorkspace meal={selectedMeal} hygiene={d.hygiene} />
        </div>
      </div>
    </div>
  );
}
