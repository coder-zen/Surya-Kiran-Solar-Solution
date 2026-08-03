const nodemailer = require("nodemailer");

/**
 * Lazily-created singleton transporter. Returns null (not a thrown error) when
 * SMTP isn't configured, so every caller can treat "no transporter" as a normal,
 * silent no-op rather than special-casing it — degrade gracefully by design.
 */
let transporter;
let warnedMissingConfig = false;

const getTransporter = () => {
  if (transporter !== undefined) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    if (!warnedMissingConfig) {
      console.warn(
        "[sendEmail] SMTP_HOST/SMTP_USER/SMTP_PASS not fully configured — email notifications are disabled. " +
          "Set them in backend/.env to enable lead-alert emails."
      );
      warnedMissingConfig = true;
    }
    transporter = null;
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
};

/**
 * Best-effort mailer — never throws. Callers should fire-and-forget this
 * (or await it without wrapping in try/catch) since failures are caught and
 * logged here, not propagated, so a broken SMTP config can never fail the
 * request that triggered the email.
 */
const sendEmail = async ({ to, subject, html }) => {
  const client = getTransporter();
  if (!client) return { sent: false, reason: "smtp_not_configured" };

  try {
    await client.sendMail({
      from: `"SK Solar Solutions Website" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    return { sent: true };
  } catch (error) {
    console.error("[sendEmail] Failed to send email:", error.message);
    return { sent: false, reason: error.message };
  }
};

module.exports = sendEmail;
