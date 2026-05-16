'use client';
import React from 'react';
import { ChartCard } from './ChartCard';
import type { HospitalComparison } from '../types/board.types';

interface MultiHospitalComparisonProps {
  data: HospitalComparison[];
  className?: string;
}

export function MultiHospitalComparison({ data, className }: MultiHospitalComparisonProps) {
  return (
    <ChartCard 
      title="Multi-Hospital Benchmark" 
      subtitle="Comparative analysis across managed facilities"
      className={className}
      bodyClassName="p-0"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-white/[0.02] border-b border-white/[0.06]">
            <tr>
              <th className="px-6 py-4 font-medium">Facility</th>
              <th className="px-6 py-4 font-medium text-right">Revenue (YTD)</th>
              <th className="px-6 py-4 font-medium text-right">Occupancy</th>
              <th className="px-6 py-4 font-medium text-right">Mortality Rate</th>
              <th className="px-6 py-4 font-medium text-right">Compliance Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {data.map((hospital) => (
              <tr key={hospital.hospitalId} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-200">{hospital.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5 font-mono">{hospital.hospitalId}</p>
                </td>
                <td className="px-6 py-4 text-right font-medium text-white">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(hospital.revenue)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-gray-300">{hospital.occupancyRate.toFixed(1)}%</span>
                    <div className="w-16 h-1.5 bg-white/[0.1] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-teal-500" 
                        style={{ width: `${hospital.occupancyRate}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    hospital.mortalityRate > 3.0 ? 'bg-emergency/10 text-emergency-light' : 'bg-success/10 text-success-light'
                  }`}>
                    {hospital.mortalityRate.toFixed(2)}%
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`font-semibold ${
                    hospital.complianceScore < 90 ? 'text-warning-light' : 'text-success-light'
                  }`}>
                    {hospital.complianceScore}/100
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}
