'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useTreatmentPlansDashboard, useTreatmentPlans } from '../hooks/useTreatmentPlans';
import { Activity, ClipboardList, CheckCircle, Clock, AlertCircle, FileText, ArrowRight } from 'lucide-react';

export function TreatmentPlansDashboard() {
  const { data: dashboardData, isLoading: loadingDashboard } = useTreatmentPlansDashboard();
  const { data: plans, isLoading: loadingPlans } = useTreatmentPlans();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Treatment Plans</h1>
          <p className="text-gray-400 mt-1 text-sm">Manage patient care pathways and adherence</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" dot>System Live</Badge>
          <button className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-teal-500/20">
            Create Plan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card-hover p-5 border-l-2 border-teal-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Active Plans</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {loadingDashboard ? <Spinner size="sm" /> : (dashboardData?.totalActivePlans || 0)}
              </h3>
            </div>
            <div className="p-2 bg-teal-500/10 rounded-lg">
              <ClipboardList className="w-5 h-5 text-teal-400" />
            </div>
          </div>
        </div>

        <div className="glass-card-hover p-5 border-l-2 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Overall Adherence</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {loadingDashboard ? <Spinner size="sm" /> : `${dashboardData?.overallAdherenceRate?.toFixed(1) || 0}%`}
              </h3>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="glass-card-hover p-5 border-l-2 border-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Pending Reviews</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {loadingDashboard ? <Spinner size="sm" /> : (dashboardData?.pendingReviewsCount || 0)}
              </h3>
            </div>
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="glass-card-hover p-5 border-l-2 border-emergency">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Critical Interventions</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {loadingDashboard ? <Spinner size="sm" /> : (dashboardData?.criticalInterventionsCount || 0)}
              </h3>
            </div>
            <div className="p-2 bg-emergency/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-emergency-light" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Recent Treatment Plans" subtitle="Latest assigned and updated pathways" />
          <CardBody className="p-0">
            {loadingPlans ? (
              <div className="flex justify-center p-8"><Spinner /></div>
            ) : (plans || []).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                      <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Patient</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Diagnosis</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Adherence</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {plans?.slice(0, 5).map((plan: any) => (
                      <tr key={plan.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center">
                              <span className="text-xs font-bold text-teal-400">{plan.patientId?.substring(0, 2) || 'PT'}</span>
                            </div>
                            <span className="text-sm font-medium text-white">{plan.patientId}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-300">{plan.diagnosisCode}</td>
                        <td className="px-5 py-3">
                          <Badge variant={plan.status === 'active' ? 'success' : plan.status === 'draft' ? 'warning' : 'secondary'} size="sm">
                            {plan.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-700 rounded-full h-1.5 max-w-[60px]">
                              <div className="bg-teal-400 h-1.5 rounded-full" style={{ width: `${plan.adherenceRate || 0}%` }}></div>
                            </div>
                            <span className="text-xs text-gray-400">{plan.adherenceRate || 0}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button className="text-gray-400 hover:text-teal-400 transition-colors">
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">
                No active treatment plans found.
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Plan Analytics" subtitle="Distribution by department" />
          <CardBody className="p-4">
            {loadingDashboard ? (
              <div className="flex justify-center p-8"><Spinner /></div>
            ) : (
              <div className="space-y-4">
                {(dashboardData?.plansByDepartment || []).map((dept: any, idx: number) => (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-sm text-gray-300">
                      <span>{dept.departmentId}</span>
                      <span className="font-mono text-white">{dept.count}</span>
                    </div>
                    <div className="w-full bg-white/[0.05] rounded-full h-1.5">
                      <div 
                        className="bg-purple-400 h-1.5 rounded-full" 
                        style={{ width: `${(dept.count / dashboardData!.totalActivePlans) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                {(dashboardData?.plansByDepartment?.length === 0) && (
                   <div className="p-8 text-center text-gray-500 text-sm">No analytics available yet.</div>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
