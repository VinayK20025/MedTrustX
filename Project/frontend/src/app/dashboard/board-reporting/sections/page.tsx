'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ReportSectionsPanel } from '@/modules/board-reporting';

export default function BoardSectionsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Board Reporting' }, { label: 'Report Sections' }]} />
      <ReportSectionsPanel />
    </div>
  );
}
