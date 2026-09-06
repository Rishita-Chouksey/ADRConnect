package com.example.adrconnect.data.models

data class LoginRequest(
    val employee_id: String,
    val password: String
)

data class LoginResponse(
    val access_token: String,
    val token_type: String,
    val user_id: String,
    val name: String,
    val role: String,
    val hospital_id: String
)
