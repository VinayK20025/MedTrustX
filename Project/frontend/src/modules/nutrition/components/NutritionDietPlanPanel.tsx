'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { NutritionDietPlan } from '../types/nutrition.types';
import { Utensils, Edit3, Droplet, Flame } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { plan?: NutritionDietPlan; }

export function NutritionDietPlanPanel({ plan }: Props) {
  if (!plan) return <div className="p-10 text-center text-gray-500 border border-white/5 rounded-xl bg-surface-light">No active diet plan selected.</div>;

  return (
    <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full flex flex-col">
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-orange-500/15"><Utensils className="w-4 h-4 text-orange-400" /></div>
          <div>
            <h3 className="text-[15px] font-bold text-white tracking-wide">Active Diet Plan</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">{plan.templateName}</p>
          </div>
        </div>
        <Button size="sm" variant="ghost" leftIcon={<Edit3 className="w-3 h-3" />} className="text-gray-400">
          Modify
        </Button>
      </CardHeader>

      <CardBody className="p-0 flex-1 overflow-y-auto max-h-[450px]">
        <div className="p-4 border-b border-white/[0.04] bg-surface-dark grid grid-cols-3 gap-2 text-center">
           <div>
             <span className="text-[9px] text-gray-500 uppercase font-bold flex items-center justify-center gap-1 mb-1"><Flame className="w-3 h-3 text-orange-400"/> Calories</span>
             <span className="text-sm font-black text-white">{plan.dailyCaloriesTarget} <span className="text-[10px] text-gray-500 font-normal">kcal</span></span>
           </div>
           <div>
             <span className="text-[9px] text-gray-500 uppercase font-bold mb-1 block">Protein</span>
             <span className="text-sm font-black text-white">{plan.dailyProteinTarget} <span className="text-[10px] text-gray-500 font-normal">g</span></span>
           </div>
           <div>
             <span className="text-[9px] text-gray-500 uppercase font-bold flex items-center justify-center gap-1 mb-1"><Droplet className="w-3 h-3 text-blue-400"/> Fluids</span>
             <span className="text-sm font-black text-white">{plan.fluidRestriction ? `${plan.fluidRestriction} mL` : 'Ad lib'}</span>
           </div>
        </div>

        <div className="divide-y divide-white/[0.03]">
          {plan.meals.map(meal => (
            <div key={meal.id} className="p-5 hover:bg-white/[0.015] transition-colors">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-[13px] font-bold text-white flex items-center gap-2">
                  {meal.type}
                  <span className="text-[10px] text-gray-500 font-normal">{meal.time}</span>
                </h4>
                <span className="text-[11px] font-bold text-orange-300">{meal.totalCalories} kcal</span>
              </div>
              <ul className="space-y-2">
                {meal.items.map((item, i) => (
                  <li key={i} className="flex justify-between items-start text-[11px]">
                    <span className="text-gray-300">• {item.name}</span>
                    <span className="text-gray-500 text-[10px] w-24 text-right">
                      {item.carbs}g C | {item.protein}g P | {item.fat}g F
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
