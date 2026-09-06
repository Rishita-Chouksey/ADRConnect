package com.example.adrconnect.data.models

data class AdrReportCreate(
    val local_uuid: String,
    val case_type: String = "initial",
    val submission_state: String = "complete",
    val patient_info: PatientInfo,
    val reaction_info: ReactionInfo,
    val suspected_medications: List<SuspectedMedicationCreate>,
    val seriousness_and_outcome: SeriousnessAndOutcome,
    val concomitant_drugs: List<Map<String, String>> = emptyList(),
    val additional_info: String? = null
)

data class PatientInfo(
    val patient_initials: String,
    val patient_age: String,
    val patient_sex: String,
    val patient_weight_kg: Double? = null,
    val reg_ipd_opd_no: String? = null,
    val amc_report_no: String? = null,
    val worldwide_unique_no: String? = null
)

data class ReactionInfo(
    val reaction_start_date: String,
    val reaction_description: String,
    val reaction_stop_date: String? = null,
    val onset_lag_time: String? = null,
    val lab_data_tests: String? = null,
    val other_history: String? = null,
    val symptoms: List<String> = emptyList()
)

data class SuspectedMedicationCreate(
    val batch_id: String,
    val row_order: Int = 1
)

data class SeriousnessAndOutcome(
    val seriousness_flags: List<String> = emptyList(),
    val outcome: String? = null
)

data class ReportSubmissionResponse(
    val message: String,
    val report_id: String
)

data class AdrReportResponse(
    val id: String,
    val patient_initials: String,
    val reaction_description: String,
    val created_at: String
)

data class HighAlertCreate(
    val batch_id: String,
    val severity_level: String = "HIGH",
    val reason: String
)
