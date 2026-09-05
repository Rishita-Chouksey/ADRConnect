package com.example.adrconnect.data.models

data class LoginRequest(
    val email: String,
    val password_hash: String
)

data class LoginResponse(
    val access_token: String,
    val token_type: String,
    val role: String,
    val hospital_id: String
)