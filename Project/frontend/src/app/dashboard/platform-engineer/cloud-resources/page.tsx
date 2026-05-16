'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';
export default function Page() {
  return (<div className="space-y-5"><Breadcrumbs items={[{label:'Platform'},{label:'cloud-resources'}]} /><Card className="border-white/[0.06] min-h-[400px] flex items-center justify-center"><CardBody className="text-gray-500 text-center"><p>cloud-resources</p></CardBody></Card></div>);
}