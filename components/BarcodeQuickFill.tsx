'use client';

import React, { useState } from 'react';
import { QrCode, Scan, CheckCircle2, X, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';

interface BarcodeQuickFillProps {
  batches: any[];
  onSelectBatch: (batchId: string, defaultDose?: string, defaultRoute?: string) => void;
}

export default function BarcodeQuickFill({ batches, onSelectBatch }: BarcodeQuickFillProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scannedBatch, setScannedBatch] = useState<any | null>(null);

  const handleSimulateScan = (batch: any) => {
    setScanning(true);
    setScannedBatch(null);

    setTimeout(() => {
      setScanning(false);
      setScannedBatch(batch);
      
      // Auto fill after brief flash
      setTimeout(() => {
        onSelectBatch(batch.id, '500 ml', 'IV Infusion');
        setIsOpen(false);
      }, 700);
    }, 600);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white text-xs font-bold shadow-sm transition-all hover:scale-105"
      >
        <Scan className="w-4 h-4 text-emerald-400 animate-pulse" />
        <span>Simulate Barcode Scan</span>
        <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded font-mono">
          1-Click
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-medred-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                  <QrCode className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">IV Fluid / Injectable Barcode Scanner</h3>
                  <p className="text-[11px] text-slate-300">Simulate barcode scanner reading IV bottle labels</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Viewfinder simulation */}
            <div className="p-6 space-y-4">
              <div className="relative bg-slate-950 rounded-xl p-6 border-2 border-dashed border-slate-700 text-center overflow-hidden">
                {/* Laser scan animation line */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-300 to-emerald-500 shadow-[0_0_15px_#10b981] animate-bounce" />

                {scanning ? (
                  <div className="py-8 space-y-2 flex flex-col items-center justify-center">
                    <Scan className="w-10 h-10 text-emerald-400 animate-spin" />
                    <p className="text-xs font-mono text-emerald-400 font-bold">Decoding GS1 DataMatrix / Barcode...</p>
                  </div>
                ) : scannedBatch ? (
                  <div className="py-4 space-y-2 flex flex-col items-center justify-center text-emerald-400 animate-in fade-in">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    <p className="text-xs font-bold text-white">MATCH FOUND!</p>
                    <p className="text-xs font-mono text-emerald-300">{scannedBatch.productName || scannedBatch.product?.name} — Batch {scannedBatch.batchNo}</p>
                  </div>
                ) : (
                  <div className="py-4 space-y-2">
                    <QrCode className="w-12 h-12 text-slate-500 mx-auto" />
                    <p className="text-xs font-mono text-slate-400">Position IV bottle barcode inside frame</p>
                    <p className="text-[10px] text-slate-500">Supports GS1-128, 2D DataMatrix, and Hospital Lot Labels</p>
                  </div>
                )}
              </div>

              {/* Sample Scanned Bottles */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                  <span>Select Simulated IV Fluid / Injectable Bottle:</span>
                  <span className="text-[10px] text-slate-400 font-normal">Click bottle to scan</span>
                </label>

                {batches.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No inventory batches available to scan.</p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {batches.map((batch) => {
                      const prodName = batch.productName || batch.product?.name || 'IV Fluid';
                      const mfgName = batch.manufacturerName || batch.manufacturer?.name || 'Pharma';

                      return (
                        <button
                          key={batch.id}
                          type="button"
                          onClick={() => handleSimulateScan(batch)}
                          className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all flex items-center justify-between group"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-900">
                                {prodName}
                              </span>
                              <span className="font-mono text-[10px] font-bold text-medred-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                Batch {batch.batchNo}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500">
                              Mfg: {mfgName} &bull; Barcode: <span className="font-mono text-slate-700">{batch.barcodeData || `BC-${batch.batchNo}`}</span>
                            </p>
                          </div>

                          <span className="text-xs font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                            <span>Scan</span>
                            <Scan className="w-3.5 h-3.5" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Hospital Pharmacy Stock Integration</span>
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
