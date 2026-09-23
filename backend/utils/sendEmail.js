const nodemailer = require("nodemailer");

/**
 * Send an email via Nodemailer
 * Supports SMTP config from environment variables (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM)
 * In development without active SMTP, falls back to logging or ethereal test account.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    let transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Test transporter for development / fallback
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const fromAddress = process.env.SMTP_FROM || '"BuildTrack Platform" <no-reply@buildtrack.com>';

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text: text || "",
      html: html || `<p>${text}</p>`,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`✉️ Email sent! Preview URL: ${previewUrl}`);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || null,
    };
  } catch (error) {
    console.error("Nodemailer send error:", error.message);
    // Don't crash caller on email delivery failure in dev
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = sendEmail;
