'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/lib/RoleContext';
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
} from 'lucide-react';

export default function InitialCaseReportPage() {
  const router = useRouter();
  const { currentUser } = useRole();

  // Inventory batches state
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [selectedBatch, setSelectedBatch] = useState<any | null>(null);

  // Form State
  const [patientInitials, setPatientInitials] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientSex, setPatientSex] = useState<'M' | 'F' | 'Other'>('F');
  const [patientWeightKg, setPatientWeightKg] = useState('');
  const [ward, setWard] = useState(currentUser.ward || 'Maternity Ward');

  const [administrationDateTime, setAdministrationDateTime] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [reactionStartDate, setReactionStartDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [reactionDescription, setReactionDescription] = useState('');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe' | 'life_threatening'>('moderate');
  const [doseUsed, setDoseUsed] = useState('500 ml');
  const [routeUsed, setRouteUsed] = useState('IV Infusion');
  const [indication, setIndication] = useState('Hydration / Fluid Resuscitation');
  const [otherHistory, setOtherHistory] = useState('');

  // Seriousness criteria checkboxes
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

  // Fetch batches from verified inventory
  useEffect(() => {
    fetch('/api/batches')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBatches(data);
          if (data.length > 0) {
            setSelectedBatchId(data[0].id);
            setSelectedBatch(data[0]);
          }
        }
      })
      .catch((e) => console.error('Failed to load batches:', e));
  }, []);

  const handleBatchChange = (batchId: string) => {
    setSelectedBatchId(batchId);
    const found = batches.find((b) => b.id === batchId);
    setSelectedBatch(found || null);
  };

  const handleSave = async (status: 'draft' | 'submitted') => {
    setFormError(null);
    setSuccessMessage(null);

    // Validation for Complete Submit
    if (status === 'submitted') {
      if (!patientInitials.trim()) {
        setFormError('Please enter Patient Initials (e.g. S/K).');
        return;
      }
      if (!patientAge.trim()) {
        setFormError('Please enter Patient Age (e.g. 28 yrs).');
        return;
      }
      if (!reactionDescription.trim()) {
        setFormError('Please enter the reaction observed or select from smart symptoms.');
        return;
      }
      if (!selectedBatchId) {
        setFormError('Please select the administered drug and batch.');
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
        status,
        reporterUserId: currentUser.id,
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

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit report');
      }

      setSuccessMessage(
        status === 'draft'
          ? 'Draft report saved successfully! You can resume and complete it later from My Reports.'
          : 'ADR Case submitted successfully to ADR Head for clinical review!'
      );

      setTimeout(() => {
        router.push(status === 'draft' ? '/nurse/reports' : `/report/${data.id}/form`);
      }, 1200);
    } catch (err: any) {
      setFormError(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumb & Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <span className="text-xs font-semibold text-slate-500">
          Form: <span className="text-slate-800">PvPI Initial Case Report</span>
        </span>
      </div>

      <SafetyAlertBanner wardFilter={ward} />

      {/* Main Form Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Form Title Banner */}
        <div className="p-6 bg-gradient-to-r from-rose-50 to-white border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-medred-600 text-white flex items-center justify-center font-bold shadow-md shadow-rose-200">
              <FilePlus2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">Initial ADR Case Report</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Capture adverse drug reaction observed during or following IV fluid / injectable drug administration.
              </p>
            </div>
          </div>
        </div>

        {/* Error / Success Alerts */}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Patient Initials <span className="text-medred-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. S/K or R/M"
                  value={patientInitials}
                  onChange={(e) => setPatientInitials(e.target.value.toUpperCase())}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-medred-500"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">PvPI de-identified</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Age <span className="text-medred-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 28 yrs or 4 mos"
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
                  placeholder="e.g. 54.5"
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
                placeholder="e.g. Maternity Ward, ICU, Medical Ward"
                className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-medred-500"
              />
            </div>
          </div>

          {/* Section 2: Suspected IV Fluid / Medication & Batch Verification */}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Administered Drug &amp; Batch <span className="text-medred-600">*</span>
                </label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => handleBatchChange(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-medred-500"
                >
                  <option value="no_batch">-- Link to No Specific Batch (General Product ADR) --</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.productName} — Batch {b.batchNo} ({b.manufacturerName})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Select from verified hospital inventory to ensure 100% batch traceability
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Administration Date &amp; Time</label>
                <input
                  type="datetime-local"
                  value={administrationDateTime}
                  onChange={(e) => setAdministrationDateTime(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-medred-500"
                />
              </div>
            </div>

            {/* Instant Batch Reaction History Cross-Check Badge */}
            <BatchQuickCheck batch={selectedBatch} />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dose Administered</label>
                <input
                  type="text"
                  value={doseUsed}
                  onChange={(e) => setDoseUsed(e.target.value)}
                  placeholder="e.g. 500 ml or 100 ml"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-medred-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Route of Administration</label>
                <select
                  value={routeUsed}
                  onChange={(e) => setRouteUsed(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-medred-500"
                >
                  <option value="IV Infusion">IV Infusion</option>
                  <option value="IV Bolus / Injection">IV Bolus / Injection</option>
                  <option value="IM Injection">IM Injection</option>
                  <option value="Subcutaneous">Subcutaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Indication</label>
                <input
                  type="text"
                  value={indication}
                  onChange={(e) => setIndication(e.target.value)}
                  placeholder="e.g. Post-op Hydration, Fever"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-medred-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Reaction Observed & Smart Symptoms */}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reaction Onset Date <span className="text-medred-600">*</span>
                </label>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reaction Observed &amp; Clinical Notes <span className="text-medred-600">*</span>
              </label>
              <textarea
                rows={3}
                value={reactionDescription}
                onChange={(e) => setReactionDescription(e.target.value)}
                placeholder="Describe onset, symptoms, vitals change, and immediate nursing actions taken..."
                className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-medred-500 leading-relaxed font-sans"
              />

              {/* Smart Symptom Suggestion Chips Component */}
              <SymptomSelector
                currentText={reactionDescription}
                onChange={(newText) => setReactionDescription(newText)}
              />
            </div>

            {/* Seriousness Flags */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                PvPI Seriousness Criteria (Check if applicable):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <label className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={seriousness.hospitalization}
                    onChange={(e) => setSeriousness({ ...seriousness, hospitalization: e.target.checked })}
                    className="rounded text-medred-600 focus:ring-medred-500"
                  />
                  <span className="font-semibold text-slate-800">Hospitalization</span>
                </label>

                <label className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={seriousness.lifeThreatening}
                    onChange={(e) => setSeriousness({ ...seriousness, lifeThreatening: e.target.checked })}
                    className="rounded text-medred-600 focus:ring-medred-500"
                  />
                  <span className="font-semibold text-slate-800">Life Threatening</span>
                </label>

                <label className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={seriousness.medicallySignificant}
                    onChange={(e) => setSeriousness({ ...seriousness, medicallySignificant: e.target.checked })}
                    className="rounded text-medred-600 focus:ring-medred-500"
                  />
                  <span className="font-semibold text-slate-800">Medically Significant</span>
                </label>

                <label className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={seriousness.death}
                    onChange={(e) => setSeriousness({ ...seriousness, death: e.target.checked })}
                    className="rounded text-medred-600 focus:ring-medred-500"
                  />
                  <span className="font-semibold text-slate-800">Fatal / Death</span>
                </label>
              </div>
            </div>

            {/* Current Patient Outcome */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Current Patient Recovery Outcome</label>
                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value as any)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-medred-500"
                >
                  <option value="recovering">Recovering (Symptoms easing after stopping drug)</option>
                  <option value="recovered">Recovered (Fully resolved without sequelae)</option>
                  <option value="continuing">Continuing (Reaction persistent)</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Other Relevant History / Concomitant Drugs</label>
                <input
                  type="text"
                  value={otherHistory}
                  onChange={(e) => setOtherHistory(e.target.value)}
                  placeholder="e.g. Known drug allergy, hypertension, asthma"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-medred-500"
                />
              </div>
            </div>
          </div>

          {/* Reporter Identification Banner */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">Reporter:</span>{' '}
              <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.occupation || 'Staff Nurse'})
            </div>
            <div className="text-slate-500">
              Staff ID: <strong className="text-slate-800">{currentUser.employeeId}</strong>
            </div>
          </div>

          {/* Form Actions: Partial Submit vs Complete Submit */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-blue-500" />
              <span>&quot;Partial Save&quot; stores draft. &quot;Complete Submit&quot; notifies the ADR Head immediately.</span>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSave('draft')}
                className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Save className="w-4 h-4 text-slate-500" />
                <span>{submitting ? 'Saving...' : 'Partial Save (Draft)'}</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSave('submitted')}
                className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-medred-600 hover:bg-medred-700 shadow-md shadow-rose-200 transition-all hover:scale-105"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting...' : 'Complete Submit to ADR Head'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
