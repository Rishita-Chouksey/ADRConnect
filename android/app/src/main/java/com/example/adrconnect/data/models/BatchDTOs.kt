package com.example.adrconnect.data.models

data class BatchSearchResult(
    val id: String,
    val batch_no: String,
    val product_name: String?,
    val manufacturer_name: String?,
    val mfg_date: String?,
    val exp_date: String?,
    val barcode_data: String?
)

data class BatchCreateRequest(
    val batch_no: String,
    val product_id: String,
    val manufacturer_id: String,
    val mfg_date: String,
    val exp_date: String,
    val barcode_data: String?
)