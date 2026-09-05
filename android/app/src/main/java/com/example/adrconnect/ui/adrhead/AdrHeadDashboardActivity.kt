package com.example.adrconnect.ui.adrhead

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.example.adrconnect.databinding.ActivityAdrHeadDashboardBinding

class AdrHeadDashboardActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAdrHeadDashboardBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Inflate the binding class
        binding = ActivityAdrHeadDashboardBinding.inflate(layoutInflater)
        
        // Set content view using the binding root
        setContentView(binding.root)
    }
}