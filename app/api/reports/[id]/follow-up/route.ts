import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const parentReport = await db.adrReport.findUnique({
      where: { id },
      include: {
        medications: true,
      },
    });

    if (!parentReport) {
      return NextResponse.json({ error: 'Parent ADR report not found.' }, { status: 404 });
    }

    const {
      reactionDescription,
      severity = parentReport.severity || 'moderate',
      outcome = 'recovering',
      reactionRecoveryDate,
      treatmentResponse,
      reporterUserId,
    } = body;

    let reporterId = reporterUserId;
    if (!reporterId) {
      const defaultUser = await db.user.findFirst({ where: { role: 'nurse' } });
      reporterId = defaultUser?.id || parentReport.reporterUserId;
    }

    const fullDescription = treatmentResponse
      ? `${reactionDescription}\n\n[Treatment Response & Clinical Course]: ${treatmentResponse}`
      : reactionDescription;

    const followUp = await db.adrReport.create({
      data: {
        hospitalId: parentReport.hospitalId,
        reporterUserId: reporterId,
        caseType: 'follow_up',
        parentReportId: parentReport.id,
        patientInitials: parentReport.patientInitials,
        patientAge: parentReport.patientAge,
        patientSex: parentReport.patientSex,
        patientWeightKg: parentReport.patientWeightKg,
        ward: parentReport.ward,
        reactionStartDate: parentReport.reactionStartDate,
        reactionRecoveryDate: reactionRecoveryDate ? new Date(reactionRecoveryDate) : null,
        reactionDescription: fullDescription,
        severity,
        outcome,
        status: 'submitted',
        syncStatus: 'synced',
        medications: {
          create: parentReport.medications.map((m, index) => ({
            batchId: m.batchId,
            doseUsed: m.doseUsed,
            routeUsed: m.routeUsed,
            frequency: m.frequency,
            therapyStartDate: m.therapyStartDate,
            therapyStopDate: m.therapyStopDate,
            indication: m.indication,
            actionTaken: m.actionTaken,
            reintroductionReaction: m.reintroductionReaction,
            causalityAssessment: m.causalityAssessment,
            rowOrder: index,
          })),
        },
      },
      include: {
        parentReport: true,
        medications: {
          include: {
            batch: { include: { product: true, manufacturer: true } },
          },
        },
      },
    });

    // Update parent report's outcome and status if recovering/recovered
    await db.adrReport.update({
      where: { id: parentReport.id },
      data: {
        outcome,
        reactionRecoveryDate: reactionRecoveryDate ? new Date(reactionRecoveryDate) : parentReport.reactionRecoveryDate,
      },
    });

    return NextResponse.json(followUp, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create follow-up report:', error);
    return NextResponse.json({ error: 'Failed to create follow-up report', details: error.message }, { status: 500 });
  }
}
