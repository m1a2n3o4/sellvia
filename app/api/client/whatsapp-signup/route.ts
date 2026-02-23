import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getTenantId } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
    }

    const appId = process.env.NEXT_PUBLIC_META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;

    if (!appId || !appSecret) {
      return NextResponse.json(
        { error: 'Meta App credentials not configured on server' },
        { status: 500 }
      );
    }

    // Step 1: Exchange code for short-lived user token
    const tokenUrl = `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${code}`;
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error('Meta token exchange error:', tokenData.error);
      return NextResponse.json(
        { error: `Failed to exchange code: ${tokenData.error.message}` },
        { status: 400 }
      );
    }

    const shortLivedToken = tokenData.access_token;

    // Step 2: Exchange short-lived token for long-lived token (60 days)
    const longLivedUrl = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;
    const longLivedRes = await fetch(longLivedUrl);
    const longLivedData = await longLivedRes.json();

    if (longLivedData.error) {
      console.error('Long-lived token exchange error:', longLivedData.error);
      return NextResponse.json(
        { error: `Failed to get long-lived token: ${longLivedData.error.message}` },
        { status: 400 }
      );
    }

    const accessToken = longLivedData.access_token;

    // Step 3: Get shared WABA info using the debug_token or business endpoints
    // First get the user's business integrations
    const sharedWabaUrl = `https://graph.facebook.com/v21.0/me/businesses?access_token=${accessToken}`;
    const sharedWabaRes = await fetch(sharedWabaUrl);
    const sharedWabaData = await sharedWabaRes.json();

    // Step 4: Get WABA ID - try to find it from the shared WABAs
    let wabaId = '';
    let phoneNumberId = '';
    let phoneDisplayNumber = '';

    // Use the Debug Token endpoint to get the granular scopes and shared WABA
    const debugUrl = `https://graph.facebook.com/v21.0/debug_token?input_token=${accessToken}&access_token=${appId}|${appSecret}`;
    const debugRes = await fetch(debugUrl);
    const debugData = await debugRes.json();

    if (debugData.data?.granular_scopes) {
      const wabaScope = debugData.data.granular_scopes.find(
        (s: { scope: string; target_ids?: string[] }) => s.scope === 'whatsapp_business_management'
      );
      if (wabaScope?.target_ids?.[0]) {
        wabaId = wabaScope.target_ids[0];
      }

      const messagingScope = debugData.data.granular_scopes.find(
        (s: { scope: string; target_ids?: string[] }) => s.scope === 'whatsapp_business_messaging'
      );
      if (messagingScope?.target_ids?.[0]) {
        // This could be the phone number ID or WABA ID depending on setup
        // We'll verify in the next step
      }
    }

    // Step 5: If we have WABA ID, get the phone numbers
    if (wabaId) {
      const phonesUrl = `https://graph.facebook.com/v21.0/${wabaId}/phone_numbers?access_token=${accessToken}`;
      const phonesRes = await fetch(phonesUrl);
      const phonesData = await phonesRes.json();

      if (phonesData.data?.[0]) {
        phoneNumberId = phonesData.data[0].id;
        phoneDisplayNumber = phonesData.data[0].display_phone_number || phonesData.data[0].verified_name || '';
      }
    }

    if (!wabaId || !phoneNumberId) {
      console.error('Could not find WABA or phone number. Debug data:', JSON.stringify(debugData));
      console.error('Shared WABA data:', JSON.stringify(sharedWabaData));
      return NextResponse.json(
        { error: 'Could not find WhatsApp Business Account. Please ensure you completed the signup and selected a phone number.' },
        { status: 400 }
      );
    }

    // Step 6: Subscribe the WABA to app webhooks
    const subscribeUrl = `https://graph.facebook.com/v21.0/${wabaId}/subscribed_apps`;
    await fetch(subscribeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: accessToken }),
    });

    // Step 7: Register the phone number for messaging
    const registerUrl = `https://graph.facebook.com/v21.0/${phoneNumberId}/register`;
    await fetch(registerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        pin: '123456',
        access_token: accessToken,
      }),
    });

    // Step 8: Save credentials to BusinessInfo
    await prisma.businessInfo.upsert({
      where: { tenantId },
      create: {
        tenantId,
        whatsappToken: accessToken,
        whatsappPhoneNumberId: phoneNumberId,
        whatsappBusinessId: wabaId,
        whatsappAppSecret: appSecret,
      },
      update: {
        whatsappToken: accessToken,
        whatsappPhoneNumberId: phoneNumberId,
        whatsappBusinessId: wabaId,
        whatsappAppSecret: appSecret,
      },
    });

    return NextResponse.json({
      success: true,
      phoneNumber: phoneDisplayNumber,
      wabaId,
      phoneNumberId,
    });
  } catch (error: unknown) {
    console.error('WhatsApp signup error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message.includes('Authentication') || message.includes('token')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE handler to disconnect WhatsApp
export async function DELETE(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);

    await prisma.businessInfo.update({
      where: { tenantId },
      data: {
        whatsappToken: null,
        whatsappPhoneNumberId: null,
        whatsappBusinessId: null,
        whatsappAppSecret: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message.includes('Authentication') || message.includes('token')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
