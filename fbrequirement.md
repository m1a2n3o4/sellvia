# Meta Business Verification & Embedded Signup - Complete Guide

## Owner: Manohar Lotlapalli (SatyaSell)
## Date: 23 Feb 2026

---

## What is Embedded Signup?

Embedded Signup is Meta's official way for SaaS platforms (like SatyaSell) to onboard clients to WhatsApp Business API. Instead of clients manually creating Meta accounts and copy-pasting API keys, they just click a "Connect WhatsApp" button inside SatyaSell dashboard, complete a Facebook popup flow, and everything connects automatically in 5 minutes.

**Every major WhatsApp SaaS platform uses this** - Wati, AiSensy, Interakt, Gallabox, Chatwoot.

---

## Why We Need This

### Current Flow (Painful - loses 80% clients)
1. Client goes to developers.facebook.com (confusing)
2. Creates Meta Developer account (confusing)
3. Creates Meta App (very confusing)
4. Adds WhatsApp product (technical)
5. Goes to Meta Business Manager (confusing)
6. Creates WhatsApp Business Account (confusing)
7. Adds phone number + verify (ok)
8. Generates API token (technical)
9. Copies App Secret (technical)
10. Goes to SatyaSell dashboard -> pastes both keys (error prone)
- **Total: 30-60 minutes, most clients give up**

### With Embedded Signup (5 minutes, zero technical knowledge)
1. Client logs into SatyaSell dashboard
2. Goes to Settings -> clicks "Connect WhatsApp"
3. Facebook popup opens -> login -> pick business -> enter phone -> OTP
4. Done. SatyaSell automatically receives API token + Phone Number ID
- **Total: 5 minutes**

---

## Prerequisites for SatyaSell

### Accounts Needed (all free)
1. Personal Facebook account (already have)
2. Meta Business Portfolio named "SatyaSell" (create at business.facebook.com)
3. Meta Developer App (already have for webhooks)

### Business Requirements
- Domain: satyasell.com (HAVE)
- Website: https://www.satyasell.com (HAVE)
- Business email: admin@satyasell.com (HAVE)
- Business registration: UDYAM/MSME Certificate (TO DO)
- PAN Card (personal PAN is fine for sole proprietorship)
- Mobile number with +91 (personal number is fine)

---

## Step-by-Step Setup

### STEP 1: Register UDYAM/MSME (FREE, 15 minutes)

- Go to: https://udyamregistration.gov.in
- Click "For New Entrepreneurs who are not Registered yet as MSME"
- Enter Aadhaar number + Name
- Enter PAN (personal PAN works)
- Fill business details:
  - Enterprise Name: **SatyaSell**
  - Type: **Proprietorship**
  - Activity: **Service** -> IT Services / Software Development
  - Address: Your home address (this becomes your registered address)
  - Bank Account: Your personal savings account
  - Investment: Enter approximate amount spent on the project
- Submit -> You get UDYAM certificate instantly (PDF download)
- **This is your official business registration document**

### STEP 2: Create Meta Business Portfolio

1. Go to https://business.facebook.com
2. Login with your personal Facebook account
3. Click "Create Account"
4. Enter:
   - Business name: **SatyaSell**
   - Your name: **Manohar Lotlapalli**
   - Business email: **admin@satyasell.com**
5. Done - you now have a Meta Business Portfolio

### STEP 3: Fill Business Info (MUST match UDYAM certificate exactly)

Go to Business Settings -> Business Info:

| Field | Value |
|-------|-------|
| Legal business name | SatyaSell (exactly as on UDYAM certificate) |
| Address | Exactly as on UDYAM certificate - same spelling, same format |
| Phone | Your mobile number with +91 |
| Website | https://www.satyasell.com |
| Email | admin@satyasell.com |

**CRITICAL: Every detail must match your UDYAM certificate. Even small differences cause rejection.**

### STEP 4: Verify Domain (satyasell.com)

1. Go to Business Settings -> Brand Safety -> Domains -> Add Domain
2. Enter: satyasell.com
3. Meta gives you a DNS TXT record to add
4. Go to your domain provider (where satyasell.com DNS is managed)
5. Add the TXT record
6. Come back to Meta and click Verify
7. Green checkmark appears

### STEP 5: Start Business Verification

1. Go to Business Settings -> Security Center -> Start Verification
2. Select country: **India**
3. Meta will try to match from government database (UDYAM database)
4. If auto-matched: verification can be instant
5. If not: upload documents manually

### STEP 6: Upload Documents

Upload any 2 of these:

| Document | Where to get |
|----------|-------------|
| UDYAM/MSME Certificate (BEST) | From Step 1 - PDF download |
| PAN Card | Your personal PAN card scan |
| Bank Statement | Last 3 months from your bank (name + address must match) |
| Utility Bill | Electricity/phone bill at registered address (last 3 months) |

**Recommended combination: UDYAM Certificate + Bank Statement**

### STEP 7: Phone/Email OTP Verification

- Meta sends OTP to your phone or email
- Choose the one you're most confident about
- Enter OTP to verify

### STEP 8: Wait for Approval

- Auto-match with government database: Can be approved in minutes
- Manual review: 3-10 business days
- If rejected: Meta tells you why, fix and resubmit

### STEP 9: Submit App Review (after business verification approved)

1. Go to https://developers.facebook.com -> Your App
2. Go to App Review -> Permissions and Features
3. Request these 2 permissions:
   - `whatsapp_business_management`
   - `whatsapp_business_messaging`
4. Meta asks for a screen recording showing:
   - Your app sending a WhatsApp message (already working)
   - Your app creating a message template
5. Record a 2-3 minute video showing both
6. Submit - approval takes 2-15 business days

### STEP 10: Create Embedded Signup Configuration

1. In your Meta App -> Facebook Login for Business -> Configurations
2. Click "+ Create Configuration"
3. Name: "SatyaSell Client Onboarding"
4. Select: Embedded Signup variation
5. Add permissions: `whatsapp_business_management` + `whatsapp_business_messaging`
6. Save - you get a **config_id**
7. Note down: **config_id** + **app_id**

### STEP 11: Code Implementation (Claude will build this)

Once config_id and app_id are ready:
- "Connect WhatsApp" button in client settings page
- Facebook SDK integration
- Callback handler to capture WABA ID, Phone Number ID, Access Token
- Token exchange API (short-lived -> permanent token)
- Auto-save to database
- Webhook auto-subscription

---

## Documents Checklist

```
[ ] UDYAM/MSME Certificate (register at udyamregistration.gov.in)
[ ] PAN Card (personal PAN - scan/photo)
[ ] Bank Statement (last 3 months - optional, if UDYAM + PAN not enough)
[ ] Domain email working (admin@satyasell.com)
[ ] Website live (https://www.satyasell.com)
```

## Meta Setup Checklist

```
[ ] Meta Business Portfolio created (business.facebook.com)
[ ] Business info filled (matching UDYAM exactly)
[ ] Domain verified (satyasell.com)
[ ] Business verification submitted
[ ] Business verification APPROVED
[ ] App Review submitted (2 permissions + screen recordings)
[ ] App Review APPROVED
[ ] Embedded Signup configuration created
[ ] config_id noted down
[ ] Code implementation done
[ ] Test with a test Meta Business Portfolio
[ ] Go LIVE
```

---

## FAQ

**Q: Can I use personal PAN and Aadhaar?**
A: Yes. For Sole Proprietorship, your personal PAN IS the business PAN. UDYAM registration uses personal Aadhaar + PAN.

**Q: Can I use my personal mobile number?**
A: Yes. For sole proprietorship, your personal number is fine.

**Q: Can I use personal bank account?**
A: Yes. Sole proprietors use personal savings accounts for business. Just make sure the name on the bank account matches.

**Q: Do I need GST?**
A: No. UDYAM certificate is enough. GST is only required if your annual turnover exceeds Rs 20 lakhs (for services).

**Q: Can I do this while working at an MNC?**
A: Yes. Sole proprietorship has no conflict. You're not creating a Pvt Ltd company. UDYAM/MSME registration as sole proprietor is perfectly fine while being employed.

**Q: How much does all this cost?**
A: UDYAM registration: FREE. Meta Business Verification: FREE. Meta App Review: FREE. WhatsApp Cloud API: FREE (you only pay per-message charges to Meta).

**Q: What happens after verification?**
A: You can onboard unlimited clients through Embedded Signup. Each client connects their own WhatsApp number through your dashboard.

---

## Estimated Timeline

| Step | Time |
|------|------|
| UDYAM Registration | 15 minutes (instant) |
| Meta Business Portfolio setup | 30 minutes |
| Domain verification | 1-2 hours (DNS propagation) |
| Business verification | 3-10 business days |
| App Review | 2-15 business days |
| Code implementation | Ready when approved |
| **Total** | **~2-4 weeks** |

---

## References

- Meta Business Verification: https://business.facebook.com
- Meta Developer Portal: https://developers.facebook.com
- UDYAM Registration: https://udyamregistration.gov.in
- WhatsApp Business Platform: https://business.whatsapp.com/products/business-platform
- Embedded Signup Docs: https://developers.facebook.com/docs/whatsapp/embedded-signup
- Meta Business Verification Guide: https://docs.360dialog.com/docs/waba-basics/meta-business-verification
- Documents Required: https://www.heltar.com/blogs/documents-required-for-whatsapp-business-verification-cm7dbkzez003dstm2nhtouct3
