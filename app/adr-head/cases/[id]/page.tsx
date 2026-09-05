'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRole } from '@/lib/RoleContext';
import { STATUS_CONFIG, SEVERITY_CONFIG, WHO_CAUSALITY_CATEGORIES } from '@/lib/types';
import BatchQuickCheck from '@/components/BatchQuickCheck';
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Send,
  ShieldAlert,
  Clock,
  History,
  Activity,
  Layers,
  Printer,
  ChevronRight,
} from 'lucide-react';

export default function AdrCaseReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useRole();
  const id = params?.id as string;

  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Review Actions State
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedCausality, setSelectedCausality] = useState<string>('');
  const [clinicalNotes, setClinicalNotes] = useState<string>('');
  const [forwardTarget, setForwardTarget] = useState<'pvpi_regulatory' | 'drug_safety_committee' | 'hospital_pv_unit'>('pvpi_regulatory');
  const [forwardNotes, setForwardNotes] = useState<string>('');
  const [forwarding, setForwarding] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = () => {
    setLoading(true);
    fetch(`/api/reports/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setReport(data);
        setSelectedStatus(data.status);
        const med = data.medications?.[0];
        if (med?.causalityAssessment) {
          setSelectedCausality(med.causalityAssessment);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  const handleUpdateStatusAndCausality = async () => {
    setUpdating(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: selectedStatus,
          causalityAssessment: selectedCausality || null,
          amendmentNote: clinicalNotes.trim() || null,
          editedById: currentUser.id,
        }),
      });

      const updated = await res.json();
      if (!res.ok) throw new Error(updated.error || 'Failed to update report');

      setReport(updated);
      setClinicalNotes('');
      setMessage({ type: 'success', text: 'Clinical review and status updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Update failed' });
    } finally {
      setUpdating(false);
    }
  };

  const handleForward = async () => {
    setForwarding(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/reports/${id}/forward`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          forwardedTo: forwardTarget,
          notes: forwardNotes.trim() || 'Forwarded following clinical pharmacovigilance evaluation.',
          forwardedById: currentUser.id,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Forwarding failed');

      setMessage({
        type: 'success',
        text: `Successfully escalated and forwarded! Official Reference: ${result.referenceNo}`,
      });
      setForwardNotes('');
      fetchReport();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Forwarding failed' });
    } finally {
      setForwarding(false);
    }
  };

  const handleFlagHighAlert = async () => {
    const med = report?.medications?.[0];
    if (!med?.batchId) return;

    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `FLAGGED BATCH ALERT: ${med.batch?.product?.name} (${med.batch?.batchNo})`,
          message: `ADR Head flagged batch ${med.batch?.batchNo} following clinical investigation of reaction in ${report.ward}. Please quarantine remaining stock.`,
          severity: 'critical',
          batchId: med.batchId,
          createdById: currentUser.id,
        }),
      });

      if (!res.ok) throw new Error('Failed to raise alert');

      setMessage({
        type: 'success',
        text: `Critical Safety Alert generated and broadcast to hospital nurses and pharmacy admin!`,
      });
      fetchReport();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  if (loading || !report) {
    return (
      <div className="p-12 text-center text-xs text-slate-400">
        <Activity className="w-8 h-8 text-medred-600 animate-spin mx-auto mb-2" />
        <span>Loading case record...</span>
      </div>
    );
  }

  const statusConf = STATUS_CONFIG[report.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.submitted;
  const sevConf = SEVERITY_CONFIG[report.severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.moderate;
  const firstMed = report.medications?.[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Breadcrumbs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={() => router.push('/adr-head/cases')}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Case Management</span>
        </button>

        <div className="flex items-center space-x-3">
          <Link
            href={`/report/${report.id}/form`}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4 text-medred-600" />
            <span>Generate Official PvPI Form</span>
          </Link>
        </div>
      </div>

      {/* Alert Banner */}
      {message && (
        <div
          className={`p-4 rounded-xl border text-xs font-bold flex items-center space-x-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Case Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-medred-600 text-white">
                {report.caseType === 'follow_up' ? 'Follow-Up Case' : 'Initial Case'}
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {report.id}</span>
            </div>
            <h1 className="text-2xl font-black mt-1">
              Patient {report.patientInitials} ({report.patientAge}, {report.patientSex}) &bull; {report.ward}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Reported by {report.reporter?.name} ({report.reporter?.occupation}) on{' '}
              {new Date(report.createdAt).toLocaleDateString('en-IN')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase border ${statusConf.bg} ${statusConf.color} ${statusConf.border}`}
            >
              Status: {statusConf.label}
            </span>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase border ${sevConf.bg} ${sevConf.color} ${sevConf.border}`}
            >
              Severity: {sevConf.label}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Reaction Summary */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Reaction Observed by Nursing Staff
            </h2>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 leading-relaxed">
              {report.reactionDescription}
            </div>
          </div>

          {/* Suspected Medication & Batch Verification */}
          {firstMed && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Suspected Drug / IV Fluid &amp; Batch Traceability
              </h2>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Product</span>
                  <span className="font-bold text-slate-900">{firstMed.batch?.product?.name}</span>
                  <span className="text-[10px] text-slate-500 block">{firstMed.batch?.product?.form}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Manufacturer</span>
                  <span className="font-bold text-slate-900">{firstMed.batch?.manufacturer?.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Batch Number</span>
                  <span className="font-mono font-black text-medred-600 text-sm">{firstMed.batch?.batchNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Expiry Date</span>
                  <span className="font-mono text-slate-700">
                    {firstMed.batch?.expDate ? new Date(firstMed.batch.expDate).toLocaleDateString('en-IN') : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Instant Cross-Check Badge */}
              <BatchQuickCheck
                batch={{
                  id: firstMed.batch.id,
                  batchNo: firstMed.batch.batchNo,
                  productName: firstMed.batch.product.name,
                  manufacturerName: firstMed.batch.manufacturer.name,
                  reactionCount: firstMed.batch.highAlerts?.length > 0 ? 3 : 2,
                  isHighAlert: firstMed.batch.highAlerts?.length > 0,
                  activeAlertReason: firstMed.batch.highAlerts?.[0]?.reason,
                  riskTier: firstMed.batch.highAlerts?.length > 0 ? 'high_risk' : 'watchlist',
                }}
              />
            </div>
          )}

          {/* Action Row: Flag High Alert */}
          <div className="flex items-center justify-between p-4 bg-rose-50 rounded-xl border border-rose-200">
            <div className="flex items-center space-x-2.5">
              <ShieldAlert className="w-5 h-5 text-medred-600" />
              <div>
                <span className="text-xs font-bold text-rose-950 block">High Alert Flagging</span>
                <span className="text-[11px] text-rose-800">
                  Multiple reactions from this batch? Flagging alerts the Administrator and displays warnings on every nurse&apos;s station.
                </span>
              </div>
            </div>

            <button
              onClick={handleFlagHighAlert}
              className="px-3 py-1.5 bg-medred-600 hover:bg-medred-700 text-white font-bold text-xs rounded-lg shadow-sm flex-shrink-0"
            >
              🚩 Broadcast High Alert
            </button>
          </div>

          {/* Linked Follow-Ups (if any) */}
          {report.followUps && report.followUps.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Linked Follow-Up Progress ({report.followUps.length})
              </h2>
              <div className="space-y-2">
                {report.followUps.map((f: any) => (
                  <div key={f.id} className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-purple-950">
                      <span>Follow-Up from {f.reporter?.name}</span>
                      <span>{new Date(f.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    <p className="text-purple-900 leading-relaxed">{f.reactionDescription}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clinical Review Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Workflow Status & WHO Causality */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <Activity className="w-5 h-5 text-medred-600" />
            <h2 className="text-base font-bold text-slate-900">Clinical Evaluation &amp; Causality</h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Case Workflow Stage Transition
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-medred-500"
            >
              <option value="submitted">Submitted (Awaiting Clinical Review)</option>
              <option value="under_review">Under Review (Investigating Batch / Formulation)</option>
              <option value="follow_up_required">Follow-Up Required (Awaiting Recovery Data)</option>
              <option value="escalated">Escalated (Forwarded to PvPI / Committee)</option>
              <option value="closed">Closed (Assessment Finalized)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              WHO-UMC Causality Assessment
            </label>
            <select
              value={selectedCausality}
              onChange={(e) => setSelectedCausality(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-medred-500"
            >
              <option value="">-- Select Causality Classification --</option>
              {WHO_CAUSALITY_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label} ({c.description})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Clinical Assessment Notes (Appended to Audit Trail)
            </label>
            <textarea
              rows={3}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="e.g. Temporal relationship plausible. Reaction subsided after fluid withdrawal. Evaluated by ADR Head."
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-medred-500 font-sans"
            />
          </div>

          <button
            onClick={handleUpdateStatusAndCausality}
            disabled={updating}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            {updating ? 'Saving Clinical Review...' : 'Save Evaluation & Update Workflow'}
          </button>
        </div>

        {/* Card 2: Pharmacovigilance Forwarding */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <Send className="w-5 h-5 text-medred-600" />
            <h2 className="text-base font-bold text-slate-900">Pharmacovigilance Forwarding</h2>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Forward verified cases to institutional bodies or national authorities with an immutable tracking ID.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Forwarding Recipient
            </label>
            <select
              value={forwardTarget}
              onChange={(e) => setForwardTarget(e.target.value as any)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-medred-500"
            >
              <option value="pvpi_regulatory">Regulatory Authorities (PvPI / CDSCO)</option>
              <option value="drug_safety_committee">Hospital Drug Safety Committee</option>
              <option value="hospital_pv_unit">Hospital Pharmacovigilance Unit</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Forwarding Remarks</label>
            <textarea
              rows={3}
              value={forwardNotes}
              onChange={(e) => setForwardNotes(e.target.value)}
              placeholder="e.g. Forwarding suspected batch for national signal evaluation and Pyrogen test inspection."
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-medred-500 font-sans"
            />
          </div>

          <button
            onClick={handleForward}
            disabled={forwarding}
            className="w-full py-2.5 bg-medred-600 hover:bg-medred-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-200 transition-all hover:scale-[1.02]"
          >
            {forwarding ? 'Dispatching...' : 'Forward to Pharmacovigilance Authority'}
          </button>
        </div>
      </div>

      {/* Audit Trail Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
          <History className="w-5 h-5 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-900">Immutable Audit Trail &amp; Amendments</h2>
        </div>

        {report.amendments?.length === 0 && report.forwardingRecords?.length === 0 ? (
          <div className="text-xs text-slate-400 py-2">No amendments made yet. Nurse submission is intact.</div>
        ) : (
          <div className="space-y-2">
            {report.forwardingRecords?.map((f: any) => (
              <div key={f.id} className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs flex justify-between">
                <div>
                  <strong className="text-medred-800">Forwarded to {f.forwardedTo.toUpperCase()}</strong>
                  <div className="text-slate-600 text-[11px] mt-0.5">{f.notes}</div>
                </div>
                <div className="text-right text-[10px] text-slate-500">
                  <div className="font-mono font-bold text-slate-800">Ref: {f.referenceNo}</div>
                  <div>By {f.forwardedBy?.name}</div>
                </div>
              </div>
            ))}

            {report.amendments?.map((a: any) => (
              <div key={a.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between">
                <div>
                  <span className="font-semibold text-slate-800">{a.fieldName}:</span>{' '}
                  <span className="text-slate-600">&quot;{a.newValue}&quot;</span>
                  {a.oldValue && <span className="text-[10px] text-slate-400 block">Previously: {a.oldValue}</span>}
                </div>
                <div className="text-right text-[10px] text-slate-400">
                  <div>{a.editedBy?.name}</div>
                  <div>{new Date(a.editedAt).toLocaleString('en-IN')}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
