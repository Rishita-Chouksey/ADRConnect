'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import SafetyAlertBanner from '@/components/SafetyAlertBanner';
import {
  Boxes,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Bell,
  Users,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Activity,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [inventory, setInventory] = useState<any>({ products: [], manufacturers: [], batches: [] });
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/inventory').then((r) => r.json()),
      fetch('/api/notices?activeOnly=false').then((r) => r.json()),
    ])
      .then(([inv, not]) => {
        setInventory(inv);
        if (Array.isArray(not)) setNotices(not);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const batches = inventory.batches || [];
  const highRiskBatches = batches.filter((b: any) => b._count?.medications >= 3 || b.highAlerts?.length > 0);
  const watchlistBatches = batches.filter(
    (b: any) => b._count?.medications >= 1 && b._count?.medications < 3 && b.highAlerts?.length === 0
  );
  const safeBatches = batches.filter((b: any) => (b._count?.medications || 0) === 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <h1 className="text-2xl font-black text-slate-900">Hospital Pharmacy &amp; Safety Administration</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Maintain verified hospital IV fluid inventory, monitor the 3-tier Drug Risk Panel, and broadcast safety alerts to nurses.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            href="/admin/inventory"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-all"
          >
            <Boxes className="w-4 h-4" />
            <span>Manage Inventory</span>
          </Link>
          <Link
            href="/admin/notices"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-medred-600 hover:bg-medred-700 shadow-sm transition-all"
          >
            <Bell className="w-4 h-4" />
            <span>+ Broadcast Safety Notice</span>
          </Link>
        </div>
      </div>

      <SafetyAlertBanner />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-2xl font-black text-slate-900">{inventory.products?.length || 0}</div>
            <div className="text-xs text-slate-500 font-medium">Drug Products Registered</div>
            <div className="text-[10px] text-slate-400 mt-0.5">IV fluids &amp; injectables</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-2xl font-black text-slate-900">{batches.length}</div>
            <div className="text-xs text-slate-500 font-medium">Active Hospital Batches</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Tracked for reactions</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-rose-50 p-5 rounded-2xl border-2 border-rose-300 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-2xl font-black text-rose-900">{highRiskBatches.length}</div>
            <div className="text-xs text-rose-800 font-bold uppercase tracking-wider">High-Risk Drugs</div>
            <div className="text-[10px] text-rose-700 mt-0.5">Immediate action required</div>
          </div>
          <ShieldAlert className="w-8 h-8 text-medred-600" />
        </div>

        <div className="bg-amber-50 p-5 rounded-2xl border-2 border-amber-300 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-2xl font-black text-amber-900">{watchlistBatches.length}</div>
            <div className="text-xs text-amber-800 font-bold uppercase tracking-wider">Watchlist Drugs</div>
            <div className="text-[10px] text-amber-700 mt-0.5">Increasing ADR frequency</div>
          </div>
          <AlertTriangle className="w-8 h-8 text-amber-600" />
        </div>
      </div>

      {/* Drug Risk Monitoring Panel Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Drug Risk Monitoring Panel</h2>
            <p className="text-xs text-slate-500">Live surveillance categorizing medications into Safe, Watchlist, and High-Risk</p>
          </div>

          <Link
            href="/admin/risk-panel"
            className="text-xs font-semibold text-medred-600 hover:text-medred-700 flex items-center space-x-1"
          >
            <span>Open Dedicated Risk Panel</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* Column 1: High-Risk Drugs */}
          <div className="p-5 space-y-3 bg-rose-50/40">
            <div className="flex items-center justify-between pb-2 border-b border-rose-200">
              <span className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-medred-600" />
                <span>High-Risk Drugs ({highRiskBatches.length})</span>
              </span>
              <span className="text-[10px] font-bold text-rose-700 uppercase">Urgent Quarantine</span>
            </div>

            {highRiskBatches.length === 0 ? (
              <div className="text-xs text-slate-400 py-4">No high-risk drugs identified.</div>
            ) : (
              <div className="space-y-2">
                {highRiskBatches.map((b: any) => (
                  <div key={b.id} className="p-3 bg-white rounded-xl border border-rose-300 shadow-sm text-xs space-y-1">
                    <div className="font-bold text-slate-900">{b.product?.name}</div>
                    <div className="flex justify-between text-[11px]">
                      <span className="font-mono text-medred-600 font-bold">Batch: {b.batchNo}</span>
                      <span className="font-bold text-rose-800">{b._count?.medications || 3} ADRs reported</span>
                    </div>
                    <div className="text-[10px] text-slate-500">{b.manufacturer?.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Watchlist Drugs */}
          <div className="p-5 space-y-3 bg-amber-50/40">
            <div className="flex items-center justify-between pb-2 border-b border-amber-200">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Watchlist Drugs ({watchlistBatches.length})</span>
              </span>
              <span className="text-[10px] font-bold text-amber-700 uppercase">Increased Monitoring</span>
            </div>

            {watchlistBatches.length === 0 ? (
              <div className="text-xs text-slate-400 py-4">No watchlist drugs currently.</div>
            ) : (
              <div className="space-y-2">
                {watchlistBatches.map((b: any) => (
                  <div key={b.id} className="p-3 bg-white rounded-xl border border-amber-300 shadow-sm text-xs space-y-1">
                    <div className="font-bold text-slate-900">{b.product?.name}</div>
                    <div className="flex justify-between text-[11px]">
                      <span className="font-mono text-amber-700 font-bold">Batch: {b.batchNo}</span>
                      <span className="font-bold text-amber-800">{b._count?.medications} ADR reported</span>
                    </div>
                    <div className="text-[10px] text-slate-500">{b.manufacturer?.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 3: Safe Drugs */}
          <div className="p-5 space-y-3 bg-emerald-50/30">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Safe Drugs ({safeBatches.length})</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Normal Status</span>
            </div>

            <div className="space-y-2">
              {safeBatches.slice(0, 3).map((b: any) => (
                <div key={b.id} className="p-3 bg-white rounded-xl border border-emerald-200 shadow-sm text-xs space-y-1">
                  <div className="font-bold text-slate-900">{b.product?.name}</div>
                  <div className="flex justify-between text-[11px]">
                    <span className="font-mono text-slate-600 font-bold">Batch: {b.batchNo}</span>
                    <span className="text-emerald-700 font-semibold">0 incidents</span>
                  </div>
                  <div className="text-[10px] text-slate-500">{b.manufacturer?.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Safety Notices & Nurse Broadcast Manager */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Active Nurse Safety Broadcasts</h2>
            <p className="text-xs text-slate-500">Advisories displayed on all nurse dashboard stations</p>
          </div>

          <Link
            href="/admin/notices"
            className="text-xs font-bold text-medred-600 hover:text-medred-700 flex items-center space-x-1"
          >
            <span>Manage All Notices</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-2">
          {notices.slice(0, 3).map((n: any) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border text-xs flex items-start justify-between ${
                n.severity === 'critical'
                  ? 'bg-rose-50/70 border-rose-300 text-rose-950'
                  : 'bg-blue-50/70 border-blue-200 text-blue-950'
              }`}
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm">{n.title}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.2 rounded bg-white border border-slate-300">
                    {n.severity}
                  </span>
                </div>
                <p className="text-xs mt-1 text-slate-700 leading-relaxed">{n.message}</p>
              </div>

              <span className="text-[10px] text-slate-500 font-mono flex-shrink-0 ml-3">
                {new Date(n.createdAt).toLocaleDateString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
