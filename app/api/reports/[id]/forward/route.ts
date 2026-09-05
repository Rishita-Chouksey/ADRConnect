import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const {
      forwardedTo = 'pvpi_regulatory', // 'pvpi_regulatory' | 'drug_safety_committee' | 'hospital_pv_unit'
      notes,
      forwardedById,
    } = body;

    const report = await db.adrReport.findUnique({ where: { id } });
    if (!report) {
      return NextResponse.json({ error: 'ADR report not found.' }, { status: 404 });
    }

    let forwarderId = forwardedById;
    if (!forwarderId) {
      const adrHead = await db.user.findFirst({ where: { role: 'adr_head' } });
      forwarderId = adrHead?.id;
    }

    if (!forwarderId) {
      return NextResponse.json({ error: 'Authorized ADR officer not found.' }, { status: 400 });
    }

    // Generate unique official reference number
    const prefix =
      forwardedTo === 'pvpi_regulatory'
        ? 'PVPI-CDSCO'
        : forwardedTo === 'drug_safety_committee'
        ? 'HOSP-DSC'
        : 'HOSP-PVU';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const referenceNo = `${prefix}-2026-${randomSuffix}`;

    const record = await db.forwardingRecord.create({
      data: {
        adrReportId: id,
        forwardedTo,
        referenceNo,
        notes: notes || 'Forwarded for regulatory pharmacovigilance review and batch signal analysis.',
        forwardedById: forwarderId,
      },
      include: {
        forwardedBy: true,
      },
    });

    // Update case status to 'escalated'
    await db.adrReport.update({
      where: { id },
      data: {
        status: 'escalated',
        amendments: {
          create: {
            fieldName: 'Official Forwarding',
            oldValue: report.status,
            newValue: `Forwarded to ${forwardedTo.toUpperCase()} (Ref: ${referenceNo})`,
            editedById: forwarderId,
          },
        },
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error: any) {
    console.error('Failed to forward report:', error);
    return NextResponse.json({ error: 'Failed to forward report', details: error.message }, { status: 500 });
  }
}
