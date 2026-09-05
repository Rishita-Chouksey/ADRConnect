'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/lib/RoleContext';
import SymptomSelector from '@/components/SymptomSelector';
import {
  Clock,
  Send,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Layers,
  Sparkles,
  Calendar,
  FileText,
} from 'lucide-react';

export default function FollowUpPage() {
  const router = useRouter();
  const { currentUser } = useRole();

  const [reports, setReports] = useState<any[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  const [newSymptoms, setNewSymptoms] = useState('');
  const [treatmentResponse, setTreatmentResponse] = useState('');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe' | 'life_threatening'>('mild');
  const [outcome, setOutcome] = useState<'recovered' | 'recovering' | 'continuing' | 'fatal'>('recovered');
  const [recoveryDate, setRecoveryDate] = useState(new Date().toISOString().slice(0, 10));

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load existing reports for selection
  useEffect(() => {
    fetch('/api/reports?caseType=initial')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setReports(data);
          setSelectedParentId(data[0].id);
          setSelectedReport(data[0]);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  const handleParentSelect = (id: string) => {
    setSelectedParentId(id);
    const found = reports.find((r) => r.id === id);
    setSelectedReport(found || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParentId) {
      setErrorMsg('Please select an existing initial ADR case to follow up.');
      return;
    }
    if (!newSymptoms.trim() && !treatmentResponse.trim()) {
      setErrorMsg('Please enter follow-up observations or treatment response.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/reports/${selectedParentId}/follow-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reactionDescription: `[Follow-Up Update]: ${newSymptoms.trim()}`,
          treatmentResponse: treatmentResponse.trim(),
          severity,
          outcome,
          reactionRecoveryDate: outcome === 'recovered' ? recoveryDate : null,
          reporterUserId: currentUser.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit follow-up');

      setSuccessMsg('Follow-up report successfully linked and submitted to ADR Head!');
      setTimeout(() => {
        router.push(`/report/${data.id}/form`);
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating follow-up');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Nurse Station</span>
        </button>

        <span className="text-xs font-semibold text-slate-500">
          Form: <span className="text-slate-800">Linked ADR Follow-Up</span>
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-50 to-white border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-200">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">Submit Linked Follow-Up Form</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Record symptom evolution, therapeutic response, and recovery progress for an existing ADR case.
              </p>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-6 p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Step 1: Select Original Case */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Initial ADR Case to Follow Up <span className="text-medred-600">*</span>
            </label>
            <select
              value={selectedParentId}
              onChange={(e) => handleParentSelect(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-purple-500"
            >
              {reports.map((r) => {
                const firstMed = r.medications?.[0];
                return (
                  <option key={r.id} value={r.id}>
                    Patient {r.patientInitials} ({r.patientAge}, {r.ward}) — Drug:{' '}
                    {firstMed?.batch?.product?.name || 'IV Fluid'} (Batch: {firstMed?.batch?.batchNo || 'N/A'}) — Status: {r.status}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Original Case Summary Box */}
          {selectedReport && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Original Case Reference: {selectedReport.id.slice(0, 8)}...</span>
                <span className="uppercase text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  {selectedReport.status}
                </span>
              </div>
              <p className="text-slate-600 italic">
                &ldquo;{selectedReport.reactionDescription}&rdquo;
              </p>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 flex justify-between">
                <span>Reaction Onset: {new Date(selectedReport.reactionStartDate).toLocaleDateString('en-IN')}</span>
                <span>Original Severity: <strong className="uppercase">{selectedReport.severity || 'moderate'}</strong></span>
              </div>
            </div>
          )}

          {/* Step 2: Follow-Up Observations */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                New Symptoms / Evolution of Condition <span className="text-medred-600">*</span>
              </label>
              <textarea
                rows={3}
                value={newSymptoms}
                onChange={(e) => setNewSymptoms(e.target.value)}
                placeholder="Detail current patient state e.g. rigors stopped, fever down from 102.4 to 98.6 F, rash fading..."
                className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 font-sans"
              />

              <SymptomSelector currentText={newSymptoms} onChange={(t) => setNewSymptoms(t)} />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Treatment Response / Counter-measures Administered
              </label>
              <textarea
                rows={2}
                value={treatmentResponse}
                onChange={(e) => setTreatmentResponse(e.target.value)}
                placeholder="e.g. Infusion discontinued immediately. IV Avil 2ml and Paracetamol IV given stat. Patient responded promptly within 30 minutes."
                className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Change in Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="mild">Mild (Substantially eased or minor)</option>
                  <option value="moderate">Moderate (Residual discomfort)</option>
                  <option value="severe">Severe (Persistent complication)</option>
                  <option value="life_threatening">Life Threatening</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Recovery Status</label>
                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value as any)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="recovered">Recovered (Fully resolved)</option>
                  <option value="recovering">Recovering (Substantial improvement)</option>
                  <option value="continuing">Continuing (Ongoing under observation)</option>
                  <option value="fatal">Fatal</option>
                </select>
              </div>
            </div>

            {outcome === 'recovered' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date of Complete Recovery</label>
                <input
                  type="date"
                  value={recoveryDate}
                  onChange={(e) => setRecoveryDate(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-200 transition-all hover:scale-105"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit Linked Follow-Up to ADR Head'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
