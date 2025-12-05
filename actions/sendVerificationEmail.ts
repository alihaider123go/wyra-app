// import { v4 as uuidv4 } from 'uuid';
// import nodemailer from 'nodemailer';
// import { createAdminClient } from '@/utils/supabase/server';

// export async function sendVerificationEmail(userId: string, email: string) {
//   const token = uuidv4();
//   const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours expiry
//   const supabase = await createAdminClient();
//   const { error } = await supabase.from('email_verifications').insert({
//     user_id: userId,
//     token,
//     expires_at: expiresAt
//   });

//   if (error) throw new Error(error.message);

//   const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
//   // Example using Nodemailer (can be replaced with SendGrid, Resend, etc.)
//   const transporter = nodemailer.createTransport({
//     host: 'mail.privateemail.com',
//     port: 587,
//     auth: {
//       user: "info@wyra.xyz",
//       pass: "Churchlane20"
//     }
//   });

//   await transporter.sendMail({
//     from: 'info@wyra.xyz',
//     to: email,
//     subject: 'Verify your email',
//     text: `Click this link to verify your email: ${verificationLink}`,
//     html: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`
//   });

//   return true;
// }


import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import { createAdminClient } from '@/utils/supabase/server';


const htmlTemplate = (verificationLink: string,logoUrl:string) => `
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;padding:40px 0;">
  <tr>
    <td>
      <table cellpadding="0" cellspacing="0" width="600" style="margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;font-family:Arial, sans-serif;">
        
        <!-- Header -->
        <tr>
          <td style="background:#0A66C2;padding:20px;text-align:center;">
            <img src="${logoUrl}" alt="wyra Logo" width="120" style="display:block;margin:0 auto;">
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:30px;color:#333333;font-size:16px;line-height:24px;">
            <h2 style="margin-top:0;color:#0A66C2;">Verify your email address</h2>
            <p>Hello,</p>
            <p>Thank you for signing up on <strong>WYRA</strong>. To complete your registration, please verify your email address by clicking the button below:</p>

            <div style="text-align:center;margin:35px 0;">
              <a href="${verificationLink}" 
                 style="background:#0A66C2;color:#ffffff;padding:15px 30px;text-decoration:none;font-size:16px;border-radius:6px;display:inline-block;">
                 Verify Email
              </a>
            </div>

            <p>If you didn’t create an account, you can safely ignore this email.</p>
            <p>Regards, <br>The Wyra Team</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f1f1f1;padding:20px;text-align:center;color:#888888;font-size:13px;">
            © ${new Date().getFullYear()} Wyra. All rights reserved.
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
`;

export async function sendVerificationEmail(userId: string, email: string) {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

  const supabase = await createAdminClient();
  const { error } = await supabase.from("email_verifications").insert({
    user_id: userId,
    token,
    expires_at: expiresAt,
  });
  if (error) throw new Error(error.message);

  const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
const logoUrl = `https://wyra.tecxra.com/app_icon.png`

  const transporter = nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 587,
    secure: false,
    auth: {
      user: "info@wyra.xyz",
      pass: "Churchlane20",
    },
  });

  await transporter.sendMail({
    from: '"WYRA" <info@wyra.xyz>',
    to: email,
    subject: "Verify your email — WYRA",
    html: htmlTemplate(verificationLink,logoUrl),
    text: `Verify your email: ${verificationLink}`, // fallback for mail clients
  });
}


