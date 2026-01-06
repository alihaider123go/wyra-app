import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import { createAdminClient } from "@/utils/supabase/server";

const htmlTemplate = (verificationLink: string, unsubscribeLink: string) => `
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;padding:40px 0;">
  <tr>
    <td>
      <table cellpadding="0" cellspacing="0" width="600" style="margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;font-family:Arial, sans-serif;">
        
        <!-- Header -->
        <tr>
          <td style="background:#0A66C2;padding:20px;text-align:center;">
            <img src="cid:logo" width="120" alt="Wyra Logo">
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:30px;color:#333333;font-size:16px;line-height:24px;">
            <p>👋 <strong>Hey there!</strong></p>

            <p>
              Thanks for signing up for <strong>Wyra</strong> — the place where bold questions meet even bolder answers. ✨
            </p>

            <p>We can’t wait to see what you come up with:</p>

            <p style="margin-left:10px;">
              🎯 Would you rather… drop your hottest takes in Circles?<br/>
              🔥 Or dive into trending Wyras and show everyone what you’re made of?
            </p>

            <p><strong>But first… there’s just one small step left.</strong></p>

            <!-- CTA -->
            <div style="text-align:center;margin:35px 0;">
              <a href="${verificationLink}" 
                 style="background:#0A66C2;color:#ffffff;padding:15px 30px;text-decoration:none;font-size:16px;border-radius:6px;display:inline-block;">
                 🎲 Activate My Account
              </a>
            </div>

            <p><strong>By activating your account, you unlock:</strong></p>

            <ul style="padding-left:20px;">
              <li>🌟 Post your own Wyras (and stir up some debates)</li>
              <li>🤝 Connect and chat with other users</li>
              <li>🏆 Join Circles and exclusive communities</li>
              <li>📈 Grow your followers and influence</li>
            </ul>

            <p>
              So what are you waiting for? Tap that button and let the games begin. 🎮
            </p>

            <p>
              See you on Wyra!<br/>
              — <strong>The Wyra Team</strong> 💬
            </p>

            <p style="font-size:14px;color:#666;">
              P.S. Got questions or feedback? We’re all ears:
              <a href="mailto:info@wyra.xyz" style="color:#0A66C2;">info@wyra.xyz</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f1f1f1;padding:20px;text-align:center;color:#888888;font-size:12px;">
            © ${new Date().getFullYear()} Wyra. All rights reserved.<br/><br/>
            <a href="${unsubscribeLink}" style="color:#888888;text-decoration:underline;">
              Unsubscribe
            </a>
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
  const unsubscribeLink = `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe`;

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
    subject: "🎲 Let the choices begin — activate your Wyra!",
    html: htmlTemplate(verificationLink, unsubscribeLink),
    attachments: [
      {
        filename: "logo.png",
        path: "https://wyra.tecxra.com/app_icon.png",
        cid: "logo",
      },
    ],
  });
}
