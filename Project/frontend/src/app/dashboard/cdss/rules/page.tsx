'use client';

import { Card, Skeleton, Button, Badge } from '@/design-system';
import { useUIStore } from '@/store/ui.store';
import { useEffect, useState } from 'react';
import { useCDSSRules, useCreateCDSSRule, useUpdateCDSSRule } from '@/modules/cdss/hooks/useCDSS';
import { RoleGuard } from '@/components/guards/AuthGuard';

export default function RulesPage() {
  const setPageMetadata = useUIStore((s) => s.setPageMetadata);
  const { data, isLoading } = useCDSSRules();
  const { mutate: createRule } = useCreateCDSSRule();
  const { mutate: updateRule } = useUpdateCDSSRule();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ruleType: '',
  });

  useEffect(() => {
    setPageMetadata({
      title: 'Rules',
      breadcrumbs: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'CDSS', href: '/dashboard/cdss' },
        { label: 'Rules' },
      ],
    });
  }, [setPageMetadata]);

  const handleCreateRule = () => {
    if (formData.name && formData.ruleType) {
      createRule({
        name: formData.name,
        description: formData.description,
        ruleType: formData.ruleType,
        definition: {},
        active: true,
      });
      setFormData({ name: '', description: '', ruleType: '' });
      setShowCreateForm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  const activeRules = data?.filter((r) => r.active).length || 0;
  const inactiveRules = data?.filter((r) => !r.active).length || 0;

  return (
    <RoleGuard
      roles={['clinical-informaticist', 'ai-governance-officer', 'super-admin']}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">CDSS Rules Management</h1>
          <Button
            variant="default"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? '✕ Cancel' : '+ New Rule'}
          </Button>
        </div>

        {/* Rules Summary */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 border-l-4 border-l-green-500 bg-green-50">
            <p className="text-sm text-gray-600">Active Rules</p>
            <p className="text-3xl font-bold mt-2 text-green-600">{activeRules}</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-gray-400 bg-gray-50">
            <p className="text-sm text-gray-600">Inactive Rules</p>
            <p className="text-3xl font-bold mt-2 text-gray-600">{inactiveRules}</p>
          </Card>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card className="p-6 bg-blue-50 border-l-4 border-l-blue-500">
            <h3 className="font-semibold mb-4">Create New Rule</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Rule Name</label>
                <input
                  type="text"
                  placeholder="e.g., Sepsis Screening"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full mt-1 p-2 border rounded"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Rule Type</label>
                <select
                  value={formData.ruleType}
                  onChange={(e) => setFormData({ ...formData, ruleType: e.target.value })}
                  className="w-full mt-1 p-2 border rounded"
                >
                  <option value="">Select Type</option>
                  <option value="Infection Risk">Infection Risk</option>
                  <option value="Metabolic">Metabolic</option>
                  <option value="Renal">Renal</option>
                  <option value="Cardiac">Cardiac</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Description (optional)</label>
                <textarea
                  placeholder="Rule description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full mt-1 p-2 border rounded"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="default" onClick={handleCreateRule}>
                  Create Rule
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Rules List */}
        <div className="space-y-3">
          {data?.map((rule) => (
            <Card
              key={rule.id}
              className={`p-6 border-l-4 ${
                rule.active ? 'border-l-green-500' : 'border-l-gray-400'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{rule.name}</h3>
                    <Badge variant={rule.active ? 'secondary' : 'outline'}>
                      {rule.active ? '✓ Active' : '⏸ Inactive'}
                    </Badge>
                    <Badge variant="outline">{rule.ruleType}</Badge>
                  </div>

                  {rule.description && (
                    <p className="text-sm text-gray-600 mt-2">{rule.description}</p>
                  )}

                  <div className="mt-3 text-xs text-gray-500">
                    <p>Created: {new Date(rule.createdAt).toLocaleString()}</p>
                    <p>Last Modified: {new Date(rule.lastModifiedAt).toLocaleString()}</p>
                    {rule.createdBy && <p>Created by: {rule.createdBy}</p>}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateRule({
                      ruleId: rule.id,
                      ruleData: { ...rule, active: !rule.active },
                    });
                  }}
                  className="ml-4"
                >
                  {rule.active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </RoleGuard>
  );
}
