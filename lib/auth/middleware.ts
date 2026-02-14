import { NextRequest } from 'next/server';
import { verifyJWT } from './jwt';

export async function getTenantId(request: NextRequest): Promise<string> {
  const token = request.cookies.get('client_token')?.value;

  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const payload = await verifyJWT(token);

    if (!payload.tenantId) {
      throw new Error('Invalid token: missing tenantId');
    }

    return payload.tenantId;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export async function getSuperAdminId(request: NextRequest): Promise<string> {
  const token = request.cookies.get('superadmin_token')?.value;

  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const payload = await verifyJWT(token);

    if (payload.role !== 'superadmin') {
      throw new Error('Unauthorized: Admin access required');
    }

    return payload.userId;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}
