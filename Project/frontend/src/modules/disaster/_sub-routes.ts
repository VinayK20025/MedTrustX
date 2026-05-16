'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';

const pages = [
  { route: 'incidents', label: 'Incident Management', desc: 'Activate, track, escalate, and close disaster incidents by code and severity.' },
  { route: 'preparedness', label: 'Preparedness Plans', desc: 'Manage HDMP documents, drill schedules, and pre-assigned response teams.' },
  { route: 'resources', label: 'Resource Command', desc: 'Real-time beds, ventilators, blood units, and surgical kit allocation.' },
  { route: 'communication', label: 'Mass Communications', desc: 'Broadcast emergency alerts via PA, SMS, and in-app notifications.' },
  { route: 'recovery', label: 'Recovery Tracking', desc: 'Monitor post-incident recovery, system restoration, and patient safety checks.' },
  { route: 'review', label: 'Post-Incident Review', desc: 'Root cause analysis, performance metrics, and protocol improvements.' },
  { route: 'reports', label: 'Disaster Reports', desc: 'Export incident reports, response timelines, and resource utilization logs.' },
];

export default function DisasterSubPagesPlaceholder() {
  return null; // Individual sub-pages created below
}
