'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Bell,
  ArrowLeft,
  ArrowRight,
  Factory,
  Search,
  Filter,
} from 'lucide-react';

export default function DrugRiskPanelPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'high_risk' | 'watchlist' | 'safe'>('high_risk');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/batches')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBatches(data);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const highRisk = batches.filter((b) => b.riskTier === 'high_risk');
  const watchlist = batches.filter((b) => b.riskTier === 'watchlist');
  const safe = batches.filter((b) => b.riskTier === 'safe');

  const currentList =
    activeTab === 'high_risk' ? highRisk : activeTab === 'watchlist' ? watchlist : safe;

  const filtered = currentList.filter((b) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      b.batchNo.toLowerCase().includes(q) ||
      b.productName.toLowerCase().includes(q) ||
      b.manufacturerName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Link href="/admin" className="text-slate-400 hover:text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-black text-slate-900">Dedicated Drug Risk Monitoring Panel</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time pharmacovigilance surveillance categorizing hospital inventory into Safe, Watchlist, and High-Risk tiers.
          </p>
        </div>

        <Link
          href="/admin/notices"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-medred-600 hover:bg-medred-700 shadow-sm transition-all"
        >
          <Bell className="w-4 h-4" />
          <span>Broadcast Nurse Advisory</span>
        </Link>
      </div>

      {/* 3-Tier Categorization Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab('high_risk')}
          className={`p-5 rounded-2xl border-2 text-left transition-all ${
            activeTab === 'high_risk'
              ? 'bg-rose-50 border-rose-400 shadow-md ring-2 ring-rose-200'
              : 'bg-white border-slate-200 hover:border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-rose-800 tracking-wider">
              High-Risk Drugs
            </span>
            <ShieldAlert className="w-6 h-6 text-medred-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{highRisk.length}</div>
          <p className="text-[11px] text-rose-700 mt-1">
            &ge; 3 ADR incidents or active alert. Urgent quarantine required.
          </p>
        </button>

        <button
          onClick={() => setActiveTab('watchlist')}
          className={`p-5 rounded-2xl border-2 text-left transition-all ${
            activeTab === 'watchlist'
              ? 'bg-amber-50 border-amber-400 shadow-md ring-2 ring-amber-200'
              : 'bg-white border-slate-200 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-amber-800 tracking-wider">
              Watchlist Drugs
            </span>
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{watchlist.length}</div>
          <p className="text-[11px] text-amber-700 mt-1">
            1-2 recorded reactions. Enhanced nursing surveillance advised.
          </p>
        </button>

        <button
          onClick={() => setActiveTab('safe')}
          className={`p-5 rounded-2xl border-2 text-left transition-all ${
            activeTab === 'safe'
              ? 'bg-emerald-50 border-emerald-400 shadow-md ring-2 ring-emerald-200'
              : 'bg-white border-slate-200 hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-emerald-800 tracking-wider">
              Safe Drugs
            </span>
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{safe.length}</div>
          <p className="text-[11px] text-emerald-700 mt-1">
            0 adverse reaction reports. Normal administration status.
          </p>
        </button>
      </div>

      {/* Tab Header & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Showing:</span>
          <span
            className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${
              activeTab === 'high_risk'
                ? 'bg-rose-100 text-rose-800'
                : activeTab === 'watchlist'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {activeTab.replace('_', ' ')} ({filtered.length})
          </span>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search within this tier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-medred-500"
          />
        </div>
      </div>

      {/* Cards List for Selected Tier */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="p-10 text-center text-xs text-slate-400 col-span-2">Loading risk panel...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500 col-span-2 bg-white rounded-2xl border border-slate-200">
            No drugs currently in this risk category.
          </div>
        ) : (
          filtered.map((b) => {
            const isHigh = b.riskTier === 'high_risk';
            const isWatch = b.riskTier === 'watchlist';

            return (
              <div
                key={b.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isHigh
                    ? 'bg-rose-50/50 border-rose-300'
                    : isWatch
                    ? 'bg-amber-50/50 border-amber-300'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900">{b.productName}</h3>
                    <div className="text-xs text-slate-500">{b.genericName || b.form}</div>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      isHigh
                        ? 'bg-rose-200 text-rose-900 border border-rose-300'
                        : isWatch
                        ? 'bg-amber-200 text-amber-900 border border-amber-300'
                        : 'bg-emerald-200 text-emerald-900 border border-emerald-300'
                    }`}
                  >
                    {isHigh ? 'High-Risk Drug' : isWatch ? 'Watchlist' : 'Safe'}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Batch Number</span>
                    <span className="font-mono font-bold text-medred-700">{b.batchNo}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Manufacturer</span>
                    <span className="font-medium text-slate-700 truncate block">{b.manufacturerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Hospital Reaction Count</span>
                    <span
                      className={`font-black ${
                        isHigh ? 'text-medred-600 text-sm' : isWatch ? 'text-amber-700' : 'text-slate-700'
                      }`}
                    >
                      {b.reactionCount} reported incident(s)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Expiry Date</span>
                    <span className="font-mono text-slate-600">
                      {b.expDate ? new Date(b.expDate).toLocaleDateString('en-IN') : 'N/A'}
                    </span>
                  </div>
                </div>

                {b.activeAlertReason && (
                  <div className="mt-3 p-2 rounded-lg bg-rose-100/90 border border-rose-300 text-rose-900 text-xs font-semibold">
                    Alert Reason: {b.activeAlertReason}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <Link
                    href={`/adr-head/cases?search=${encodeURIComponent(b.batchNo)}`}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900"
                  >
                    View ADR Cases &rarr;
                  </Link>

                  {isHigh && (
                    <Link
                      href={`/admin/notices?batchId=${b.id}&batchNo=${encodeURIComponent(b.batchNo)}&product=${encodeURIComponent(b.productName)}`}
                      className="px-3 py-1.5 bg-medred-600 hover:bg-medred-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                    >
                      Broadcast Nurse Notice
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
