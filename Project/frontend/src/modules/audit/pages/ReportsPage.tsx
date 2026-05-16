'use client';

import React from 'react';
import { FileText, Download, Eye, BarChart3 } from 'lucide-react';
import { useAuditDashboard, useExportAuditReport } from '../hooks/useAuditAnalytics';
import { Card, Button, Breadcrumbs } from '@/components/ui';

export const ReportsPage: React.FC = () => {
  const { data, isLoading } = useAuditDashboard();
  const exportReport = useExportAuditReport();

  if (isLoading) return <div className="animate-pulse h-32 bg-white/10 rounded-lg" />;

  const audits = data?.audits || [];
  const completedAudits = audits.filter((a) => a.status === 'Completed');

  // Generate report list based on completed audits and summary data
  const reports = [
    {
      id: 'RPT-001',
      title: 'Audit Program Summary Report',
      type: 'Executive Summary',
      generatedDate: new Date(Date.now() - 5 * 86400000).toISOString(),
      metrics: {
        auditsCompleted: data?.summary?.auditsCompleted || 12,
        openFindings: data?.summary?.openFindings || 8,
        complianceScore: data?.summary?.complianceScore || 87,
      },
    },
    {
      id: 'RPT-002',
      title: 'Quarterly Audit Performance Report',
      type: 'Quarterly Review',
      generatedDate: new Date(Date.now() - 30 * 86400000).toISOString(),
      metrics: {
        auditsCompleted: 5,
        openFindings: 3,
        complianceScore: 82,
      },
    },
    {
      id: 'RPT-003',
      title: 'Control Effectiveness Assessment',
      type: 'Control Evaluation',
      generatedDate: new Date(Date.now() - 15 * 86400000).toISOString(),
      metrics: {
        auditsCompleted: 3,
        openFindings: 2,
        complianceScore: 85,
      },
    },
    {
      id: 'RPT-004',
      title: 'Finding & Remediation Tracking Report',
      type: 'Findings Analysis',
      generatedDate: new Date(Date.now() - 10 * 86400000).toISOString(),
      metrics: {
        auditsCompleted: 2,
        openFindings: 4,
        complianceScore: 88,
      },
    },
    {
      id: 'RPT-005',
      title: 'Standards Compliance Mapping Report',
      type: 'Compliance Mapping',
      generatedDate: new Date(Date.now() - 45 * 86400000).toISOString(),
      metrics: {
        auditsCompleted: 1,
        openFindings: 1,
        complianceScore: 90,
      },
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Executive Summary':
        return 'bg-info/20 text-info-light border-info/30';
      case 'Quarterly Review':
        return 'bg-success/20 text-success-light border-success/30';
      case 'Control Evaluation':
        return 'bg-warning/20 text-warning-light border-warning/30';
      case 'Findings Analysis':
        return 'bg-emergency/20 text-emergency-light border-emergency/30';
      default:
        return 'bg-white/10 text-white border-white/20';
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        pages={[
          { name: 'Audit Management', href: '/dashboard/audit' },
          { name: 'Reports', href: '/dashboard/audit/reports' },
        ]}
      />

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-white/60">Audits Completed</p>
          <p className="text-3xl font-bold text-success-light mt-2">{data?.summary?.totalControls || 12}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-white/60">Active Audits</p>
          <p className="text-3xl font-bold text-info-light mt-2">{data?.summary?.activeAudits || 2}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-white/60">Open Findings</p>
          <p className="text-3xl font-bold text-warning-light mt-2">{data?.summary?.openFindings || 8}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-white/60">Compliance Score</p>
          <p className="text-3xl font-bold text-white mt-2">{data?.summary?.overallScore || 87}%</p>
        </Card>
      </div>

      {/* Reports Library */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Audit Reports</h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => exportReport.mutate()}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Export All
            </Button>
          </div>
        </div>

        <div className="divide-y divide-white/10">
          {reports.map((report) => (
            <div
              key={report.id}
              className="p-6 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 rounded-lg bg-white/10 flex-shrink-0">
                    <FileText className="w-5 h-5 text-info-light" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-lg">{report.title}</h4>
                    <div className="flex items-center gap-3 mt-2">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${getTypeColor(report.type)}`}
                      >
                        {report.type}
                      </span>
                      <span className="text-xs text-white/60">
                        Generated {new Date(report.generatedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                  <Button variant="secondary" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </div>

              {/* Report Metrics Summary */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-white/[0.02] rounded">
                <div className="text-center">
                  <p className="text-xs text-white/60">Audits</p>
                  <p className="text-sm font-semibold text-white mt-1">
                    {report.metrics.auditsCompleted}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-white/60">Findings</p>
                  <p className="text-sm font-semibold text-warning-light mt-1">
                    {report.metrics.openFindings}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-white/60">Score</p>
                  <p className="text-sm font-semibold text-success-light mt-1">
                    {report.metrics.complianceScore}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Standards Compliance Report */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Standards Compliance Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-white/80 font-semibold">Control</th>
                <th className="text-center py-3 px-4 text-white/80 font-semibold">ISO 27001</th>
                <th className="text-center py-3 px-4 text-white/80 font-semibold">NABH</th>
                <th className="text-center py-3 px-4 text-white/80 font-semibold">JCI</th>
                <th className="text-center py-3 px-4 text-white/80 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.mappings?.slice(0, 5).map((mapping, idx) => (
                <tr
                  key={idx}
                  className="border-b border-white/10 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 px-4 text-white">{mapping.controlTitle}</td>
                  <td className="text-center py-3 px-4">
                    {mapping.standard === 'ISO 27001' ? (
                      <span className="text-xs px-2 py-1 bg-success/20 text-success-light rounded font-semibold">
                        ✓ {mapping.status}
                      </span>
                    ) : (
                      <span className="text-xs text-white/50">-</span>
                    )}
                  </td>
                  <td className="text-center py-3 px-4">
                    {mapping.standard === 'NABH' ? (
                      <span
                        className={`text-xs px-2 py-1 rounded font-semibold ${
                          mapping.status === 'Compliant'
                            ? 'bg-success/20 text-success-light'
                            : mapping.status === 'Partial'
                              ? 'bg-warning/20 text-warning-light'
                              : 'bg-emergency/20 text-emergency-light'
                        }`}
                      >
                        {mapping.status}
                      </span>
                    ) : (
                      <span className="text-xs text-white/50">-</span>
                    )}
                  </td>
                  <td className="text-center py-3 px-4">
                    {mapping.standard === 'JCI' ? (
                      <span
                        className={`text-xs px-2 py-1 rounded font-semibold ${
                          mapping.status === 'Compliant'
                            ? 'bg-success/20 text-success-light'
                            : 'bg-emergency/20 text-emergency-light'
                        }`}
                      >
                        {mapping.status}
                      </span>
                    ) : (
                      <span className="text-xs text-white/50">-</span>
                    )}
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-xs text-white/70">Last: {new Date(mapping.lastVerified).toLocaleDateString()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
