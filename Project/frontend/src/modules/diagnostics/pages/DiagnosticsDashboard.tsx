'use client';

import React from 'react';
import { DiagnosticsWorkspace } from '../components/DiagnosticsWorkspace';

export function DiagnosticsDashboard({ roleTitle, isQualityView }: { roleTitle?: string, isQualityView?: boolean }) {
  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px]">
      <DiagnosticsWorkspace roleTitle={roleTitle} isQualityView={isQualityView} />
    </div>
  );
}
