package com.example.adrconnect.ui.adrhead

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.example.adrconnect.databinding.ActivityAdrHeadDashboardBinding

class AdrHeadDashboardActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAdrHeadDashboardBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAdrHeadDashboardBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Add ADR Head review logic and report fetching here
    }
}