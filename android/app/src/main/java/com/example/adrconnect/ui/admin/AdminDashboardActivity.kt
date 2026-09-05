package com.example.adrconnect.ui.admin

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.example.adrconnect.databinding.ActivityAdminDashboardBinding

class AdminDashboardActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAdminDashboardBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAdminDashboardBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Add Batch Intake and Alert Monitoring logic here
    }
}