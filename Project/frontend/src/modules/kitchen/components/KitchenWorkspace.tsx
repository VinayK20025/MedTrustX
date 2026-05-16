'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { MealTask, HygieneChecklist } from '../types/kitchen.types';
import { useUpdateMealStatus, useToggleHygiene } from '../hooks/useKitchenAnalytics';
import { ChefHat, Flame, PackageCheck, Send, Info, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { meal?: MealTask; hygiene: HygieneChecklist[]; }

export function KitchenWorkspace({ meal, hygiene }: Props) {
  const { mutate: updateStatus } = useUpdateMealStatus();
  const { mutate: toggleHygiene } = useToggleHygiene();
  const [tab, setTab] = useState<'prep' | 'hygiene'>('prep');

  return (
    <Card className="border-orange-500/20 shadow-glass bg-[#030201] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-800 via-orange-500 to-yellow-400" />

      <CardHeader className="border-b border-white/[0.04] px-5 py-4">
        <h3 className="text-[16px] font-black text-white flex items-center gap-2">
          <ChefHat className="w-5 h-5 text-orange-400" /> Diet Kitchen Operations
        </h3>
        <p className="text-[11px] text-gray-500 mt-0.5">Prepare clinical meals exactly to prescribed diet charts and maintain station hygiene.</p>
      </CardHeader>

      <div className="flex border-b border-white/[0.05] px-5 bg-black/20">
        <button onClick={() => setTab('prep')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors mr-1', tab === 'prep' ? 'text-orange-400 border-orange-400' : 'text-gray-500 border-transparent hover:text-gray-300')}>Meal Prep</button>
        <button onClick={() => setTab('hygiene')} className={cn('flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors', tab === 'hygiene' ? 'text-orange-400 border-orange-400' : 'text-gray-500 border-transparent hover:text-gray-300')}>Hygiene Checklist</button>
      </div>

      <CardBody className="p-0 flex-1 overflow-y-auto">

        {tab === 'prep' && (
          <div className="p-5 flex flex-col h-full">
            {!meal ? (
              <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                <ChefHat className="w-12 h-12 text-orange-500 mb-3" />
                <p className="text-gray-400 font-bold">Select a meal order to begin preparation.</p>
              </div>
            ) : (
              <div className="flex flex-col h-full space-y-4">
                <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{meal.id} • {meal.mealTime}</span>
                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider',
                      meal.dietType === 'Diabetic' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : 
                      meal.dietType === 'Liquid' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                      meal.dietType === 'Low-Salt' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    )}>{meal.dietType} Diet</span>
                  </div>
                  
                  <h3 className="text-[20px] font-black text-white mb-1">{meal.patientName}</h3>
                  <p className="text-[14px] text-gray-400 mb-6">Location: <strong className="text-white">{meal.bed}</strong></p>

                  <div className="mb-6">
                     <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Prescribed Ingredients</p>
                     <div className="flex flex-wrap gap-2">
                        {meal.ingredients.map((ing, idx) => (
                           <span key={idx} className="bg-black/40 border border-white/5 rounded px-2.5 py-1 text-[12px] text-gray-300">{ing}</span>
                        ))}
                     </div>
                  </div>

                  {meal.instructions && (
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 flex items-start gap-2 mb-6">
                      <Info className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">Clinical Instructions</p>
                        <p className="text-[12px] text-orange-200">{meal.instructions}</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-auto grid grid-cols-1 gap-3">
                    {meal.status === 'Pending' && (
                      <Button onClick={() => updateStatus({ id: meal.id, status: 'Cooking' })} className="w-full h-12 bg-orange-500/20 text-orange-400 border border-orange-500/40 hover:bg-orange-500/30" leftIcon={<Flame className="w-4 h-4" />}>Start Cooking</Button>
                    )}
                    {meal.status === 'Cooking' && (
                      <Button onClick={() => updateStatus({ id: meal.id, status: 'Packed' })} className="w-full h-12 bg-blue-500/20 text-blue-400 border border-blue-500/40 hover:bg-blue-500/30" leftIcon={<PackageCheck className="w-4 h-4" />}>Mark as Packed & Labeled</Button>
                    )}
                    {meal.status === 'Packed' && (
                      <Button onClick={() => updateStatus({ id: meal.id, status: 'Delivered' })} className="w-full h-12 bg-success/20 text-success-light border border-success/40 hover:bg-success/30" leftIcon={<Send className="w-4 h-4" />}>Dispatch to Ward</Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'hygiene' && (
          <div className="p-5 space-y-3">
            <div className="bg-success/10 border border-success/30 rounded-xl p-4 flex items-center gap-3 mb-4">
              <ShieldCheck className="w-5 h-5 text-success-light shrink-0" />
              <p className="text-[11px] text-success-light leading-snug">Food safety standards require all hygiene checks to be completed before and after each shift.</p>
            </div>

            {hygiene.map(h => (
               <div key={h.id} onClick={() => toggleHygiene(h.id)}
                 className={cn('p-4 rounded-xl border-2 flex items-center gap-4 cursor-pointer transition-all active:scale-95',
                   h.isCompleted ? 'bg-success/10 border-success/40 text-success-light' : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05] text-white'
                 )}>
                 <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors',
                   h.isCompleted ? 'bg-success/20 text-success-light' : 'bg-white/10 text-gray-400'
                 )}>
                   {h.isCompleted && <CheckCircle2 className="w-5 h-5" />}
                 </div>
                 <span className={cn('text-[14px] font-bold flex-1', h.isCompleted && 'line-through opacity-70')}>{h.task}</span>
               </div>
            ))}
          </div>
        )}

      </CardBody>
    </Card>
  );
}
