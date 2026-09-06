package com.example.adrconnect.ui.auth

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.adrconnect.data.models.LoginRequest
import com.example.adrconnect.data.remote.RetrofitClient
import com.example.adrconnect.databinding.ActivityLoginBinding
import com.example.adrconnect.ui.admin.AdminDashboardActivity
import com.example.adrconnect.ui.adrhead.AdrHeadDashboardActivity
import com.example.adrconnect.ui.nurse.NurseDashboardActivity
import com.example.adrconnect.utils.SessionManager
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding
    private lateinit var sessionManager: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)

        // Auto-login check if the user is already logged in
        checkExistingSession()

        binding.btnLogin.setOnClickListener {
            val employeeId = binding.etEmail.text.toString().trim()
            val password = binding.etPassword.text.toString().trim()

            if (employeeId.isNotEmpty() && password.isNotEmpty()) {
                performLogin(employeeId, password)
            } else {
                Toast.makeText(this, "Please fill in all fields", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun performLogin(employeeId: String, pass: String) {
        showLoading(true)

        lifecycleScope.launch {
            try {
                val api = RetrofitClient.getApiService(this@LoginActivity)
                val response = api.login(LoginRequest(employeeId, pass))

                if (response.isSuccessful && response.body() != null) {
                    val body = response.body()!!
                    sessionManager.saveAuthToken(body.access_token, body.role, body.hospital_id)
                    
                    navigateToRoleDashboard(body.role)
                } else {
                    showLoading(false)
                    Toast.makeText(this@LoginActivity, "Invalid Credentials", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                showLoading(false)
                Toast.makeText(this@LoginActivity, "Network Error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun checkExistingSession() {
        val token = sessionManager.fetchAuthToken()
        val role = sessionManager.fetchUserRole()

        if (!token.isNullOrEmpty() && !role.isNullOrEmpty()) {
            navigateToRoleDashboard(role)
        }
    }

    private fun navigateToRoleDashboard(role: String) {
        val intent = when (role.lowercase()) {
            "nurse" -> Intent(this, NurseDashboardActivity::class.java)
            "adr_head" -> Intent(this, AdrHeadDashboardActivity::class.java)
            "administrator", "admin" -> Intent(this, AdminDashboardActivity::class.java)
            else -> null
        }

        if (intent != null) {
            startActivity(intent)
            finish()
        } else {
            showLoading(false)
            Toast.makeText(this, "Unknown Role: $role", Toast.LENGTH_SHORT).show()
        }
    }

    private fun showLoading(isLoading: Boolean) {
        binding.btnLogin.isEnabled = !isLoading
        binding.progressBar?.visibility = if (isLoading) View.VISIBLE else View.GONE
    }
}
