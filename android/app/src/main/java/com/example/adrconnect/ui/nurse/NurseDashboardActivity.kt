package com.example.adrconnect.ui.nurse

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.adrconnect.data.models.AdrReportCreate
import com.example.adrconnect.data.remote.RetrofitClient
import com.example.adrconnect.databinding.ActivityNurseDashboardBinding
import kotlinx.coroutines.launch

class NurseDashboardActivity : AppCompatActivity() {

    private lateinit var binding: ActivityNurseDashboardBinding
    private var selectedBatchId: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityNurseDashboardBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnSearchBatch.setOnClickListener {
            val query = binding.etBatchQuery.text.toString().trim()
            if (query.isNotEmpty()) searchBatch(query)
        }

        binding.btnSubmitReport.setOnClickListener {
            submitReport()
        }
    }

    private fun searchBatch(query: String) {
        lifecycleScope.launch {
            try {
                val api = RetrofitClient.getApiService(this@NurseDashboardActivity)
                val response = api.searchBatches(query)

                if (response.isSuccessful && !response.body().isNullOrEmpty()) {
                    val batch = response.body()!![0]
                    selectedBatchId = batch.id
                    binding.tvBatchInfo.text = "Product: ${batch.product_name}\nMfg: ${batch.manufacturer_name}"
                } else {
                    Toast.makeText(this@NurseDashboardActivity, "Batch not found", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@NurseDashboardActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun submitReport() {
        val batchId = selectedBatchId ?: run {
            Toast.makeText(this, "Select a batch first", Toast.LENGTH_SHORT).show()
            return
        }

        val age = binding.etAge.text.toString().toIntOrNull() ?: 0
        val gender = binding.etGender.text.toString()
        val reaction = binding.etReaction.text.toString()
        val severity = binding.etSeverity.text.toString()

        val report = AdrReportCreate(age, gender, batchId, reaction, severity)

        lifecycleScope.launch {
            try {
                val api = RetrofitClient.getApiService(this@NurseDashboardActivity)
                val response = api.submitReport(report)

                if (response.isSuccessful) {
                    Toast.makeText(this@NurseDashboardActivity, "ADR Submitted!", Toast.LENGTH_LONG).show()
                    finish()
                }
            } catch (e: Exception) {
                Toast.makeText(this@NurseDashboardActivity, "Submission Error", Toast.LENGTH_SHORT).show()
            }
        }
    }
}