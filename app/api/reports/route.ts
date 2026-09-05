import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const caseType = searchParams.get('caseType');
    const search = searchParams.get('search');
    const ward = searchParams.get('ward');
    const reporterId = searchParams.get('reporterId');

    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }
    if (caseType && caseType !== 'all') {
      where.caseType = caseType;
    }
    if (ward && ward !== 'all') {
      where.ward = ward;
    }
    if (reporterId) {
      where.reporterUserId = reporterId;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { patientInitials: { contains: q, mode: 'insensitive' } },
        { reactionDescription: { contains: q, mode: 'insensitive' } },
        {
          medications: {
            some: {
              batch: {
                OR: [
                  { batchNo: { contains: q, mode: 'insensitive' } },
                  { product: { name: { contains: q, mode: 'insensitive' } } },
                  { manufacturer: { name: { contains: q, mode: 'insensitive' } } },
                ],
              },
            },
          },
        },
      ];
    }

    const reports = await db.adrReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: true,
        hospital: true,
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
        followUps: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            reactionDescription: true,
          },
        },
        parentReport: {
          select: {
            id: true,
            patientInitials: true,
            status: true,
          },
        },
        _count: {
          select: {
            amendments: true,
            forwardingRecords: true,
          },
        },
      },
    });

    return NextResponse.json(reports);
  } catch (error: any) {
    console.error('Failed to fetch reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports', details: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      patientInitials,
      patientAge,
      patientSex,
      patientWeightKg,
      ward,
      reactionStartDate,
      reactionRecoveryDate,
      reactionDescription,
      severity = 'moderate',
      seriousnessFlags = {},
      otherHistory,
      outcome = 'unknown',
      status = 'submitted', // 'draft' or 'submitted'
      reporterUserId,
      medications = [], // [{ batchId, doseUsed, routeUsed, frequency, therapyStartDate, therapyStopDate, indication }]
    } = body;

    // Validate required fields when completing submit
    if (status === 'submitted') {
      if (!patientInitials || !patientAge || !patientSex || !ward || !reactionStartDate || !reactionDescription) {
        return NextResponse.json(
          { error: 'Missing required clinical reporting fields for complete submission.' },
          { status: 400 }
        );
      }
    }

    // Default hospital
    const hospital = await db.hospital.findFirst();
    if (!hospital) {
      return NextResponse.json({ error: 'Hospital record not found.' }, { status: 500 });
    }

    // Default reporter if not provided
    let reporterId = reporterUserId;
    if (!reporterId) {
      const defaultUser = await db.user.findFirst({ where: { role: 'nurse' } });
      reporterId = defaultUser?.id;
    }

    if (!reporterId) {
      return NextResponse.json({ error: 'Reporter user not found.' }, { status: 400 });
    }

    // Fallback batch if no batch selected
    let fallbackBatch = await db.batch.findFirst();

    const newReport = await db.adrReport.create({
      data: {
        hospitalId: hospital.id,
        reporterUserId: reporterId,
        caseType: 'initial',
        patientInitials: patientInitials || 'P/N',
        patientAge: patientAge || 'Unknown',
        patientSex: patientSex || 'Other',
        patientWeightKg: patientWeightKg ? parseFloat(patientWeightKg) : null,
        ward: ward || 'General Ward',
        reactionStartDate: reactionStartDate ? new Date(reactionStartDate) : new Date(),
        reactionRecoveryDate: reactionRecoveryDate ? new Date(reactionRecoveryDate) : null,
        reactionDescription: reactionDescription || 'Adverse drug reaction observed.',
        severity,
        seriousnessFlags,
        otherHistory: otherHistory || null,
        outcome,
        status,
        syncStatus: 'synced',
        medications: {
          create: (medications || []).map((med: any, index: number) => {
            let targetBatchId = med.batchId;
            if (!targetBatchId || targetBatchId === 'no_batch' || targetBatchId === 'none') {
              targetBatchId = fallbackBatch?.id;
            }
            return {
              batchId: targetBatchId,
              doseUsed: med.doseUsed || null,
              routeUsed: med.routeUsed || 'IV Infusion',
              frequency: med.frequency || null,
              therapyStartDate: med.therapyStartDate ? new Date(med.therapyStartDate) : null,
              therapyStopDate: med.therapyStopDate ? new Date(med.therapyStopDate) : null,
              indication: med.indication || null,
              actionTaken: med.actionTaken || 'withdrawn',
              reintroductionReaction: med.reintroductionReaction || 'na',
              rowOrder: index,
            };
          }),
        },
      },
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
    });

    return NextResponse.json(newReport, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create ADR report:', error);
    return NextResponse.json({ error: 'Failed to create ADR report', details: error.message }, { status: 500 });
  }
}
