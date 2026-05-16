'use client';
import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { PrescriptionDetail } from '../types/pharmacy.types';
import { useScanBarcode, useDispensePrescription } from '../hooks/usePharmacyAnalytics';
import { Pill, ScanBarcode, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props { activePrescription?: PrescriptionDetail; }

export function PharmacyDispensePanel({ activePrescription }: Props) {
  const { mutate: scanBarcode } = useScanBarcode();
  const { mutate: dispense, isPending } = useDispensePrescription();

  if (!activePrescription) return null;

  const allScanned = activePrescription.drugs.every(d => !d.requiresBarcodeScan || d.scanned);
  const outOfStock = activePrescription.drugs.some(d => d.stockAvailable < d.quantity);

  return (
    <Card className="border-emerald-500/30 shadow-glass bg-[#050a07] h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
      <CardHeader className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pill className="w-4 h-4 text-emerald-400" />
          <h3 className="text-[13px] font-bold tracking-widest text-emerald-400">DISPENSE VERIFICATION</h3>
        </div>
        <div className="text-[10px] text-gray-400 font-mono">RX: {activePrescription.id}</div>
      </CardHeader>

      <CardBody className="p-0 flex-1 flex flex-col">
        {/* Prescription Header Info */}
        <div className="p-4 bg-white/[0.02] border-b border-white/5 flex justify-between items-center text-[11px]">
           <div>
              <span className="block text-gray-500 mb-1">Prescribed By</span>
              <span className="text-white font-bold">{activePrescription.prescribedBy}</span>
           </div>
           <div className="text-right">
              <span className="block text-gray-500 mb-1">Patient MRN</span>
              <span className="text-white font-mono">{activePrescription.patientId}</span>
           </div>
        </div>

        {/* Drug Validation List */}
        <div className="divide-y divide-white/[0.03] flex-1 overflow-y-auto">
          {activePrescription.drugs.map(drug => {
            const isOos = drug.stockAvailable < drug.quantity;
            return (
              <div key={drug.id} className={cn("p-5 flex items-start justify-between gap-4 transition-colors", 
                isOos ? "bg-emergency/10 border-l-2 border-emergency" : 
                drug.scanned ? "bg-success/5 border-l-2 border-success" : "hover:bg-white/[0.015]"
              )}>
                <div className="flex-1">
                  <h4 className={cn("text-[14px] font-bold flex items-center gap-2", isOos ? "text-emergency-light" : "text-white")}>
                    {drug.drugName}
                    <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300 font-mono">{drug.dosage} {drug.route} {drug.frequency}</span>
                  </h4>
                  <div className="flex gap-4 mt-2">
                     <p className="text-[11px] text-gray-400 font-mono">Qty: <span className="text-white font-bold">{drug.quantity}</span></p>
                     <p className="text-[11px] text-gray-400 font-mono">Stock: <span className={cn("font-bold", isOos ? "text-emergency-light" : "text-white")}>{drug.stockAvailable}</span></p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {drug.requiresBarcodeScan && !drug.scanned ? (
                    <Button size="sm" 
                      onClick={() => scanBarcode({ prescriptionId: activePrescription.id, drugId: drug.id, barcode: '123' })}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] h-8"
                      leftIcon={<ScanBarcode className="w-3.5 h-3.5" />}
                      disabled={isOos}
                    >
                      Scan Barcode
                    </Button>
                  ) : drug.scanned ? (
                    <span className="text-[11px] font-bold text-success-light flex items-center gap-1 bg-success/20 px-2 py-1 rounded">
                      <CheckCircle2 className="w-3.5 h-3.5"/> Verified
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
        
        {activePrescription.validationFlags.length > 0 && (
          <div className="p-3 bg-warning/10 border-t border-warning/30 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning-light" />
            <span className="text-[11px] font-bold text-warning-light">Clinical Warnings: {activePrescription.validationFlags.join(', ')}</span>
          </div>
        )}

        <div className="p-4 border-t border-white/10 bg-black/40 flex justify-between items-center">
          <div className="text-[14px] font-bold text-white font-mono">
            Total: ${activePrescription.totalCost.toFixed(2)}
          </div>
          <Button 
            disabled={!allScanned || outOfStock || isPending} 
            onClick={() => dispense(activePrescription.id)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-10 px-8"
          >
            DISPENSE & PRINT LABEL
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
