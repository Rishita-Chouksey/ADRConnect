package com.example.adrconnect.ui.nurse

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.adrconnect.data.models.AdrReportCreate
import com.example.adrconnect.data.remote.RetrofitClient
import com.example.adrconnect.databinding.ActivityNurseDashboardBinding
import com.example.adrconnect.ui.auth.LoginActivity
import com.example.adrconnect.utils.SessionManager
import kotlinx.coroutines.launch

class NurseDashboardActivity : AppCompatActivity() {

    private lateinit var binding: ActivityNurseDashboardBinding
    private lateinit var sessionManager: SessionManager
    private var selectedBatchId: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityNurseDashboardBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)

        binding.btnSearchBatch.setOnClickListener {
            val query = binding.etBatchQuery.text.toString().trim()
            if (query.isNotEmpty()) {
                searchBatch(query)
            } else {
                Toast.makeText(this, "Enter a batch number to search", Toast.LENGTH_SHORT).show()
            }
        }

        binding.btnSubmitReport.setOnClickListener {
            submitReport()
        }

        // Optional: Logout functionality if a logout button exists in layout
        binding.btnLogout?.setOnClickListener {
            logoutUser()
        }
    }

    private fun searchBatch(query: String) {
        showLoading(true)

        lifecycleScope.launch {
            try {
                val api = RetrofitClient.getApiService(this@NurseDashboardActivity)
                val response = api.searchBatches(query)

                showLoading(false)

                if (response.isSuccessful && !response.body().isNullOrEmpty()) {
                    val batch = response.body()!![0]
                    selectedBatchId = batch.id
                    binding.tvBatchInfo.text = "Product: ${batch.product_name}\nMfg: ${batch.manufacturer_name}"
                    binding.tvBatchInfo.visibility = View.VISIBLE
                } else {
                    selectedBatchId = null
                    binding.tvBatchInfo.text = ""
                    binding.tvBatchInfo.visibility = View.GONE
                    Toast.makeText(this@NurseDashboardActivity, "Batch not found", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                showLoading(false)
                Toast.makeText(this@NurseDashboardActivity, "Error: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun submitReport() {
        val batchId = selectedBatchId ?: run {
            Toast.makeText(this, "Select a valid batch first", Toast.LENGTH_SHORT).show()
            return
        }

        val ageText = binding.etAge.text.toString().trim()
        val gender = binding.etGender.text.toString().trim()
        val reaction = binding.etReaction.text.toString().trim()
        val severity = binding.etSeverity.text.toString().trim()

        if (ageText.isEmpty() || gender.isEmpty() || reaction.isEmpty() || severity.isEmpty()) {
            Toast.makeText(this, "Please fill in all report fields", Toast.LENGTH_SHORT).show()
            return
        }

        val age = ageText.toIntOrNull() ?: 0
        val report = AdrReportCreate(age, gender, batchId, reaction, severity)

        showLoading(true)

        lifecycleScope.launch {
            try {
                val api = RetrofitClient.getApiService(this@NurseDashboardActivity)
                val response = api.submitReport(report)

                showLoading(false)

                if (response.isSuccessful) {
                    Toast.makeText(this@NurseDashboardActivity, "ADR Report Submitted Successfully!", Toast.LENGTH_LONG).show()
                    clearForm()
                } else {
                    Toast.makeText(this@NurseDashboardActivity, "Submission Failed (${response.code()})", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                showLoading(false)
                Toast.makeText(this@NurseDashboardActivity, "Submission Error: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun clearForm() {
        selectedBatchId = null
        binding.etBatchQuery.text?.clear()
        binding.etAge.text?.clear()
        binding.etGender.text?.clear()
        binding.etReaction.text?.clear()
        binding.etSeverity.text?.clear()
        binding.tvBatchInfo.text = ""
        binding.tvBatchInfo.visibility = View.GONE
    }

    private fun showLoading(isLoading: Boolean) {
        binding.btnSubmitReport.isEnabled = !isLoading
        binding.btnSearchBatch.isEnabled = !isLoading
        binding.progressBar?.visibility = if (isLoading) View.VISIBLE else View.GONE
    }

    private fun logoutUser() {
        sessionManager.clearSession()
        val intent = Intent(this, LoginActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}