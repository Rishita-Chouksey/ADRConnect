import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const report = await db.adrReport.findUnique({
      where: { id },
      include: {
        hospital: true,
        reporter: true,
        medications: {
          include: {
            batch: {
              include: {
                product: true,
                manufacturer: true,
                highAlerts: { where: { active: true } },
              },
            },
          },
          orderBy: { rowOrder: 'asc' },
        },
        amendments: {
          include: { editedBy: true },
          orderBy: { editedAt: 'desc' },
        },
        forwardingRecords: {
          include: { forwardedBy: true },
          orderBy: { forwardedAt: 'desc' },
        },
        parentReport: {
          include: {
            reporter: true,
            medications: {
              include: {
                batch: { include: { product: true } },
              },
            },
          },
        },
        followUps: {
          include: {
            reporter: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'ADR report not found.' }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (error: any) {
    console.error('Failed to get report:', error);
    return NextResponse.json({ error: 'Failed to get report', details: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      status,
      severity,
      outcome,
      reactionRecoveryDate,
      causalityAssessment,
      medicationId,
      amendmentNote,
      editedById,
    } = body;

    const currentReport = await db.adrReport.findUnique({
      where: { id },
      include: { medications: true },
    });

    if (!currentReport) {
      return NextResponse.json({ error: 'ADR report not found.' }, { status: 404 });
    }

    // Default editor
    let editorId = editedById;
    if (!editorId) {
      const adrHead = await db.user.findFirst({ where: { role: 'adr_head' } });
      editorId = adrHead?.id;
    }

    const updates: any = {};
    const amendmentsToCreate: any[] = [];

    if (status && status !== currentReport.status) {
      updates.status = status;
      if (editorId) {
        amendmentsToCreate.push({
          fieldName: 'Status Workflow',
          oldValue: currentReport.status,
          newValue: status,
          editedById: editorId,
        });
      }
    }

    if (severity && severity !== currentReport.severity) {
      updates.severity = severity;
      if (editorId) {
        amendmentsToCreate.push({
          fieldName: 'Severity Assessment',
          oldValue: currentReport.severity || 'moderate',
          newValue: severity,
          editedById: editorId,
        });
      }
    }

    if (outcome && outcome !== currentReport.outcome) {
      updates.outcome = outcome;
      if (editorId) {
        amendmentsToCreate.push({
          fieldName: 'Clinical Outcome',
          oldValue: currentReport.outcome || 'unknown',
          newValue: outcome,
          editedById: editorId,
        });
      }
    }

    if (reactionRecoveryDate) {
      updates.reactionRecoveryDate = new Date(reactionRecoveryDate);
    }

    // Update medication causality if provided
    if (causalityAssessment) {
      const targetMed = medicationId
        ? currentReport.medications.find((m) => m.id === medicationId)
        : currentReport.medications[0];

      if (targetMed) {
        await db.adrMedication.update({
          where: { id: targetMed.id },
          data: { causalityAssessment },
        });

        if (editorId) {
          amendmentsToCreate.push({
            adrMedicationId: targetMed.id,
            fieldName: 'WHO-UMC Causality Assessment',
            oldValue: targetMed.causalityAssessment || 'Unassessed',
            newValue: causalityAssessment,
            editedById: editorId,
          });
        }
      }
    }

    if (amendmentNote && editorId) {
      amendmentsToCreate.push({
        fieldName: 'Clinical Evaluation Notes',
        oldValue: null,
        newValue: amendmentNote,
        editedById: editorId,
      });
    }

    // Apply report updates and amendments
    const updated = await db.adrReport.update({
      where: { id },
      data: {
        ...updates,
        amendments: amendmentsToCreate.length > 0 ? { create: amendmentsToCreate } : undefined,
      },
      include: {
        hospital: true,
        reporter: true,
        medications: {
          include: {
            batch: {
              include: { product: true, manufacturer: true },
            },
          },
        },
        amendments: {
          include: { editedBy: true },
          orderBy: { editedAt: 'desc' },
        },
        forwardingRecords: {
          include: { forwardedBy: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Failed to update report:', error);
    return NextResponse.json({ error: 'Failed to update report', details: error.message }, { status: 500 });
  }
}
