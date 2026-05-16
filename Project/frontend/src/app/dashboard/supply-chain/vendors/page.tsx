'use client';
import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useContactVendor, useSupplyChainDashboard } from '@/modules/supply-chain';

const SUPPLY_CHAIN_ROLES = ['supply_chain_coordinator', 'super_admin', 'procurement_manager', 'inventory_manager'];

export default function SupplyChainVendorsPage() {
  const { data, isLoading } = useSupplyChainDashboard({});
  const contactVendor = useContactVendor();
  const vendors = data?.data.vendors || [];

  return (
    <RoleGuard roles={SUPPLY_CHAIN_ROLES}>
      <div className="space-y-5 animate-fade-in">
        <Breadcrumbs items={[{ label: 'Supply Chain Coordinator' }, { label: 'Vendors' }]} />
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Vendor Performance" subtitle="On-time delivery, rating, and active order footprint" />
          <CardBody>
            {isLoading ? (
              <p className="text-gray-500">Loading vendors...</p>
            ) : (
              <div className="space-y-2">
                {vendors.map((vendor) => (
                  <div key={vendor.id} className="rounded-lg border border-white/[0.08] bg-surface-dark p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-white font-semibold">{vendor.name}</p>
                      <p className="text-xs text-gray-400">On-time: {vendor.onTimeRate}% | Rating: {vendor.rating} | Active Orders: {vendor.activeOrders}</p>
                    </div>
                    <button
                      className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50"
                      disabled={contactVendor.isPending}
                      onClick={() => contactVendor.mutate(vendor.id)}
                    >
                      Contact Vendor
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </RoleGuard>
  );
}
