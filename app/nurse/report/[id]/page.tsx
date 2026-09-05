'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRole } from '@/lib/RoleContext';
import { STATUS_CONFIG, SEVERITY_CONFIG } from '@/lib/types';
import SymptomSelector from '@/components/SymptomSelector';
import BatchQuickCheck from '@/components/BatchQuickCheck';
import SafetyAlertBanner from '@/components/SafetyAlertBanner';
import BarcodeQuickFill from '@/components/BarcodeQuickFill';
import {
  FilePlus2,
  Save,
  Send,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  Clock,
  Info,
  FileText,
  User,
  Pill,
  History,
  ShieldAlert,
  ChevronRight,
  PlusCircle,
  Printer,
} from 'lucide-react';

export default function NurseReportDetailOrResumePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { currentUser } = useRole();

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any | null>(null);
  const [batches, setBatches] = useState<any[]>([]);

  // Draft Edit Form State
  const [patientInitials, setPatientInitials] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientSex, setPatientSex] = useState<'M' | 'F' | 'Other'>('F');
  const [patientWeightKg, setPatientWeightKg] = useState('');
  const [ward, setWard] = useState(currentUser.ward || 'Maternity Ward');

  const [reactionStartDate, setReactionStartDate] = useState('');
  const [reactionDescription, setReactionDescription] = useState('');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe' | 'life_threatening'>('moderate');
  const [doseUsed, setDoseUsed] = useState('500 ml');
  const [routeUsed, setRouteUsed] = useState('IV Infusion');
  const [indication, setIndication] = useState('Hydration / Fluid Resuscitation');
  const [otherHistory, setOtherHistory] = useState('');

  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [selectedBatch, setSelectedBatch] = useState<any | null>(null);

  const [seriousness, setSeriousness] = useState({
    lifeThreatening: false,
    hospitalization: false,
    medicallySignificant: false,
    death: false,
  });

  const [outcome, setOutcome] = useState<'continuing' | 'recovering' | 'recovered' | 'unknown'>('recovering');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [repRes, bchRes] = await Promise.all([
        fetch(`/api/reports/${id}`),
        fetch('/api/batches'),
      ]);

      const repData = await repRes.json();
      const bchData = await bchRes.json();

      if (Array.isArray(bchData)) setBatches(bchData);

      if (repRes.ok && repData) {
        setReport(repData);

        // Populate Form Fields
        setPatientInitials(repData.patientInitials || '');
        setPatientAge(repData.patientAge || '');
        setPatientSex(repData.patientSex || 'F');
        setPatientWeightKg(repData.patientWeightKg ? String(repData.patientWeightKg) : '');
        setWard(repData.ward || currentUser.ward || 'Maternity Ward');

        if (repData.reactionStartDate) {
          setReactionStartDate(new Date(repData.reactionStartDate).toISOString().slice(0, 10));
        }
        setReactionDescription(repData.reactionDescription || '');
        setSeverity(repData.severity || 'moderate');
        setOutcome(repData.outcome || 'recovering');
        setOtherHistory(repData.otherHistory || '');

        if (repData.seriousnessFlags && typeof repData.seriousnessFlags === 'object') {
          setSeriousness({
            lifeThreatening: !!repData.seriousnessFlags.lifeThreatening,
            hospitalization: !!repData.seriousnessFlags.hospitalization,
            medicallySignificant: !!repData.seriousnessFlags.medicallySignificant,
            death: !!repData.seriousnessFlags.death,
          });
        }

        const med = repData.medications?.[0];
        if (med) {
          setSelectedBatchId(med.batchId || '');
          setDoseUsed(med.doseUsed || '500 ml');
          setRouteUsed(med.routeUsed || 'IV Infusion');
          setIndication(med.indication || 'Hydration / Fluid Resuscitation');

          if (Array.isArray(bchData)) {
            const found = bchData.find((b: any) => b.id === med.batchId);
            if (found) setSelectedBatch(found);
            else setSelectedBatch(med.batch || null);
          }
        } else if (Array.isArray(bchData) && bchData.length > 0) {
          setSelectedBatchId(bchData[0].id);
          setSelectedBatch(bchData[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load report:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchChange = (batchId: string) => {
    setSelectedBatchId(batchId);
    const found = batches.find((b) => b.id === batchId);
    setSelectedBatch(found || null);
  };

  const handleUpdateDraft = async (targetStatus: 'draft' | 'submitted') => {
    setFormError(null);
    setSuccessMessage(null);

    if (targetStatus === 'submitted') {
      if (!patientInitials.trim()) {
        setFormError('Please enter Patient Initials.');
        return;
      }
      if (!patientAge.trim()) {
        setFormError('Please enter Patient Age.');
        return;
      }
      if (!reactionDescription.trim()) {
        setFormError('Please describe the adverse reaction.');
        return;
      }
      if (!selectedBatchId) {
        setFormError('Please select the suspected drug and batch.');
        return;
      }
    }

    setSubmitting(true);

    try {
      const payload = {
        patientInitials: patientInitials.trim() || 'Draft',
        patientAge: patientAge.trim() || 'Unknown',
        patientSex,
        patientWeightKg: patientWeightKg ? parseFloat(patientWeightKg) : null,
        ward,
        reactionStartDate,
        reactionDescription: reactionDescription.trim() || 'Draft saved by nurse.',
        severity,
        seriousnessFlags: seriousness,
        outcome,
        otherHistory: otherHistory.trim() || null,
        status: targetStatus,
        editedById: currentUser.id,
        medications: selectedBatchId
          ? [
              {
                batchId: selectedBatchId,
                doseUsed,
                routeUsed,
                indication,
                actionTaken: 'withdrawn',
                reintroductionReaction: 'na',
              },
            ]
          : [],
      };

      const res = await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to update report');

      setSuccessMessage(
        targetStatus === 'draft'
          ? 'Draft updated successfully!'
          : 'ADR Case submitted successfully to ADR Head for clinical review!'
      );

      setTimeout(() => {
        if (targetStatus === 'submitted') {
          router.push(`/report/${id}/form`);
        } else {
          router.push('/nurse/reports');
        }
      }, 1200);
    } catch (err: any) {
      setFormError(err.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-xs text-slate-400">
        Loading case report details...
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-medred-600 mx-auto" />
        <h2 className="text-base font-bold text-slate-800">ADR Case Report Not Found</h2>
        <Link
          href="/nurse/reports"
          className="inline-block text-xs text-medred-600 font-bold hover:underline"
        >
          Return to My Reports List
        </Link>
      </div>
    );
  }

  const isDraft = report.status === 'draft';
  const statusConf = STATUS_CONFIG[report.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.submitted;
  const sevConf = SEVERITY_CONFIG[report.severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.moderate;
  const med = report.medications?.[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/nurse/reports"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Reports List</span>
        </Link>

        <div className="flex items-center space-x-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${statusConf.bg} ${statusConf.color} ${statusConf.border}`}
          >
            {statusConf.label}
          </span>
          <Link
            href={`/report/${report.id}/form`}
            className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-medred-50 hover:bg-medred-100 text-medred-700 border border-rose-200 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Digital PvPI Form</span>
          </Link>
        </div>
      </div>

      <SafetyAlertBanner wardFilter={report.ward} />

      {/* DRAFT RESUME MODE */}
      {isDraft ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header Banner */}
          <div className="p-6 bg-gradient-to-r from-amber-50 to-white border-b border-amber-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-200">
                <Save className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900">Resume &amp; Edit Saved Draft</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete remaining clinical details and submit this case report to the ADR Head.
                </p>
              </div>
            </div>
          </div>

          {/* Error / Success Notifications */}
          {formError && (
            <div className="mx-6 mt-6 p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-semibold flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-medred-600 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {successMessage && (
            <div className="mx-6 mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="p-6 space-y-8">
            {/* Section 1: Patient Demographics */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-200">
                <span className="w-5 h-5 rounded-full bg-medred-100 text-medred-700 text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Patient Demographics (De-identified)
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Patient Initials *</label>
                  <input
                    type="text"
                    value={patientInitials}
                    onChange={(e) => setPatientInitials(e.target.value.toUpperCase())}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-medred-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Age *</label>
                  <input
                    type="text"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-medred-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sex</label>
                  <select
                    value={patientSex}
                    onChange={(e) => setPatientSex(e.target.value as any)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-medred-500"
                  >
                    <option value="F">Female (F)</option>
                    <option value="M">Male (M)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={patientWeightKg}
                    onChange={(e) => setPatientWeightKg(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-medred-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hospital Ward / Unit</label>
                <input
                  type="text"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-medred-500"
                />
              </div>
            </div>

            {/* Section 2: Suspected Drug & Batch Verification */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-medred-100 text-medred-700 text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Suspected Drug / IV Fluid &amp; Batch Verification
                  </h2>
                </div>

                <BarcodeQuickFill
                  batches={batches}
                  onSelectBatch={(batchId, dose, route) => {
                    handleBatchChange(batchId);
                    if (dose) setDoseUsed(dose);
                    if (route) setRouteUsed(route);
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Administered Drug &amp; Batch *</label>
                  <select
                    value={selectedBatchId}
                    onChange={(e) => handleBatchChange(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-medred-500"
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.productName || b.product?.name} — Batch {b.batchNo} ({b.manufacturerName || b.manufacturer?.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dose Administered</label>
                  <input
                    type="text"
                    value={doseUsed}
                    onChange={(e) => setDoseUsed(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-medred-500"
                  />
                </div>
              </div>

              <BatchQuickCheck batch={selectedBatch} />
            </div>

            {/* Section 3: Adverse Reaction */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-200">
                <span className="w-5 h-5 rounded-full bg-medred-100 text-medred-700 text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Adverse Reaction &amp; Smart Symptom Suggestions
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Reaction Onset Date *</label>
                  <input
                    type="date"
                    value={reactionStartDate}
                    onChange={(e) => setReactionStartDate(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-medred-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Severity Observed</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-medred-500"
                  >
                    <option value="mild">Mild (Slight discomfort, resolved spontaneously)</option>
                    <option value="moderate">Moderate (Required intervention/medication stopped)</option>
                    <option value="severe">Severe (Marked distress, rigors, high pyrexia)</option>
                    <option value="life_threatening">Life Threatening (Anaphylaxis, severe collapse)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reaction Observed &amp; Clinical Notes *</label>
                <textarea
                  rows={3}
                  value={reactionDescription}
                  onChange={(e) => setReactionDescription(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-medred-500 leading-relaxed font-sans"
                />

                <SymptomSelector
                  currentText={reactionDescription}
                  onChange={(newText) => setReactionDescription(newText)}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleUpdateDraft('draft')}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
              >
                <Save className="w-4 h-4 text-slate-500" />
                <span>{submitting ? 'Saving...' : 'Save Draft Progress'}</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleUpdateDraft('submitted')}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-medred-600 hover:bg-medred-700 shadow-md shadow-rose-200 transition-all hover:scale-105"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting...' : 'Complete Submit to ADR Head'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* READ-ONLY COMPREHENSIVE CASE DETAIL MODE */
        <div className="space-y-6">
          {/* Main Case Overview Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-xl font-black text-slate-900">
                    ADR Case #{report.id.slice(0, 8).toUpperCase()}
                  </h1>
                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase border ${statusConf.bg} ${statusConf.color} ${statusConf.border}`}
                  >
                    {statusConf.label}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${sevConf.bg} ${sevConf.color} ${sevConf.border}`}
                  >
                    {sevConf.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Reported by <strong className="text-slate-800">{report.reporter?.name || 'Staff Nurse'}</strong> ({report.ward}) on {new Date(report.createdAt).toLocaleString('en-IN')}
                </p>
              </div>

              <Link
                href={`/nurse/follow-up?parentId=${report.id}`}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-sm transition-all flex-shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Add Linked Follow-Up</span>
              </Link>
            </div>

            {/* Quick Grid Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center space-x-1.5 text-slate-500 font-bold uppercase text-[10px]">
                  <User className="w-3.5 h-3.5 text-slate-700" />
                  <span>Patient Demographics</span>
                </div>
                <p className="font-bold text-slate-900 text-sm">{report.patientInitials} ({report.patientAge}, {report.patientSex})</p>
                <p className="text-slate-600">Weight: {report.patientWeightKg ? `${report.patientWeightKg} kg` : 'N/A'}</p>
                <p className="text-slate-600">Ward: {report.ward}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center space-x-1.5 text-slate-500 font-bold uppercase text-[10px]">
                  <Pill className="w-3.5 h-3.5 text-medred-600" />
                  <span>Suspected Administered Drug</span>
                </div>
                <p className="font-bold text-slate-900 text-sm">{med?.batch?.product?.name || 'Suspected Drug'}</p>
                <p className="font-mono text-medred-600 font-bold">Batch: {med?.batch?.batchNo || 'N/A'}</p>
                <p className="text-slate-600">{med?.batch?.manufacturer?.name || 'Manufacturer'}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center space-x-1.5 text-slate-500 font-bold uppercase text-[10px]">
                  <History className="w-3.5 h-3.5 text-amber-600" />
                  <span>Reaction Onset &amp; Outcome</span>
                </div>
                <p className="font-bold text-slate-900 text-sm">
                  Onset: {new Date(report.reactionStartDate).toLocaleDateString('en-IN')}
                </p>
                <p className="text-slate-600 capitalize">Outcome: <strong>{report.outcome || 'Recovering'}</strong></p>
                <p className="text-slate-600">Seriousness: {report.seriousnessFlags?.hospitalization ? 'Hospitalized' : 'Non-serious'}</p>
              </div>
            </div>

            {/* Instant Batch History Cross-Check Badge */}
            {med?.batch && <BatchQuickCheck batch={med.batch} />}

            {/* Reaction Description */}
            <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 space-y-1 text-xs">
              <label className="font-bold text-slate-800 flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4 text-medred-600" />
                <span>Observed Symptoms &amp; Clinical Notes:</span>
              </label>
              <p className="text-slate-800 leading-relaxed font-sans pt-1">{report.reactionDescription}</p>
            </div>
          </div>

          {/* WHO-UMC Causality & ADR Head Review Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <ShieldAlert className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">WHO-UMC Causality &amp; Pharmacovigilance Review</h2>
            </div>

            {med?.causalityAssessment ? (
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Official Causality Classification:</span>
                  <span className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-black text-xs">
                    {med.causalityAssessment}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Evaluated according to the World Health Organization — Uppsala Monitoring Centre standard.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Causality assessment pending clinical review by ADR Head.
              </p>
            )}

            {/* Amendments Trail */}
            {report.amendments && report.amendments.length > 0 && (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-700">Audit Addendums &amp; Clinical Notes Log:</label>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                  {report.amendments.map((a: any) => (
                    <div key={a.id} className="p-3 bg-slate-50/50 flex justify-between items-start gap-4">
                      <div>
                        <span className="font-bold text-slate-800">{a.fieldName}:</span>{' '}
                        <span className="text-slate-600">{a.newValue}</span>
                        {a.oldValue && (
                          <span className="text-slate-400 text-[11px] block">Previous value: {a.oldValue}</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 text-right">
                        <span>By {a.editedBy?.name || 'ADR Head'}</span>
                        <span className="block">{new Date(a.editedAt).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Linked Follow-Up Reports Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-purple-600" />
                <h2 className="text-base font-bold text-slate-900">Linked Follow-Up Reports Timeline</h2>
              </div>

              <Link
                href={`/nurse/follow-up?parentId=${report.id}`}
                className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center space-x-1"
              >
                <span>+ Create Follow-Up</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {report.followUps && report.followUps.length > 0 ? (
              <div className="space-y-3">
                {report.followUps.map((fu: any) => (
                  <div
                    key={fu.id}
                    className="p-4 rounded-xl border border-purple-100 bg-purple-50/30 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-950">Follow-Up Case #{fu.id.slice(0, 8).toUpperCase()}</span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {new Date(fu.createdAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed font-sans">{fu.reactionDescription}</p>
                    <div className="text-[11px] text-slate-500 pt-1">
                      Reporter: <strong>{fu.reporter?.name || 'Staff Nurse'}</strong>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No linked follow-up reports recorded for this case yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
