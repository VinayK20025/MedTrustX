'use client';

import { Users, Activity, Stethoscope, Siren, Shield, Cpu, Calendar, CreditCard } from 'lucide-react';

const stats = [
  { label: 'Active Patients', value: '2,847', change: '+12%', icon: Users, color: 'from-brand-500 to-brand-700' },
  { label: 'Today\'s Appointments', value: '156', change: '+5%', icon: Calendar, color: 'from-clinical to-clinical-dark' },
  { label: 'ER Cases', value: '23', change: '-3%', icon: Siren, color: 'from-emergency to-emergency-dark' },
  { label: 'Active Consultations', value: '34', change: '+8%', icon: Stethoscope, color: 'from-purple-500 to-purple-700' },
  { label: 'IoMT Devices Online', value: '1,203', change: '99.2%', icon: Cpu, color: 'from-cyan-500 to-cyan-700' },
  { label: 'ZTA Trust Score', value: '94.7%', change: 'Healthy', icon: Shield, color: 'from-clinical to-teal-700' },
  { label: 'Bed Occupancy', value: '78%', change: '312/400', icon: Activity, color: 'from-amber-500 to-amber-700' },
  { label: 'Revenue Today', value: '₹18.2L', change: '+15%', icon: CreditCard, color: 'from-pink-500 to-pink-700' },
];

const recentActivity = [
  { time: '2 min ago', event: 'Patient P-4821 admitted to ICU Ward B', type: 'critical' },
  { time: '5 min ago', event: 'Dr. Sharma completed teleconsult #TC-1247', type: 'info' },
  { time: '8 min ago', event: 'Lab report uploaded for MRN-28471', type: 'success' },
  { time: '12 min ago', event: 'ZTA policy violation: Unknown device blocked', type: 'warning' },
  { time: '15 min ago', event: 'Blood unit B+ve dispatched to OT-3', type: 'info' },
  { time: '20 min ago', event: 'Pharmacy: Low stock alert for Amoxicillin', type: 'warning' },
];

const services = [
  { name: 'patient-service', status: 'healthy', uptime: '99.99%' },
  { name: 'clinical-service', status: 'healthy', uptime: '99.98%' },
  { name: 'icu-service', status: 'healthy', uptime: '99.99%' },
  { name: 'pharmacy-service', status: 'degraded', uptime: '98.5%' },
  { name: 'billing-service', status: 'healthy', uptime: '99.97%' },
  { name: 'zta-service', status: 'healthy', uptime: '100%' },
];

export default function DashboardGrid() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card-hover p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <p className="text-xs text-clinical-light mt-1">{stat.change}</p>
              </div>
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2 glass-card">
          <div className="p-5 border-b border-white/5">
            <h2 className="text-lg font-semibold">Live Activity</h2>
          </div>
          <div className="divide-y divide-white/5">
            {recentActivity.map((item, i) => (
              <div key={i} className="px-5 py-3 flex items-start gap-3 hover:bg-white/5 transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  item.type === 'critical' ? 'bg-emergency animate-pulse' :
                  item.type === 'warning' ? 'bg-amber-400' :
                  item.type === 'success' ? 'bg-clinical' : 'bg-brand-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300">{item.event}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Health */}
        <div className="glass-card">
          <div className="p-5 border-b border-white/5">
            <h2 className="text-lg font-semibold">Service Health</h2>
          </div>
          <div className="p-3 space-y-1">
            {services.map((svc) => (
              <div key={svc.name} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${svc.status === 'healthy' ? 'bg-clinical' : 'bg-amber-400 animate-pulse'}`} />
                  <span className="text-sm font-mono text-gray-300">{svc.name}</span>
                </div>
                <span className="text-xs text-gray-500">{svc.uptime}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
