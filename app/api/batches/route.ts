import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const productId = searchParams.get('productId');

    const where: any = {};
    if (productId) {
      where.productId = productId;
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { batchNo: { contains: q, mode: 'insensitive' } },
        { product: { name: { contains: q, mode: 'insensitive' } } },
        { manufacturer: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const batches = await db.batch.findMany({
      where,
      include: {
        product: true,
        manufacturer: true,
        highAlerts: {
          where: { active: true },
        },
        safetyNotices: {
          where: { active: true },
        },
        _count: {
          select: {
            medications: true, // Every medication link is an ADR incident
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = batches.map((b) => ({
      id: b.id,
      batchNo: b.batchNo,
      productId: b.productId,
      productName: b.product.name,
      genericName: b.product.genericName,
      form: b.product.form,
      manufacturerId: b.manufacturerId,
      manufacturerName: b.manufacturer.name,
      mfgDate: b.mfgDate,
      expDate: b.expDate,
      barcodeData: b.barcodeData,
      reactionCount: b._count.medications,
      isHighAlert: b.highAlerts.length > 0,
      activeAlertReason: b.highAlerts[0]?.reason || null,
      activeSafetyNotices: b.safetyNotices.map((n) => n.title),
      riskTier:
        b.highAlerts.length > 0 || b._count.medications >= 3
          ? 'high_risk'
          : b._count.medications >= 1
          ? 'watchlist'
          : 'safe',
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error('Failed to fetch batches:', error);
    return NextResponse.json({ error: 'Failed to fetch batches', details: error.message }, { status: 500 });
  }
}
