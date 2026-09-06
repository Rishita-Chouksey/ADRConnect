package com.example.adrconnect.data.remote

import com.example.adrconnect.data.models.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    // Nurse Endpoints
    @GET("api/batches/search")
    suspend fun searchBatches(@Query("q") query: String): Response<List<BatchSearchResult>>

    @POST("api/reports/")
    suspend fun submitReport(@Body report: AdrReportCreate): Response<ReportSubmissionResponse>

    // ADR Head Endpoints
    @GET("api/reports/")
    suspend fun getReports(): Response<List<AdrReportResponse>>

    @POST("api/alerts/")
    suspend fun createAlert(@Body alert: HighAlertCreate): Response<Unit>

    // Administrator Endpoints
    @GET("api/alerts/")
    suspend fun getAlerts(): Response<List<Any>>
}
