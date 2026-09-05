import { NextResponse } from 'next/server';
import { db } from '@/db';

export async function GET() {
  try {
    const [reports, batches, highAlerts] = await Promise.all([
      db.adrReport.findMany({
        include: {
          medications: {
            include: {
              batch: {
                include: {
                  product: true,
                  manufacturer: true,
                },
              },
            },
          },
        },
        orderBy: { reportDate: 'asc' },
      }),
      db.batch.findMany({
        include: {
          product: true,
          manufacturer: true,
          _count: { select: { medications: true } },
          highAlerts: { where: { active: true } },
        },
      }),
      db.highAlert.findMany({
        where: { active: true },
        include: {
          batch: { include: { product: true } },
          manufacturer: true,
        },
      }),
    ]);

    // 1. KPI Case Statistics
    const totalReports = reports.length;
    const openCases = reports.filter((r) => r.status !== 'closed' && r.status !== 'draft').length;
    const closedCases = reports.filter((r) => r.status === 'closed').length;
    const followUpCases = reports.filter((r) => r.caseType === 'follow_up').length;
    const severeCases = reports.filter((r) => r.severity === 'severe' || r.severity === 'life_threatening').length;
    const pendingReview = reports.filter((r) => r.status === 'submitted').length;

    // 2. Most reported drugs & IV fluids
    const productCounts: Record<string, { name: string; genericName: string; form: string; count: number }> = {};
    const ivFluidCounts: Record<string, { name: string; count: number }> = {};
    const manufacturerCounts: Record<string, { name: string; count: number }> = {};
    const batchCounts: Record<string, { batchNo: string; productName: string; manufacturerName: string; count: number }> = {};
    const severityCounts: Record<string, number> = { mild: 0, moderate: 0, severe: 0, life_threatening: 0 };
    const symptomFrequency: Record<string, number> = {};

    for (const report of reports) {
      // Severity
      const sev = (report.severity as string) || 'moderate';
      if (severityCounts[sev] !== undefined) {
        severityCounts[sev]++;
      } else {
        severityCounts.moderate++;
      }

      // Symptoms from reactionDescription
      const descLower = (report.reactionDescription || '').toLowerCase();
      const detectedSymptoms = [
        'shivering',
        'vomiting',
        'fever',
        'rash',
        'nausea',
        'headache',
        'breathlessness',
        'chills',
        'rigors',
        'tachycardia',
        'hypotension',
      ];
      for (const sym of detectedSymptoms) {
        if (descLower.includes(sym)) {
          const capitalized = sym.charAt(0).toUpperCase() + sym.slice(1);
          symptomFrequency[capitalized] = (symptomFrequency[capitalized] || 0) + 1;
        }
      }

      // Medications
      for (const med of report.medications) {
        const p = med.batch?.product;
        const m = med.batch?.manufacturer;
        const b = med.batch;

        if (p) {
          if (!productCounts[p.id]) {
            productCounts[p.id] = { name: p.name, genericName: p.genericName || '', form: p.form || '', count: 0 };
          }
          productCounts[p.id].count++;

          const isIv = (p.form || '').toLowerCase().includes('iv') || (p.name || '').toLowerCase().includes('infusion') || (p.name || '').toLowerCase().includes('saline') || (p.name || '').toLowerCase().includes('dextrose') || (p.name || '').toLowerCase().includes('lactate');
          if (isIv) {
            if (!ivFluidCounts[p.id]) {
              ivFluidCounts[p.id] = { name: p.name, count: 0 };
            }
            ivFluidCounts[p.id].count++;
          }
        }

        if (m) {
          if (!manufacturerCounts[m.id]) {
            manufacturerCounts[m.id] = { name: m.name, count: 0 };
          }
          manufacturerCounts[m.id].count++;
        }

        if (b) {
          if (!batchCounts[b.id]) {
            batchCounts[b.id] = {
              batchNo: b.batchNo,
              productName: p?.name || 'Unknown Product',
              manufacturerName: m?.name || 'Unknown Mfr',
              count: 0,
            };
          }
          batchCounts[b.id].count++;
        }
      }
    }

    // 3. Batch Risk Monitoring — Multi-factor Risk Score
    const batchRiskList = batches.map((b) => {
      // Find all reports linked to this batch
      const batchReports = reports.filter((r) =>
        r.medications.some((m) => m.batchId === b.id)
      );

      const reactionCount = batchReports.length;
      const severeCount = batchReports.filter(
        (r) => r.severity === 'severe' || r.severity === 'life_threatening'
      ).length;
      const uniqueReporters = new Set(batchReports.map((r) => r.reporterUserId)).size;
      const isHighAlert = b.highAlerts.length > 0;

      // Risk score formula: frequency + 3*(severe) + uniqueReporters + highAlertBonus
      const riskScore = reactionCount * 1 + severeCount * 3 + uniqueReporters * 1 + (isHighAlert ? 5 : 0);

      let riskLevel: 'safe' | 'watchlist' | 'high_risk' = 'safe';
      if (riskScore >= 5 || isHighAlert || reactionCount >= 3) {
        riskLevel = 'high_risk';
      } else if (riskScore >= 2 || reactionCount >= 1) {
        riskLevel = 'watchlist';
      }

      return {
        id: b.id,
        batchNo: b.batchNo,
        productName: b.product.name,
        manufacturerName: b.manufacturer.name,
        expDate: b.expDate,
        reactionCount,
        severeCount,
        riskScore,
        riskLevel,
        isHighAlert,
        alertReason: b.highAlerts[0]?.reason || null,
      };
    });

    batchRiskList.sort((a, b) => b.riskScore - a.riskScore);

    // Monthly trends (formatted timeline: e.g. "Apr 2026", "May 2026")
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap: Record<string, number> = {};

    // Default last 6 months seed
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthlyMap[label] = 0;
    }

    for (const r of reports) {
      const d = new Date(r.reportDate || r.createdAt);
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthlyMap[label] = (monthlyMap[label] || 0) + 1;
    }

    const monthlyTrends = Object.entries(monthlyMap).map(([month, count]) => ({
      month,
      count,
    }));

    return NextResponse.json({
      kpi: {
        totalReports,
        openCases,
        closedCases,
        followUpCases,
        severeCases,
        pendingReview,
      },
      mostReportedDrugs: Object.values(productCounts).sort((a, b) => b.count - a.count),
      mostReportedIvFluids: Object.values(ivFluidCounts).sort((a, b) => b.count - a.count),
      manufacturerFrequency: Object.values(manufacturerCounts).sort((a, b) => b.count - a.count),
      batchFrequency: Object.values(batchCounts).sort((a, b) => b.count - a.count),
      severityDistribution: [
        { label: 'Mild', count: severityCounts.mild, color: '#10b981' },
        { label: 'Moderate', count: severityCounts.moderate, color: '#f59e0b' },
        { label: 'Severe', count: severityCounts.severe, color: '#ef4444' },
        { label: 'Life-Threatening', count: severityCounts.life_threatening, color: '#991b1b' },
      ],
      symptomFrequency: Object.entries(symptomFrequency)
        .map(([symptom, count]) => ({ symptom, count }))
        .sort((a, b) => b.count - a.count),
      batchRiskMonitoring: batchRiskList,
      monthlyTrends,
      activeAlertsCount: highAlerts.length,
    });
  } catch (error: any) {
    console.error('Failed to generate analytics:', error);
    return NextResponse.json({ error: 'Failed to generate analytics', details: error.message }, { status: 500 });
  }
}
