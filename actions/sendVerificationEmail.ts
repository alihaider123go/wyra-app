import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import { createAdminClient } from '@/utils/supabase/server';

export async function sendVerificationEmail(userId: string, email: string) {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours expiry
  const supabase = await createAdminClient();
  const { error } = await supabase.from('email_verifications').insert({
    user_id: userId,
    token,
    expires_at: expiresAt
  });

  if (error) throw new Error(error.message);

  const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
  // Example using Nodemailer (can be replaced with SendGrid, Resend, etc.)
  const transporter = nodemailer.createTransport({
    host: 'mail.privateemail.com',
    port: 587,
    auth: {
      user: "info@wyra.xyz",
      pass: "Churchlane20"
    }
  });

  await transporter.sendMail({
    from: 'info@wyra.xyz',
    to: email,
    subject: 'Verify your email',
    text: `Click this link to verify your email: ${verificationLink}`,
    html: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`
  });

  return true;
}
