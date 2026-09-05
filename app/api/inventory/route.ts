import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'all' | 'products' | 'manufacturers' | 'batches'

    if (type === 'products') {
      const products = await db.drugProduct.findMany({
        include: {
          _count: { select: { batches: true } },
        },
        orderBy: { name: 'asc' },
      });
      return NextResponse.json(products);
    }

    if (type === 'manufacturers') {
      const manufacturers = await db.manufacturer.findMany({
        include: {
          _count: { select: { batches: true } },
        },
        orderBy: { name: 'asc' },
      });
      return NextResponse.json(manufacturers);
    }

    // Default: return all three for inventory management
    const products = await db.drugProduct.findMany({ orderBy: { name: 'asc' } });
    const manufacturers = await db.manufacturer.findMany({ orderBy: { name: 'asc' } });
    const batches = await db.batch.findMany({
      include: {
        product: true,
        manufacturer: true,
        highAlerts: { where: { active: true } },
        _count: { select: { medications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ products, manufacturers, batches });
  } catch (error: any) {
    console.error('Failed to fetch inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory', details: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { entityType } = body; // 'product' | 'manufacturer' | 'batch'

    if (entityType === 'product') {
      const { name, genericName, form } = body;
      if (!name) return NextResponse.json({ error: 'Product name is required.' }, { status: 400 });

      const newProduct = await db.drugProduct.create({
        data: {
          name: name.trim(),
          genericName: genericName ? genericName.trim() : null,
          form: form ? form.trim() : '500ml IV infusion',
        },
      });
      return NextResponse.json(newProduct, { status: 201 });
    }

    if (entityType === 'manufacturer') {
      const { name, address, licenseNo } = body;
      if (!name) return NextResponse.json({ error: 'Manufacturer name is required.' }, { status: 400 });

      const newMfr = await db.manufacturer.create({
        data: {
          name: name.trim(),
          address: address ? address.trim() : null,
          licenseNo: licenseNo ? licenseNo.trim() : null,
        },
      });
      return NextResponse.json(newMfr, { status: 201 });
    }

    if (entityType === 'batch') {
      const { productId, manufacturerId, batchNo, mfgDate, expDate, barcodeData } = body;
      if (!productId || !manufacturerId || !batchNo) {
        return NextResponse.json(
          { error: 'Product, Manufacturer, and Batch Number are required.' },
          { status: 400 }
        );
      }

      // Check for duplicate
      const existing = await db.batch.findFirst({
        where: {
          productId,
          manufacturerId,
          batchNo: batchNo.trim(),
        },
      });

      if (existing) {
        return NextResponse.json({ error: 'This batch already exists for the selected product and manufacturer.' }, { status: 409 });
      }

      const newBatch = await db.batch.create({
        data: {
          productId,
          manufacturerId,
          batchNo: batchNo.trim().toUpperCase(),
          mfgDate: mfgDate ? new Date(mfgDate) : null,
          expDate: expDate ? new Date(expDate) : null,
          barcodeData: barcodeData || null,
        },
        include: {
          product: true,
          manufacturer: true,
        },
      });

      return NextResponse.json(newBatch, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid entityType specified.' }, { status: 400 });
  } catch (error: any) {
    console.error('Failed to create inventory item:', error);
    return NextResponse.json({ error: 'Failed to create item', details: error.message }, { status: 500 });
  }
}
