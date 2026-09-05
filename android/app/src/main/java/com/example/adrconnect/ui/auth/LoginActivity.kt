package com.example.adrconnect.ui.auth

import android.content.Intent
import android.os.Bundle
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

        binding.btnLogin.setOnClickListener {
            val email = binding.etEmail.text.toString().trim()
            val password = binding.etPassword.text.toString().trim()

            if (email.isNotEmpty() && password.isNotEmpty()) {
                performLogin(email, password)
            } else {
                Toast.makeText(this, "Please fill in all fields", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun performLogin(email: String, pass: String) {
        lifecycleScope.launch {
            try {
                val api = RetrofitClient.getApiService(this@LoginActivity)
                val response = api.login(LoginRequest(email, pass))

                if (response.isSuccessful && response.body() != null) {
                    val body = response.body()!!
                    sessionManager.saveAuthToken(body.access_token, body.role, body.hospital_id)

                    // Route user to target UI based on role
                    when (body.role.lowercase()) {
                        "nurse" -> startActivity(Intent(this@LoginActivity, NurseDashboardActivity::class.java))
                        "adr_head" -> startActivity(Intent(this@LoginActivity, AdrHeadDashboardActivity::class.java))
                        "administrator" -> startActivity(Intent(this@LoginActivity, AdminDashboardActivity::class.java))
                        else -> Toast.makeText(this@LoginActivity, "Unknown Role", Toast.LENGTH_SHORT).show()
                    }
                    finish()
                } else {
                    Toast.makeText(this@LoginActivity, "Invalid Credentials", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@LoginActivity, "Network Error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }
}