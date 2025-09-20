import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const lead = await prisma.lead.findFirst({
      where: {
        id: params.id,
        ownerId: userId,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Parse JSON fields
    const parsedLead = {
      ...lead,
      assignedTo: (lead as any).assignedTo ? (() => {
        try {
          return JSON.parse((lead as any).assignedTo);
        } catch (e) {
          console.error('Error parsing assignedTo:', e);
          return null;
        }
      })() : null,
      interestedProducts: (lead as any).interestedProducts ? (() => {
        try {
          return JSON.parse((lead as any).interestedProducts);
        } catch (e) {
          console.error('Error parsing interestedProducts:', e);
          return null;
        }
      })() : null,
    };

    return NextResponse.json({ lead: parsedLead });
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('PUT /api/leads/[id] - Starting request for ID:', params.id);
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log('No session or user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      console.log('No user ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Request body:', body);
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      source,
      status,
      score,
      notes,
      subject,
      leadType,
      assignedTo,
      interestedProducts,
      followUpDate,
    } = body;

    // Check if lead exists and belongs to user
    console.log('Checking if lead exists for ID:', params.id, 'and user:', userId);
    const existingLead = await prisma.lead.findFirst({
      where: {
        id: params.id,
        ownerId: userId,
      },
    });

    if (!existingLead) {
      console.log('Lead not found or does not belong to user');
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    console.log('Lead found, updating with data:', {
      firstName,
      lastName,
      email,
      phone,
      company,
      source,
      status,
      score,
      notes,
      subject,
      leadType,
      assignedTo: assignedTo ? 'JSON data' : null,
      interestedProducts: interestedProducts ? 'JSON data' : null,
      followUpDate,
    });

    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        company,
        source,
        status,
        score,
        notes,
        subject: subject as any,
        leadType: leadType as any,
        assignedTo: assignedTo && Array.isArray(assignedTo) && assignedTo.length > 0 ? JSON.stringify(assignedTo) : null,
        interestedProducts: interestedProducts && Array.isArray(interestedProducts) && interestedProducts.length > 0 ? JSON.stringify(interestedProducts) : null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
      } as any,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        entityType: 'Lead',
        entityId: lead.id,
        action: 'updated',
        details: { changes: body },
        userId: userId,
      },
    });

    // Parse JSON fields
    const parsedLead = {
      ...lead,
      assignedTo: (lead as any).assignedTo ? (() => {
        try {
          return JSON.parse((lead as any).assignedTo);
        } catch (e) {
          console.error('Error parsing assignedTo:', e);
          return null;
        }
      })() : null,
      interestedProducts: (lead as any).interestedProducts ? (() => {
        try {
          return JSON.parse((lead as any).interestedProducts);
        } catch (e) {
          console.error('Error parsing interestedProducts:', e);
          return null;
        }
      })() : null,
    };

    return NextResponse.json(parsedLead);
  } catch (error) {
    console.error('Error updating lead:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Failed to update lead', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if lead exists and belongs to user
    const existingLead = await prisma.lead.findFirst({
      where: {
        id: params.id,
        ownerId: userId,
      },
    });

    if (!existingLead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    await prisma.lead.delete({
      where: { id: params.id },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        entityType: 'Lead',
        entityId: params.id,
        action: 'deleted',
        details: { lead: existingLead },
        userId: userId,
      },
    });

    return NextResponse.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}
