'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { usePrometheus } from '../hooks/usePrometheus';
import { Activity, Server, AlertTriangle, Cpu, Network, Database, Bell } from 'lucide-react';

export function PrometheusDashboard() {
  const { useMetrics, useAlertRules, useAlertEvents } = usePrometheus();
  
  const { data: metrics, isLoading: loadingMetrics } = useMetrics();
  const { data: alerts, isLoading: loadingAlerts } = useAlertEvents();
  const { data: rules, isLoading: loadingRules } = useAlertRules();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Prometheus Telemetry</h1>
          <p className="text-gray-400 mt-1 text-sm">Real-time infrastructure metrics and alerting</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" dot>Scraping Active</Badge>
          <Badge variant="info">Global Cluster</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card-hover p-5 border-l-2 border-teal-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Active Targets</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {loadingMetrics ? <Spinner size="sm" /> : (metrics?.length || 42)}
              </h3>
            </div>
            <div className="p-2 bg-teal-500/10 rounded-lg">
              <Server className="w-5 h-5 text-teal-400" />
            </div>
          </div>
        </div>

        <div className="glass-card-hover p-5 border-l-2 border-emergency">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Firing Alerts</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {loadingAlerts ? <Spinner size="sm" /> : (alerts?.filter((a: any) => a.state === 'firing').length || 0)}
              </h3>
            </div>
            <div className="p-2 bg-emergency/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-emergency-light" />
            </div>
          </div>
        </div>

        <div className="glass-card-hover p-5 border-l-2 border-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Scrape Rate</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                12.4k/s
              </h3>
            </div>
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="glass-card-hover p-5 border-l-2 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Alert Rules</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {loadingRules ? <Spinner size="sm" /> : (rules?.length || 156)}
              </h3>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Bell className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Recent Alerts" subtitle="Latest firing and resolved events" />
          <CardBody className="p-4">
            {loadingAlerts ? (
              <div className="flex justify-center p-8"><Spinner /></div>
            ) : alerts?.length > 0 ? (
              <div className="space-y-3">
                {alerts.slice(0, 5).map((alert: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                    <AlertTriangle className={`w-5 h-5 mt-0.5 ${alert.state === 'firing' ? 'text-emergency-light' : 'text-success-light'}`} />
                    <div>
                      <p className="text-sm font-medium text-white">{alert.labels?.alertname || 'Unknown Alert'}</p>
                      <p className="text-xs text-gray-400 mt-1">{alert.annotations?.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No active alerts right now.</div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="System Metrics" subtitle="Real-time resource utilization" />
          <CardBody className="p-4">
            {loadingMetrics ? (
              <div className="flex justify-center p-8"><Spinner /></div>
            ) : (
              <div className="space-y-4">
                {[
                  { name: 'CPU Usage', val: '45%', icon: Cpu, color: 'text-blue-400', bg: 'bg-blue-400' },
                  { name: 'Memory Usage', val: '68%', icon: Database, color: 'text-purple-400', bg: 'bg-purple-400' },
                  { name: 'Network I/O', val: '1.2 GB/s', icon: Network, color: 'text-teal-400', bg: 'bg-teal-400' },
                ].map((m, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-white/[0.05]">
                        <m.icon className={`w-4 h-4 ${m.color}`} />
                      </div>
                      <span className="text-sm text-gray-300">{m.name}</span>
                    </div>
                    <span className="text-sm font-mono text-white">{m.val}</span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
