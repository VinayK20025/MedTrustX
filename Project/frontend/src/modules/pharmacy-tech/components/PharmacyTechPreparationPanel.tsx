'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { PreparationTask } from '../types/pharmacyTech.types';
import { useScanPickBarcode, usePrintLabel, useHandoverTask } from '../hooks/usePharmacyTechAnalytics';
import { Package, ScanBarcode, Printer, ArrowRightCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { activePreparation?: PreparationTask; }

export function PharmacyTechPreparationPanel({ activePreparation }: Props) {
  const { mutate: scanBarcode } = useScanPickBarcode();
  const { mutate: printLabel, isPending: isPrinting } = usePrintLabel();
  const { mutate: handover, isPending: isHandingOver } = useHandoverTask();

  if (!activePreparation) return null;

  const allPicked = activePreparation.itemsToPick.every(i => i.scanned);

  return (
    <Card className="border-orange-500/30 shadow-glass bg-[#0a0604] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-orange-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-orange-400">PICKING & PACKING</h3>
        </div>
        <div className="text-[10px] text-gray-400 font-mono">RX: {activePreparation.prescriptionId} • {activePreparation.patientType}</div>
      </CardHeader>

      <CardBody className="p-0 flex-1 flex flex-col">
        {/* Pick List */}
        <div className="p-4 bg-white/[0.02] border-b border-white/5 flex items-center gap-2">
           <span className="text-[11px] font-bold text-gray-300">Target Items:</span>
           <span className="text-[11px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded font-mono">{activePreparation.itemsToPick.length}</span>
        </div>

        <div className="divide-y divide-white/[0.03] flex-1 overflow-y-auto">
          {activePreparation.itemsToPick.map(item => (
            <div key={item.id} className={cn("p-5 flex items-start justify-between gap-4 transition-colors", 
                item.scanned ? "bg-success/5 border-l-2 border-success" : "hover:bg-white/[0.015]"
            )}>
              <div className="flex-1">
                <h4 className="text-[14px] font-bold text-white flex items-center gap-2">
                  {item.drugName}
                </h4>
                <div className="flex gap-4 mt-2">
                   <p className="text-[11px] text-gray-400 font-mono">Location: <span className="text-white">{item.location}</span></p>
                   <p className="text-[11px] text-gray-400 font-mono">Pick Qty: <span className="text-white font-bold">{item.quantityRequired}</span></p>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                {!item.scanned ? (
                  <Button size="sm" 
                    onClick={() => scanBarcode({ taskId: activePreparation.id, itemId: item.id, barcode: item.ndc })}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] h-8"
                    leftIcon={<ScanBarcode className="w-3.5 h-3.5" />}
                  >
                    Scan Pick
                  </Button>
                ) : (
                  <span className="text-[11px] font-bold text-success-light bg-success/20 px-2 py-1 rounded">Picked</span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Action Bar */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex justify-between items-center">
          <Button 
            disabled={!allPicked || activePreparation.labelPrinted || isPrinting} 
            onClick={() => printLabel(activePreparation.id)}
            className="bg-surface-dark border border-white/10 hover:bg-white/5 text-gray-300 font-bold h-10 px-6"
            leftIcon={<Printer className="w-4 h-4" />}
          >
            {activePreparation.labelPrinted ? 'Label Printed' : 'Print Patient Label'}
          </Button>

          <Button 
            disabled={!allPicked || !activePreparation.labelPrinted || isHandingOver} 
            onClick={() => handover(activePreparation.id)}
            className="bg-orange-600 hover:bg-orange-500 text-white font-bold h-10 px-8"
            leftIcon={<ArrowRightCircle className="w-4 h-4" />}
          >
            HANDOVER TO PHARMACIST
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
