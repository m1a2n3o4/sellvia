import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { getSuperAdminId } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

// GET - Get single client by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify super admin authentication
    await getSuperAdminId(request);

    const tenant = await prisma.tenant.findUnique({
      where: { id: params.id },
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

    if (!tenant) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ tenant });
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

// PUT - Update client
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify super admin authentication
    await getSuperAdminId(request);

    const body = await request.json();
    const { clientName, businessName, mobile, address, status, features, password } = body;

    // Check if client exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { id: params.id },
    });

    if (!existingTenant) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // If mobile is being changed, check if new mobile already exists
    if (mobile && mobile !== existingTenant.mobile) {
      const duplicateMobile = await prisma.tenant.findUnique({
        where: { mobile },
      });

      if (duplicateMobile) {
        return NextResponse.json(
          { error: 'Mobile number already registered' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      ...(clientName && { clientName }),
      ...(businessName && { businessName }),
      ...(mobile && { mobile }),
      ...(address && { address }),
      ...(status && { status }),
      ...(features && { features }),
    };

    // If password is provided, hash it
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    // Update tenant
    const tenant = await prisma.tenant.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

// DELETE - Delete client
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify super admin authentication
    await getSuperAdminId(request);

    // Check if client exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { id: params.id },
    });

    if (!existingTenant) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Delete tenant (cascade will delete all related data)
    await prisma.tenant.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}
