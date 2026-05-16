import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useDataFabric } from '../hooks/useDataFabric';
import type { SchemaRegistry } from '../types/data-fabric.types';

export const SchemaRegistryPanel: React.FC = () => {
  const { useSchemas } = useDataFabric();
  const { data: response, isLoading } = useSchemas();

  const schemas = response?.data || [
    { id: '1', schema_name: 'Core_Patient_Profile', version: 3, definition: { type: 'record', fields: [{ name: 'id', type: 'string' }, { name: 'dob', type: 'string' }] } },
    { id: '2', schema_name: 'HL7_Observation_Parsed', version: 1, definition: { type: 'record', fields: [{ name: 'obx_1', type: 'int' }, { name: 'value', type: 'string' }] } }
  ];

  if (isLoading) return <div>Loading schema registry...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Data Schema Registry" />
      <CardBody>
        <div className="space-y-4">
          {schemas.map((s: SchemaRegistry) => (
            <div key={s.id} className="p-4 border border-white/10 rounded-lg bg-white/5">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-bold text-blue-400">{s.schema_name}</p>
                <span className="text-[10px] font-bold bg-gray-700 text-gray-300 px-2 py-1 rounded">
                  v{s.version}
                </span>
              </div>
              <div className="bg-black/50 p-2 rounded font-mono text-[10px] text-gray-400 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(s.definition, null, 2)}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
