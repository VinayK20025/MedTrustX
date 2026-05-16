'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { 
  GraduationCap, BookOpen, Users, ClipboardList, Award,
  Search, RefreshCw, Star, Clock, Calendar, CheckCircle,
  AlertTriangle, Book, School, Presentation, Trophy, ArrowRight
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { 
  useMedEdDashboard, 
  useEnrollStudent 
} from '../hooks/useMedEd';

type Tab = 'curriculum' | 'students' | 'exams';

const statusColor: Record<string, string> = {
  'Active': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Completed': 'text-success-light bg-success/10 border-success/30',
  'Pending': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Scheduled': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  'In Progress': 'text-amber-400 bg-amber-500/10 border-amber-500/30 animate-pulse',
  'Graded': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
};

const fmtDate = (iso: string) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export function MedEdDashboard() {
  const { data, isLoading, isRefetching, refetch } = useMedEdDashboard();
  const enroll = useEnrollStudent();

  const [tab, setTab] = useState<Tab>('curriculum');
  const [search, setSearch] = useState('');

  const dbData = data?.data;
  const metrics = dbData?.metrics;

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'curriculum', label: 'Curriculum & Courses', icon: BookOpen },
    { key: 'students', label: 'Student Directory', icon: Users },
    { key: 'exams', label: 'Exams & Assessments', icon: ClipboardList },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <GraduationCap className="w-7 h-7 text-indigo-400" /> Medical Education Center
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Academic Excellence · Clinical Training · Certification Management
          </p>
        </div>
        <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5" onClick={() => refetch()} disabled={isRefetching}>
          <RefreshCw className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')} /> Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Enrolled', value: metrics?.totalStudents, color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: Users },
          { label: 'Active Courses', value: metrics?.activeCourses, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: Book },
          { label: 'Upcoming Exams', value: metrics?.upcomingExams, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Presentation },
          { label: 'Pass Rate', value: `${metrics?.passRatePercent}%`, color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: Trophy },
          { label: 'CME Hours', value: metrics?.cmeHoursDelivered, color: 'text-indigo-300', bg: 'bg-indigo-500/10', icon: Award },
        ].map((s, i) => (
          <Card key={i} className="p-4 border-white/[0.06] bg-surface-dark flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
            <div>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold">{s.label}</p>
              <p className={`text-xl font-bold mt-1 ${s.color}`}>
                {isLoading ? <Spinner size="sm" /> : String(s.value || 0)}
              </p>
            </div>
            <div className={`p-2.5 rounded-xl ${s.bg} group-hover:scale-110 transition-transform`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 p-1 bg-black/30 border border-white/[0.06] rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
              tab === t.key ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30' : 'text-gray-400 hover:text-white hover:bg-white/5')}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder={`Search ${tab}...`}
          className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-indigo-500/50" 
        />
      </div>

      {/* TAB: Curriculum */}
      {tab === 'curriculum' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? <div className="flex justify-center p-16 col-span-full"><Spinner size="lg" /></div> : 
            dbData?.courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase())).map(c => (
              <Card key={c.id} className="p-5 border-white/[0.06] bg-surface-dark hover:bg-white/[0.02] transition-colors group flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <Badge variant="outline" className="text-[10px] bg-white/5 border-white/10 text-indigo-300 font-mono">
                    {c.code}
                  </Badge>
                  <Badge variant="outline" className={cn('text-[10px]', statusColor[c.status])}>
                    {c.status}
                  </Badge>
                </div>
                <h3 className="font-bold text-white text-base mb-1 group-hover:text-indigo-400 transition-colors">{c.title}</h3>
                <p className="text-[11px] text-gray-500 mb-4 italic">Led by {c.instructor}</p>
                
                <div className="grid grid-cols-2 gap-3 mb-4 mt-auto">
                  <div className="bg-black/20 rounded-lg p-2.5 border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase">Enrollment</p>
                    <p className="text-sm font-bold text-white mt-0.5">{c.enrollmentCount} Students</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-2.5 border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase">Credits</p>
                    <p className="text-sm font-bold text-indigo-400 mt-0.5">{c.credits} ECTS</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs border-t border-white/[0.04] pt-3">
                  <span className="text-gray-400 flex items-center gap-1.5 font-mono"><Calendar className="w-3 h-3" /> {fmtDate(c.nextSession)}</span>
                  <Button size="sm" variant="ghost" className="h-7 text-[11px] text-indigo-400 hover:text-indigo-300 hover:bg-white/5">
                    Course Details <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </Card>
            ))
          }
        </div>
      )}

      {/* TAB: Students */}
      {tab === 'students' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['Student ID', 'Full Name', 'Level & Dept', 'Year', 'Academic Progress', 'Mentor'].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dbData?.students.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map(s => {
                    const progress = (s.completedCredits / s.totalRequiredCredits) * 100;
                    return (
                      <tr key={s.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-4 pl-6 font-mono text-indigo-300 text-xs">{s.id}</td>
                        <td className="py-4 px-4 font-bold text-white text-sm">{s.name}</td>
                        <td className="py-4 px-4">
                          <p className="text-xs text-white">{s.type}</p>
                          <p className="text-[10px] text-gray-500">{s.department}</p>
                        </td>
                        <td className="py-4 px-4 text-white font-bold">{s.yearOfStudy}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full w-24">
                              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progress}%` }} />
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono">{s.completedCredits}/{s.totalRequiredCredits}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-400">{s.mentor}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* TAB: Exams */}
      {tab === 'exams' && (
        <Card className="border-white/[0.06] bg-surface-dark min-h-[400px]">
          {isLoading ? <div className="flex justify-center p-16"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-black/40 border-b border-white/[0.04]">
                  <tr>
                    {['Exam Title', 'Date', 'Students', 'Avg Score', 'Status', ''].map((h, i) => (
                      <th key={i} className={cn('py-3 text-gray-500 font-semibold uppercase text-[10px] tracking-widest', i === 0 ? 'pl-6 text-left' : i === 5 ? 'pr-6 text-right' : 'px-4 text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {dbData?.exams.filter(e => e.title.toLowerCase().includes(search.toLowerCase())).map(e => (
                    <tr key={e.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 pl-6 font-bold text-white text-sm">{e.title}</td>
                      <td className="py-4 px-4 text-xs text-gray-400">{fmtDate(e.date)}</td>
                      <td className="py-4 px-4 text-white font-mono">{e.studentCount}</td>
                      <td className="py-4 px-4">
                        {e.averageScore ? (
                          <span className="text-emerald-400 font-bold">{e.averageScore}%</span>
                        ) : <span className="text-gray-600">Pending</span>}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn('text-[10px] px-2', statusColor[e.status])}>
                          {e.status}
                        </Badge>
                      </td>
                      <td className="py-4 pr-6 text-right">
                        <Button size="sm" variant="ghost" className="h-7 text-[11px] text-gray-400 hover:text-white">
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
