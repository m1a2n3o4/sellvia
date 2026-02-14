import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { getSuperAdminId } from '@/lib/auth/middleware';

const prisma = new PrismaClient();

// GET - List all clients/tenants
export async function GET(request: NextRequest) {
  try {
    // Verify super admin authentication
    await getSuperAdminId(request);

    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        clientName: true,
        businessName: true,
        mobile: true,
        address: true,
        status: true,
        features: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ tenants });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

// POST - Create new client/tenant
export async function POST(request: NextRequest) {
  try {
    // Verify super admin authentication
    await getSuperAdminId(request);

    const body = await request.json();
    const { clientName, businessName, mobile, address, status, features } = body;

    // Validate required fields
    if (!clientName || !businessName || !mobile || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if mobile already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { mobile },
    });

    if (existingTenant) {
      return NextResponse.json(
        { error: 'Mobile number already registered' },
        { status: 400 }
      );
    }

    // Default password is "client"
    const defaultPassword = 'client';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        clientName,
        businessName,
        mobile,
        passwordHash,
        address,
        status: status || 'active',
        features: features || {
          inventory: true,
          orders: true,
          customers: true,
          broadcasting: false,
          whatsapp: false,
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        tenant: {
          id: tenant.id,
          clientName: tenant.clientName,
          businessName: tenant.businessName,
          mobile: tenant.mobile,
          address: tenant.address,
          status: tenant.status,
          features: tenant.features,
        },
        defaultPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}
