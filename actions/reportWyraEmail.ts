"use server";
import nodemailer from "nodemailer";

const reportAdminHtmlTemplate = (
  reporterUsername: any,
  reporterEmail: any,
  reportedUsername: any,
  wyraId: any,
  wyraLink: any,
  reason: any,
  description: any
) => `
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;padding:40px 0;">
  <tr>
    <td>
      <table cellpadding="0" cellspacing="0" width="600"
        style="margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;font-family:Arial,sans-serif;">

        <!-- Header -->
        <tr>
          <td style="background:#DC2626;padding:20px;text-align:center;">
            <h2 style="color:#ffffff;margin:0;">🚨 Wyra Reported</h2>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:30px;color:#333;font-size:15px;line-height:22px;">
            <p><strong>Reported By:</strong> ${reporterUsername} (${reporterEmail})</p>
            <p><strong>Reported User:</strong> @${reportedUsername}</p>
            <p><strong>Reason:</strong> ${reason}</p>

            ${
              description
                ? `<p><strong>Additional Details:</strong><br>${description}</p>`
                : `<p><strong>Additional Details:</strong> None provided</p>`
            }

            <hr style="margin:25px 0;border:none;border-top:1px solid #e5e7eb;" />

            <p><strong>Wyra ID:</strong> ${wyraId}</p>

            <div style="margin-top:20px;">
              <a href="${wyraLink}"
                 style="background:#111827;color:#ffffff;padding:12px 20px;
                        text-decoration:none;border-radius:6px;display:inline-block;">
                View Reported Wyra
              </a>
            </div>

            <p style="margin-top:30px;color:#6b7280;font-size:13px;">
              Please review this report as per Wyra Trust & Safety guidelines.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f1f1f1;padding:15px;text-align:center;
                     color:#888;font-size:12px;">
            © ${new Date().getFullYear()} Wyra — Admin Notification
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
`;

export async function sendReportNotificationToAdmin({
  reporterUsername,
  reporterEmail,
  reportedUsername,
  wyraId,
  reason,
  description,
}: {
  reporterUsername: string;
  reporterEmail: string;
  reportedUsername: string;
  wyraId: string;
  reason: string;
  description?: string;
}) {
  const transporter = nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 587,
    secure: false,
    auth: {
      user: "info@wyra.xyz",
      pass: "Churchlane20",
    },
  });

  const wyraLink = `${process.env.NEXT_PUBLIC_APP_URL}/reported-wyra?postId=${wyraId}`;

  await transporter.sendMail({
    from: '"WYRA Reports" <info@wyra.xyz>',
    to: "info@wyra.xyz",
    subject: "🚨 Wyra Reported",
    html: reportAdminHtmlTemplate(
      reporterUsername,
      reporterEmail,
      reportedUsername,
      wyraId,
      wyraLink,
      reason,
      description
    ),
  });
}
