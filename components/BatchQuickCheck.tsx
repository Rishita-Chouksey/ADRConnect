'use client';

import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, ShieldCheck, Factory, Calendar } from 'lucide-react';

interface BatchInfo {
  id: string;
  batchNo: string;
  productName: string;
  genericName?: string | null;
  form?: string | null;
  manufacturerName: string;
  expDate?: string | null;
  reactionCount: number;
  isHighAlert: boolean;
  activeAlertReason?: string | null;
  riskTier: 'safe' | 'watchlist' | 'high_risk';
}

interface BatchQuickCheckProps {
  batch: BatchInfo | null;
}

export default function BatchQuickCheck({ batch }: BatchQuickCheckProps) {
  if (!batch) return null;

  const isHighRisk = batch.riskTier === 'high_risk' || batch.isHighAlert || batch.reactionCount >= 3;
  const isWatchlist = batch.riskTier === 'watchlist' || batch.reactionCount > 0;

  return (
    <div
      className={`mt-2 p-3.5 rounded-xl border transition-all ${
        isHighRisk
          ? 'bg-rose-50/90 border-rose-300 text-rose-950 ring-2 ring-rose-200'
          : isWatchlist
          ? 'bg-amber-50/90 border-amber-300 text-amber-950'
          : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2.5">
          <div
            className={`p-1.5 rounded-lg mt-0.5 flex-shrink-0 ${
              isHighRisk
                ? 'bg-rose-600 text-white'
                : isWatchlist
                ? 'bg-amber-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {isHighRisk ? (
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            ) : isWatchlist ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm">
                Batch Traceability: {batch.batchNo}
              </span>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                  isHighRisk
                    ? 'bg-rose-200 text-rose-900 border border-rose-300'
                    : isWatchlist
                    ? 'bg-amber-200 text-amber-900 border border-amber-300'
                    : 'bg-emerald-200 text-emerald-900 border border-emerald-300'
                }`}
              >
                {isHighRisk ? 'HIGH RISK BATCH' : isWatchlist ? 'WATCHLIST BATCH' : 'VERIFIED SAFE BATCH'}
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs opacity-90">
              <span className="flex items-center space-x-1">
                <Factory className="w-3.5 h-3.5 text-slate-500" />
                <span>Mfr: <strong>{batch.manufacturerName}</strong></span>
              </span>
              {batch.expDate && (
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Exp: {new Date(batch.expDate).toLocaleDateString('en-IN')}</span>
                </span>
              )}
            </div>

            {/* Reaction History Warning */}
            <div className="mt-2 text-xs font-semibold">
              {batch.reactionCount > 0 ? (
                <p
                  className={
                    isHighRisk
                      ? 'text-rose-700 flex items-center space-x-1'
                      : 'text-amber-700 flex items-center space-x-1'
                  }
                >
                  <span>⚠️ Alert:</span>
                  <span>
                    <strong>{batch.reactionCount} previous ADR incident(s)</strong> have been recorded for this exact batch in our hospital.
                  </span>
                </p>
              ) : (
                <p className="text-emerald-700 flex items-center space-x-1">
                  <span>✓</span>
                  <span>Zero previous adverse reactions reported for this batch.</span>
                </p>
              )}

              {batch.isHighAlert && batch.activeAlertReason && (
                <p className="mt-1 text-rose-800 font-bold bg-rose-100/80 p-1.5 rounded-md border border-rose-300">
                  🚩 Official Alert Reason: {batch.activeAlertReason}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
