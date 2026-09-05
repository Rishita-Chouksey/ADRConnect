'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Search,
  Filter,
  Factory,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export default function BatchRiskMonitoringPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = () => {
    setLoading(true);
    fetch('/api/batches')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBatches(data);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  const handleFlagAlert = async (batch: any) => {
    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `BATCH RECALL / VIGILANCE ADVISORY: ${batch.productName} (Batch ${batch.batchNo})`,
          message: `ADR Head flagged batch ${batch.batchNo} manufactured by ${batch.manufacturerName} due to clustered adverse reaction reports (${batch.reactionCount} reported). Please quarantine remaining inventory.`,
          severity: 'critical',
          batchId: batch.id,
        }),
      });

      if (!res.ok) throw new Error('Failed to create alert');

      setActionNotice(`Safety Alert broadcast successfully for Batch ${batch.batchNo}! Nurses and Pharmacy have been alerted.`);
      fetchBatches();
      setTimeout(() => setActionNotice(null), 5000);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const filtered = batches.filter((b) => {
    if (riskFilter !== 'all' && b.riskTier !== riskFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        b.batchNo.toLowerCase().includes(q) ||
        b.productName.toLowerCase().includes(q) ||
        b.manufacturerName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const highRiskCount = batches.filter((b) => b.riskTier === 'high_risk').length;
  const watchlistCount = batches.filter((b) => b.riskTier === 'watchlist').length;
  const safeCount = batches.filter((b) => b.riskTier === 'safe').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Link href="/adr-head" className="text-slate-400 hover:text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-black text-slate-900">Batch Risk Intelligence Matrix</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Proactively identify clustered batch failures, contaminated fluids, or supplier anomalies before they impact more patients.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/adr-head/cases"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm"
          >
            Review ADR Cases
          </Link>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Summary KPI Triad */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-rose-50 p-5 rounded-2xl border-2 border-rose-300 flex items-center justify-between">
          <div>
            <div className="text-2xl font-black text-rose-900">{highRiskCount}</div>
            <div className="text-xs text-rose-800 font-bold uppercase tracking-wider">
              High-Risk / Recall Batches
            </div>
            <div className="text-[11px] text-rose-700 mt-0.5">&ge; 3 incidents or active alert</div>
          </div>
          <ShieldAlert className="w-8 h-8 text-medred-600 animate-pulse" />
        </div>

        <div className="bg-amber-50 p-5 rounded-2xl border-2 border-amber-300 flex items-center justify-between">
          <div>
            <div className="text-2xl font-black text-amber-900">{watchlistCount}</div>
            <div className="text-xs text-amber-800 font-bold uppercase tracking-wider">
              Watchlist Batches
            </div>
            <div className="text-[11px] text-amber-700 mt-0.5">1-2 recorded reactions</div>
          </div>
          <AlertTriangle className="w-8 h-8 text-amber-600" />
        </div>

        <div className="bg-emerald-50 p-5 rounded-2xl border-2 border-emerald-300 flex items-center justify-between">
          <div>
            <div className="text-2xl font-black text-emerald-900">{safeCount}</div>
            <div className="text-xs text-emerald-800 font-bold uppercase tracking-wider">
              Verified Safe Batches
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5">0 adverse incidents</div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search batch number, drug, manufacturer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-medred-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500">Tier:</span>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-medred-500"
          >
            <option value="all">All Risk Tiers</option>
            <option value="high_risk">High Risk Only</option>
            <option value="watchlist">Watchlist Only</option>
            <option value="safe">Safe Only</option>
          </select>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-xs text-slate-400">Analyzing batch logs...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500">No batches match the search criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Batch Identifier</th>
                  <th className="p-3.5">Product &amp; Formulation</th>
                  <th className="p-3.5">Manufacturer</th>
                  <th className="p-3.5">Expiry Date</th>
                  <th className="p-3.5">Hospital ADRs</th>
                  <th className="p-3.5">Risk Tier</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((b) => {
                  const isHigh = b.riskTier === 'high_risk';
                  const isWatch = b.riskTier === 'watchlist';

                  return (
                    <tr
                      key={b.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isHigh ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <td className="p-3.5 font-mono font-black text-slate-900 text-sm">
                        {b.batchNo}
                        {b.isHighAlert && (
                          <span className="block mt-0.5 text-[9px] font-sans font-bold uppercase text-rose-700">
                            🚩 Active Alert
                          </span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-800">{b.productName}</div>
                        <div className="text-[10px] text-slate-500">{b.form || 'IV Infusion'}</div>
                      </td>

                      <td className="p-3.5 font-medium text-slate-700">{b.manufacturerName}</td>

                      <td className="p-3.5 font-mono text-slate-600">
                        {b.expDate ? new Date(b.expDate).toLocaleDateString('en-IN') : 'N/A'}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`font-black text-sm ${
                            isHigh ? 'text-medred-600' : isWatch ? 'text-amber-600' : 'text-slate-700'
                          }`}
                        >
                          {b.reactionCount} {b.reactionCount === 1 ? 'case' : 'cases'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            isHigh
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : isWatch
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          {isHigh ? 'High Risk' : isWatch ? 'Watchlist' : 'Safe'}
                        </span>
                      </td>

                      <td className="p-3.5 text-right space-x-2">
                        <Link
                          href={`/adr-head/cases?search=${encodeURIComponent(b.batchNo)}`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          <span>View Cases</span>
                        </Link>

                        {isHigh && (
                          <button
                            onClick={() => handleFlagAlert(b)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-medred-600 hover:bg-medred-700 text-white shadow-sm transition-all"
                          >
                            <span>Broadcast Recall</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
