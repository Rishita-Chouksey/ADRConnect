'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRole } from '@/lib/RoleContext';
import {
  Bell,
  Send,
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
  Info,
  ArrowLeft,
  X,
  Sparkles,
} from 'lucide-react';

function NoticesContent() {
  const searchParams = useSearchParams();
  const { currentUser } = useRole();

  const preBatchId = searchParams.get('batchId') || '';
  const preBatchNo = searchParams.get('batchNo') || '';
  const preProduct = searchParams.get('product') || '';

  const [notices, setNotices] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState(
    preBatchNo ? `URGENT ADVISORY: Avoid Batch ${preBatchNo} (${preProduct})` : ''
  );
  const [message, setMessage] = useState(
    preBatchNo
      ? `Avoid Batch ${preBatchNo} until pharmacovigilance investigation is completed. Use alternate stock where available.`
      : ''
  );
  const [severity, setSeverity] = useState<'critical' | 'warning' | 'info'>('critical');
  const [selectedBatchId, setSelectedBatchId] = useState<string>(preBatchId);
  const [targetWard, setTargetWard] = useState<string>('');

  const [submitting, setSubmitting] = useState(false);
  const [alertFeedback, setAlertFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/notices?activeOnly=false').then((r) => r.json()),
      fetch('/api/batches').then((r) => r.json()),
    ])
      .then(([not, bch]) => {
        if (Array.isArray(not)) setNotices(not);
        if (Array.isArray(bch)) setBatches(bch);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  const handleTemplate = (tmplTitle: string, tmplMsg: string, sev: 'critical' | 'warning' | 'info') => {
    setTitle(tmplTitle);
    setMessage(tmplMsg);
    setSeverity(sev);
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('Please fill out notice title and message.');
      return;
    }

    setSubmitting(true);
    setAlertFeedback(null);

    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          severity,
          batchId: selectedBatchId || null,
          targetWard: targetWard.trim() || null,
          createdById: currentUser.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to broadcast notice');

      setAlertFeedback('Safety Notice broadcast successfully to all Nurse Dashboards!');
      setTitle('');
      setMessage('');
      fetchData();
      setTimeout(() => setAlertFeedback(null), 5000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch('/api/notices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: !currentActive }),
      });
      if (!res.ok) throw new Error('Failed to update notice status');
      fetchData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Link href="/admin" className="text-slate-400 hover:text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-black text-slate-900">Nurse Alert Broadcast System</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Issue urgent batch quarantines, infusion vigilance notices, or recall advisories directly to frontline nurses.
          </p>
        </div>
      </div>

      {alertFeedback && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{alertFeedback}</span>
        </div>
      )}

      {/* Broadcast Creator Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
          <Bell className="w-5 h-5 text-medred-600" />
          <h2 className="text-base font-bold text-slate-900">Publish Safety Notice to Nurses</h2>
        </div>

        {/* Quick Suggestion Templates */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-medred-600" />
            <span>Quick Hospital Broadcast Templates (Click to fill):</span>
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                handleTemplate(
                  'BATCH RECALL: Quarantine Batch Immediately',
                  'Avoid Batch MP251001073 until investigation is completed. Use alternate stock where available.',
                  'critical'
                )
              }
              className="text-xs px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-medium"
            >
              🚩 &quot;Avoid Batch until investigation completed&quot;
            </button>
            <button
              type="button"
              onClick={() =>
                handleTemplate(
                  'VIGILANCE ADVISORY: Rapid IV Infusion Vitals Check',
                  'Monitor patients closely when administering IV fluids. Report any shivering, rigors, or fever immediately.',
                  'warning'
                )
              }
              className="text-xs px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-medium"
            >
              ⚠️ &quot;Monitor patients closely&quot;
            </button>
            <button
              type="button"
              onClick={() =>
                handleTemplate(
                  'STOCK ADVISORY: Use Alternate Lot Where Available',
                  'Central pharmacy has released replacement stock for Maternity and Medical wards. Please return flagged vials.',
                  'info'
                )
              }
              className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-medium"
            >
              ℹ️ &quot;Use alternate stock where available&quot;
            </button>
          </div>
        </div>

        <form onSubmit={handleCreateNotice} className="space-y-4 text-xs pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Notice Title <span className="text-medred-600">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. URGENT RECALL: Dextrose 5% Batch MP251001073"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Alert Severity Level</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold"
              >
                <option value="critical">Critical (Red Warning — Immediate Recall)</option>
                <option value="warning">Warning (Amber — Clinical Vigilance)</option>
                <option value="info">Info (Blue — Pharmacy Stock Advisory)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Broadcast Message &amp; Clinical Instructions <span className="text-medred-600">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Detail specific instructions for nurses, e.g. which ward, which alternate lot to use, symptoms to watch..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-300 font-sans leading-relaxed"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Link to Specific Batch (Optional)</label>
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="">-- No specific batch (Hospital-wide notice) --</option>
                {batches.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.batchNo} — {b.productName} ({b.manufacturerName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Ward (Optional)</label>
              <input
                type="text"
                placeholder="Leave blank for All Wards, or e.g. Maternity Ward"
                value={targetWard}
                onChange={(e) => setTargetWard(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-medred-600 hover:bg-medred-700 text-white font-bold shadow-md shadow-rose-200 transition-all hover:scale-105"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Broadcasting...' : 'Broadcast Notice to Nurses'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Broadcast History & Resolution */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900">Broadcast Log &amp; Resolution Status</h2>
          <p className="text-xs text-slate-500">Deactivate resolved notices once stock has been replaced or investigation concluded</p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-xs text-slate-400">Loading notices...</div>
        ) : notices.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500">No broadcasts issued yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notices.map((n: any) => {
              const isCrit = n.severity === 'critical';
              const isWarn = n.severity === 'warning';

              return (
                <div
                  key={n.id}
                  className={`p-5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    n.active
                      ? isCrit
                        ? 'bg-rose-50/40'
                        : isWarn
                        ? 'bg-amber-50/40'
                        : 'bg-blue-50/30'
                      : 'bg-slate-50/60 opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900">{n.title}</span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.2 rounded ${
                          isCrit
                            ? 'bg-rose-200 text-rose-900'
                            : isWarn
                            ? 'bg-amber-200 text-amber-900'
                            : 'bg-blue-200 text-blue-900'
                        }`}
                      >
                        {n.severity}
                      </span>
                      {n.active ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded">
                          Active Broadcast
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.2 rounded">
                          Resolved / Inactive
                        </span>
                      )}
                    </div>

                    <p className="text-slate-700 leading-relaxed max-w-2xl">{n.message}</p>

                    <div className="flex flex-wrap items-center gap-x-4 text-[11px] text-slate-500 pt-1">
                      {n.batch && (
                        <span>
                          Batch: <strong>{n.batch.batchNo}</strong> ({n.batch.product?.name})
                        </span>
                      )}
                      <span>
                        Target: <strong>{n.targetWard || 'All Hospital Wards'}</strong>
                      </span>
                      <span>By {n.createdBy?.name || 'Admin'}</span>
                      <span>{new Date(n.createdAt).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleActive(n.id, n.active)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-all flex-shrink-0 ${
                      n.active
                        ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                        : 'bg-slate-800 text-white hover:bg-slate-700'
                    }`}
                  >
                    {n.active ? 'Mark as Resolved' : 'Reactivate Notice'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminNoticesPage() {
  return (
    <React.Suspense fallback={<div className="p-10 text-center text-xs text-slate-400">Loading notices...</div>}>
      <NoticesContent />
    </React.Suspense>
  );
}
