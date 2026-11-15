import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getTenantId } from '@/lib/auth/middleware';
import { getTenantToken } from '@/lib/whatsapp/tenant-token';

export const dynamic = 'force-dynamic';

// Live details of the connected WhatsApp number, read from the Graph API
// (uses whatsapp_business_management: phone number + WABA lookup).
export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);
    const info = await prisma.businessInfo.findUnique({ where: { tenantId } });

    const token = getTenantToken(info);
    if (!info || !token || !info.whatsappPhoneNumberId) {
      return NextResponse.json({ connected: false });
    }
    const fields = 'display_phone_number,verified_name,quality_rating,status,name_status,code_verification_status';
    const [phoneRes, wabaRes] = await Promise.all([
      fetch(`https://graph.facebook.com/v21.0/${info.whatsappPhoneNumberId}?fields=${fields}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      info.whatsappBusinessId
        ? fetch(`https://graph.facebook.com/v21.0/${info.whatsappBusinessId}?fields=name`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        : Promise.resolve(null),
    ]);

    const phone = await phoneRes.json();
    const waba = wabaRes ? await wabaRes.json() : null;

    if (phone.error) {
      return NextResponse.json({
        connected: true,
        status: 'ERROR',
        error: phone.error.message,
        phoneNumberId: info.whatsappPhoneNumberId,
        wabaId: info.whatsappBusinessId,
      });
    }

    return NextResponse.json({
      connected: true,
      phoneNumber: phone.display_phone_number || null,
      verifiedName: phone.verified_name || null,
      businessName: waba?.name || phone.verified_name || null,
      status: phone.status || null,
      quality: phone.quality_rating || null,
      nameStatus: phone.name_status || null,
      phoneNumberId: info.whatsappPhoneNumberId,
      wabaId: info.whatsappBusinessId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
