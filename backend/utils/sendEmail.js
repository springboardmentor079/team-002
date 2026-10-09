const nodemailer = require("nodemailer");

// Support both the new SMTP_* variable names and the legacy EMAIL_* names
// so existing deployments keep working without edits.
const getSmtpUser = () => process.env.SMTP_USER || process.env.EMAIL_USER || "";
const getSmtpPassword = () =>
  process.env.SMTP_PASSWORD || process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || "";

const getSmtpHost = () =>
  process.env.SMTP_HOST || process.env.EMAIL_HOST || "smtp.gmail.com";

const getSmtpPort = () => {
  const raw = process.env.SMTP_PORT || process.env.EMAIL_PORT || 587;
  const port = Number.parseInt(raw, 10);
  return Number.isFinite(port) ? port : 587;
};

const getFrom = () => {
  const from = process.env.EMAIL_FROM;
  if (from) return from;
  const user = getSmtpUser();
  return user ? `BuildTrack <${user}>` : "BuildTrack <no-reply@buildtrack.local>";
};

// True only when an outbound mail transport can actually be authenticated.
const isEmailConfigured = () =>
  Boolean(getSmtpHost() && getSmtpPort() && getSmtpUser() && getSmtpPassword());

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!isEmailConfigured()) {
    const err = new Error(
      "Email transport is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASSWORD in backend/.env."
    );
    err.code = "EMAIL_NOT_CONFIGURED";
    throw err;
  }

  const port = getSmtpPort();

  transporter = nodemailer.createTransport({
    host: getSmtpHost(),
    port,
    // Port 465 is implicit TLS, everything else (587) uses STARTTLS.
    secure: port === 465,
    auth: {
      user: getSmtpUser(),
      pass: getSmtpPassword(),
    },
  });

  return transporter;
};

// Strip anything that could leak credentials from driver errors before logging.
const sanitizeError = (error) => {
  const raw = error instanceof Error ? error.message : String(error);
  return raw
    .replace(/(smtp(s)?:\/\/)[^@\s]+@/gi, "$1<redacted>@")
    .replace(/(password|pass|auth|secret|token)=?[^:\s]*/gi, "$1=<redacted>")
    .slice(0, 300);
};

const sendEmail = async (options) => {
  const transport = getTransporter();

  const mailOptions = {
    from: getFrom(),
    to: options.email,
    subject: options.subject,
    text: options.text,
    html: options.html || (options.message ? `<p>${options.message}</p>` : undefined),
  };

  try {
    const info = await transport.sendMail(mailOptions);
    return info;
  } catch (error) {
    const safeMessage = sanitizeError(error);
    console.error(
      `[sendEmail] Failed to deliver "${options.subject}" to ${options.email}: ${safeMessage}`
    );

    const err = new Error("Email could not be sent. Please try again later.");
    err.code = "EMAIL_SEND_FAILED";
    err.cause = error;
    throw err;
  }
};

// Build the password reset email template used by the forgot-password flow.
const buildPasswordResetEmail = ({ name, resetUrl, expiryMinutes }) => {
  const greeting = name ? `Hello ${name},` : "Hello,";

  return {
    subject: "BuildTrack Password Reset",
    text: [
      greeting,
      "",
      "We received a request to reset your BuildTrack password.",
      "",
      "Reset Password:",
      resetUrl,
      "",
      "This link expires after a limited time.",
      "",
      "If you did not request this, you can safely ignore this email.",
      "",
      "BuildTrack Team",
    ].join("\n"),
    html: `
<div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#f8fafc;padding:32px 16px;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:#090d16;padding:24px 32px;">
      <div style="display:inline-block;width:40px;height:40px;line-height:40px;text-align:center;border-radius:10px;background:#10b981;color:#ffffff;font-weight:700;margin-right:12px;vertical-align:middle;">BT</div>
      <span style="color:#ffffff;font-size:20px;font-weight:700;vertical-align:middle;">BuildTrack</span>
    </div>

    <div style="padding:32px;">
      <p style="margin:0 0 16px;font-size:16px;color:#0f172a;">${greeting}</p>

      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#334155;">
        We received a request to reset your BuildTrack password.
      </p>

      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
        <tr>
          <td style="border-radius:12px;background:#10b981;">
            <a href="${resetUrl}"
               style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px;">
              Reset Password
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 8px;font-size:14px;color:#64748b;">
        This link expires after a limited time${
          expiryMinutes ? ` (${expiryMinutes} minutes)` : ""
        } and can only be used once.
      </p>

      <p style="margin:0 0 24px;font-size:13px;line-height:1.6;color:#94a3b8;word-break:break-all;">
        If the button does not work, copy and paste this link into your browser:<br />
        <a href="${resetUrl}" style="color:#059669;word-break:break-all;">${resetUrl}</a>
      </p>

      <p style="margin:0 0 8px;font-size:14px;color:#64748b;">
        If you did not request this, you can safely ignore this email. Your password will not change until you reset it.
      </p>

      <p style="margin:24px 0 0;font-size:14px;font-weight:600;color:#0f172a;">BuildTrack Team</p>
    </div>
  </div>
</div>`.trim(),
  };
};

module.exports = sendEmail;
module.exports.sendEmail = sendEmail;
module.exports.isEmailConfigured = isEmailConfigured;
module.exports.buildPasswordResetEmail = buildPasswordResetEmail;
module.exports.sanitizeError = sanitizeError;
