package com.example.adrconnect.utils

import android.content.Context
import android.content.SharedPreferences

class SessionManager(context: Context) {
    private val prefs: SharedPreferences = 
        context.getSharedPreferences("adr_prefs", Context.MODE_PRIVATE)

    fun saveAuthToken(token: String, role: String, hospitalId: String) {
        prefs.edit()
            .putString("jwt_token", token)
            .putString("user_role", role)
            .putString("hospital_id", hospitalId)
            .apply()
    }

    fun fetchAuthToken(): String? = prefs.getString("jwt_token", null)
    fun fetchUserRole(): String? = prefs.getString("user_role", null)
    fun fetchHospitalId(): String? = prefs.getString("hospital_id", null)
    
    fun clearSession() {
        prefs.edit().clear().apply()
    }
}
