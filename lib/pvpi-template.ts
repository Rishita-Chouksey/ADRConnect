// Official PvPI (Pharmacovigilance Programme of India) Form Generator
// Form reference: Indian Pharmacopoeia Commission / CDSCO Suspected Adverse Drug Reaction Form

export interface PvpiFormData {
  reportId: string;
  reportDate: string;
  caseType: 'initial' | 'follow_up';
  parentReportId?: string | null;
  hospitalName: string;
  ward: string;

  // A. Patient Details
  patient: {
    initials: string;
    age: string;
    sex: string;
    weightKg: string | number | null;
  };

  // B. Adverse Reaction
  reaction: {
    startDate: string;
    recoveryDate: string | null;
    description: string;
    severity: string;
    seriousness: {
      death?: boolean;
      lifeThreatening?: boolean;
      hospitalization?: boolean;
      disability?: boolean;
      medicallySignificant?: boolean;
    };
    outcome: string;
    otherHistory: string | null;
  };

  // C. Suspected Medications
  medications: Array<{
    name: string;
    genericName?: string | null;
    manufacturer: string;
    batchNo: string;
    expDate?: string | null;
    dose: string;
    route: string;
    frequency?: string | null;
    therapyStartDate?: string | null;
    therapyStopDate?: string | null;
    indication?: string | null;
    actionTaken?: string | null;
    reintroductionReaction?: string | null;
    causalityAssessment?: string | null;
  }>;

  // D. Reporter
  reporter: {
    name: string;
    occupation: string;
    employeeId: string;
    hospital: string;
    ward: string;
  };

  // E. Audit Trail & Forwarding
  amendments?: Array<{
    fieldName: string;
    oldValue: string | null;
    newValue: string;
    editedBy: string;
    editedAt: string;
  }>;
  forwardingRecords?: Array<{
    forwardedTo: string;
    referenceNo: string;
    forwardedBy: string;
    forwardedAt: string;
    notes?: string | null;
  }>;
}

export function formatPvpiData(report: any): PvpiFormData {
  const flags = report.seriousnessFlags || {};

  return {
    reportId: report.id,
    reportDate: report.reportDate ? new Date(report.reportDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'),
    caseType: report.caseType || 'initial',
    parentReportId: report.parentReportId,
    hospitalName: report.hospital?.name || 'District Maternal Hospital',
    ward: report.ward || 'General Ward',

    patient: {
      initials: report.patientInitials || 'N/A',
      age: report.patientAge || 'N/A',
      sex: report.patientSex || 'Other',
      weightKg: report.patientWeightKg ? Number(report.patientWeightKg) : null,
    },

    reaction: {
      startDate: report.reactionStartDate ? new Date(report.reactionStartDate).toLocaleDateString('en-IN') : 'N/A',
      recoveryDate: report.reactionRecoveryDate ? new Date(report.reactionRecoveryDate).toLocaleDateString('en-IN') : null,
      description: report.reactionDescription || '',
      severity: report.severity || 'moderate',
      seriousness: {
        death: !!flags.death,
        lifeThreatening: !!flags.lifeThreatening,
        hospitalization: !!flags.hospitalization,
        disability: !!flags.disability,
        medicallySignificant: !!flags.medicallySignificant,
      },
      outcome: report.outcome || 'unknown',
      otherHistory: report.otherHistory || null,
    },

    medications: (report.medications || []).map((med: any) => ({
      name: med.batch?.product?.name || 'Suspected Drug / IV Fluid',
      genericName: med.batch?.product?.genericName,
      manufacturer: med.batch?.manufacturer?.name || 'Unknown Manufacturer',
      batchNo: med.batch?.batchNo || 'N/A',
      expDate: med.batch?.expDate ? new Date(med.batch.expDate).toLocaleDateString('en-IN') : null,
      dose: med.doseUsed || 'Standard dose',
      route: med.routeUsed || 'IV Infusion',
      frequency: med.frequency || 'N/A',
      therapyStartDate: med.therapyStartDate ? new Date(med.therapyStartDate).toLocaleDateString('en-IN') : null,
      therapyStopDate: med.therapyStopDate ? new Date(med.therapyStopDate).toLocaleDateString('en-IN') : null,
      indication: med.indication || 'Therapeutic',
      actionTaken: med.actionTaken || 'withdrawn',
      reintroductionReaction: med.reintroductionReaction || 'na',
      causalityAssessment: med.causalityAssessment || 'Unassessed',
    })),

    reporter: {
      name: report.reporter?.name || 'Staff Nurse',
      occupation: report.reporter?.occupation || 'Staff Nurse',
      employeeId: report.reporter?.employeeId || 'N/A',
      hospital: report.hospital?.name || 'District Maternal Hospital',
      ward: report.ward || 'Maternity Ward',
    },

    amendments: (report.amendments || []).map((a: any) => ({
      fieldName: a.fieldName,
      oldValue: a.oldValue,
      newValue: a.newValue,
      editedBy: a.editedBy?.name || 'ADR Head',
      editedAt: new Date(a.editedAt).toLocaleString('en-IN'),
    })),

    forwardingRecords: (report.forwardingRecords || []).map((f: any) => ({
      forwardedTo: f.forwardedTo === 'pvpi_regulatory' ? 'PvPI / CDSCO Regulatory Authority' : f.forwardedTo === 'drug_safety_committee' ? 'Drug Safety Committee' : 'Hospital PV Unit',
      referenceNo: f.referenceNo,
      forwardedBy: f.forwardedBy?.name || 'ADR Head',
      forwardedAt: new Date(f.forwardedAt).toLocaleString('en-IN'),
      notes: f.notes,
    })),
  };
}
