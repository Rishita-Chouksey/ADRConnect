'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Info, ShieldAlert, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Notice {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  targetWard: string | null;
  createdAt: string;
  batch?: {
    batchNo: string;
    product: { name: string };
  };
}

import { useRole } from '@/lib/RoleContext';

export default function SafetyAlertBanner({ wardFilter }: { wardFilter?: string }) {
  const { activeRole } = useRole();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notices?activeOnly=true')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setNotices(data);
      })
      .catch((err) => console.error('Error fetching notices:', err))
      .finally(() => setLoading(false));
  }, []);

  const activeNotices = notices.filter((n) => {
    if (dismissed.includes(n.id)) return false;
    if (wardFilter && n.targetWard && n.targetWard !== wardFilter) return false;
    return true;
  });

  if (activeRole === 'adr_head' || loading || activeNotices.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {activeNotices.map((notice) => {
        const isCritical = notice.severity === 'critical';
        const isWarning = notice.severity === 'warning';

        return (
          <div
            key={notice.id}
            className={`rounded-xl border p-4 shadow-sm transition-all flex items-start justify-between ${
              isCritical
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : isWarning
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-blue-50 border-blue-200 text-blue-950'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div
                className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${
                  isCritical
                    ? 'bg-rose-600 text-white'
                    : isWarning
                    ? 'bg-amber-600 text-white'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {isCritical ? (
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                ) : isWarning ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <Info className="w-5 h-5" />
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-sm tracking-tight">{notice.title}</span>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      isCritical
                        ? 'bg-rose-200 text-rose-800'
                        : isWarning
                        ? 'bg-amber-200 text-amber-800'
                        : 'bg-blue-200 text-blue-800'
                    }`}
                  >
                    {notice.severity}
                  </span>
                  {notice.batch && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/80 border border-slate-300">
                      Batch: {notice.batch.batchNo} ({notice.batch.product.name})
                    </span>
                  )}
                  {notice.targetWard && (
                    <span className="text-xs px-2 py-0.5 rounded bg-white/80 border border-slate-300">
                      Ward: {notice.targetWard}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs leading-relaxed opacity-90">{notice.message}</p>
              </div>
            </div>

            <button
              onClick={() => setDismissed([...dismissed, notice.id])}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors ml-3"
              title="Acknowledge alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
