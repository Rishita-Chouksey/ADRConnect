package com.example.adrconnect.data.models

data class AdrReportCreate(
    val patient_age: Int,
    val patient_gender: String,
    val batch_id: String,
    val reaction_description: String,
    val severity: String
)

data class AdrReportResponse(
    val id: String,
    val patient_age: Int,
    val patient_gender: String,
    val reaction_description: String,
    val severity: String,
    val created_at: String
)

data class HighAlertCreate(
    val batch_id: String,
    val alert_type: String,
    val reason: String
)