import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('activeOnly') !== 'false';

    const notices = await db.safetyNotice.findMany({
      where: activeOnly ? { active: true } : {},
      include: {
        createdBy: true,
        batch: {
          include: {
            product: true,
            manufacturer: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(notices);
  } catch (error: any) {
    console.error('Failed to fetch safety notices:', error);
    return NextResponse.json({ error: 'Failed to fetch safety notices', details: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, message, severity = 'warning', batchId, targetWard, createdById } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required.' }, { status: 400 });
    }

    let authorId = createdById;
    if (!authorId) {
      const admin = await db.user.findFirst({ where: { role: 'admin' } });
      authorId = admin?.id;
    }

    if (!authorId) {
      return NextResponse.json({ error: 'Admin user not found.' }, { status: 400 });
    }

    const notice = await db.safetyNotice.create({
      data: {
        title: title.trim(),
        message: message.trim(),
        severity,
        batchId: batchId || null,
        targetWard: targetWard || null,
        active: true,
        createdById: authorId,
      },
      include: {
        createdBy: true,
        batch: {
          include: {
            product: true,
            manufacturer: true,
          },
        },
      },
    });

    return NextResponse.json(notice, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create safety notice:', error);
    return NextResponse.json({ error: 'Failed to create safety notice', details: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, active } = body;

    if (!id) return NextResponse.json({ error: 'Notice ID is required.' }, { status: 400 });

    const updated = await db.safetyNotice.update({
      where: { id },
      data: {
        active: !!active,
        resolvedAt: active ? null : new Date(),
      },
      include: {
        createdBy: true,
        batch: {
          include: { product: true, manufacturer: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Failed to update safety notice:', error);
    return NextResponse.json({ error: 'Failed to update notice', details: error.message }, { status: 500 });
  }
}
