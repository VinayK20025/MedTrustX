'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'student'} , {label:'Assessments & Quizzes'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Assessments & Quizzes" 
        description="Test your knowledge with case-based MCQs and module evaluations."
      />
    </div>
  );
}
