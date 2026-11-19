// Instagram OAuth redirect URI (Instagram API with Instagram Login).
// Registered in the Meta app as: https://www.satyasell.com/auth/instagram/callback
//
// STAGE 1 (this file): a public, safe landing endpoint so Meta can validate the URL and the
// authorisation round-trip completes. It does NOT exchange the code, store tokens or echo any
// query values. Stage 2 will verify the signed `state`, exchange `code` for a token and save it
// encrypted (see docs/instagram-product-import-plan.md section 3.1).
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const page = (title: string, body: string, status = 200) =>
  new NextResponse(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">` +
      `<meta name="robots" content="noindex"><title>${title}</title></head>` +
      `<body style="font-family:system-ui,sans-serif;max-width:32rem;margin:15vh auto;padding:0 1.5rem;line-height:1.5">` +
      `<h1 style="font-size:1.4rem">${title}</h1><p>${body}</p><p><a href="/">Back to SatyaSell</a></p></body></html>`,
    { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'referrer-policy': 'no-referrer' } },
  );

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  if (params.get('error') || params.get('error_reason')) {
    return page('Instagram connection was not completed', 'Authorisation was cancelled or declined. No data was shared. You can close this tab and try again from SatyaSell.');
  }
  if (params.get('code')) {
    return page('Authorisation received', 'Thank you. Connecting your Instagram account is being finalised. You can close this tab and return to SatyaSell.');
  }
  return page('SatyaSell Instagram connection', 'This address receives the result of the Instagram authorisation. Start the connection from your SatyaSell dashboard.');
}
