import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { sendSms } from './fast2sms';
import { otpLogin } from './templates';

export function generatePin(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function sendOtp(mobile: string): Promise<{ success: boolean; error?: string }> {
  // Check cooldown: no OTP sent in last 60 seconds
  const recent = await prisma.otpVerification.findFirst({
    where: {
      mobile,
      createdAt: { gte: new Date(Date.now() - 60 * 1000) },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (recent) {
    return { success: false, error: 'Please wait 60 seconds before requesting another OTP' };
  }

  const otp = generatePin();
  const hashedOtp = await bcrypt.hash(otp, 10);

  await prisma.otpVerification.create({
    data: {
      mobile,
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    },
  });

  const result = await sendSms({ mobile, message: otpLogin(otp) });

  if (!result.success) {
    return { success: false, error: result.error || 'Failed to send OTP' };
  }

  return { success: true };
}

export async function verifyOtp(mobile: string, otpInput: string): Promise<{ success: boolean; error?: string }> {
  const record = await prisma.otpVerification.findFirst({
    where: {
      mobile,
      verified: false,
      expiresAt: { gte: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) {
    return { success: false, error: 'OTP expired or not found. Please request a new one.' };
  }

  if (record.attempts >= 3) {
    return { success: false, error: 'Too many attempts. Please request a new OTP.' };
  }

  // Increment attempts
  await prisma.otpVerification.update({
    where: { id: record.id },
    data: { attempts: { increment: 1 } },
  });

  const isValid = await bcrypt.compare(otpInput, record.otp);

  if (!isValid) {
    return { success: false, error: 'Invalid OTP. Please try again.' };
  }

  // Mark as verified
  await prisma.otpVerification.update({
    where: { id: record.id },
    data: { verified: true },
  });

  return { success: true };
}
