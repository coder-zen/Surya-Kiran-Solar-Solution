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
    // Without these, nodemailer's defaults let a stalled connection hang for
    // minutes (socketTimeout defaults to 10 min). When Gmail throttles — which
    // it does after a burst of sends — the socket just sits open, and any
    // request that awaits the send hangs with it. Fail fast instead.
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
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
    const info = await client.sendMail({
      from: `"SK Solar Solutions Website" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    // Log exactly which addresses the mail server accepted vs rejected. Without
    // this, "the email didn't arrive" is indistinguishable between: never sent,
    // sent to the wrong address, rejected by the server, or delivered but
    // filtered into spam. `accepted` proves the handover actually happened.
    console.log(
      `[sendEmail] "${subject}" — accepted: [${(info.accepted || []).join(", ")}]` +
        `${info.rejected?.length ? ` REJECTED: [${info.rejected.join(", ")}]` : ""}` +
        ` messageId: ${info.messageId}`
    );

    if (info.rejected?.length) {
      return { sent: false, reason: `rejected: ${info.rejected.join(", ")}`, accepted: info.accepted };
    }
    return { sent: true, accepted: info.accepted, messageId: info.messageId };
  } catch (error) {
    console.error("[sendEmail] Failed to send email:", error.message);
    return { sent: false, reason: error.message };
  }
};

module.exports = sendEmail;
