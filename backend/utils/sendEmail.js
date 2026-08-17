const nodemailer = require("nodemailer");

/*
 * Two ways to send, picked automatically:
 *
 *   1. An HTTP email API (Brevo or Resend) when its key is present.
 *   2. Gmail/SMTP otherwise.
 *
 * The HTTP path exists because Render — like most free/shared hosting —
 * blocks outbound SMTP ports (25/465/587) to curb spam. From Render, every
 * Gmail send failed with "Connection timeout" no matter the credentials,
 * while the identical config worked from a laptop. An email API talks HTTPS
 * on 443, which is never blocked.
 *
 * SMTP is kept as the fallback so local development still works with nothing
 * more than a Gmail app password, no third-party signup required.
 */
const FROM_NAME = "SK Solar Solutions";

const getSenderAddress = () =>
  process.env.MAIL_FROM || process.env.SMTP_USER || "no-reply@sksolarsolution.com";

/**
 * Where a reply should land.
 *
 * Without this, hitting Reply on anything the site sends goes to whichever
 * mailbox happens to be authenticating SMTP — for a Gmail-relayed setup that
 * is a personal address, not the business. Falls back to the first lead-alert
 * recipient, which is the company inbox by definition.
 */
const getReplyToAddress = () =>
  process.env.REPLY_TO ||
  (process.env.NOTIFY_EMAIL_TO || "").split(",")[0].trim() ||
  getSenderAddress();

/** Brevo: 300 emails/day on the free tier. Sender address must be verified in their dashboard. */
const sendViaBrevo = async ({ to, subject, html, replyTo }) => {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": process.env.BREVO_API_KEY, "content-type": "application/json" },
    body: JSON.stringify({
      sender: { email: getSenderAddress(), name: FROM_NAME },
      replyTo: { email: replyTo || getReplyToAddress() },
      to: to.split(",").map((email) => ({ email: email.trim() })),
      subject,
      htmlContent: html,
    }),
  });
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${await res.text()}`);
  const body = await res.json().catch(() => ({}));
  return { accepted: to.split(",").map((e) => e.trim()), messageId: body.messageId };
};

/** Resend: 3,000/month free. Needs a verified domain, or resend.dev while testing. */
const sendViaResend = async ({ to, subject, html, replyTo }) => {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: `${FROM_NAME} <${getSenderAddress()}>`,
      reply_to: replyTo || getReplyToAddress(),
      to: to.split(",").map((e) => e.trim()),
      subject,
      html,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  const body = await res.json().catch(() => ({}));
  return { accepted: to.split(",").map((e) => e.trim()), messageId: body.id };
};

const getHttpProvider = () => {
  if (process.env.BREVO_API_KEY) return { name: "brevo", send: sendViaBrevo };
  if (process.env.RESEND_API_KEY) return { name: "resend", send: sendViaResend };
  return null;
};

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
    /*
     * Force IPv4. smtp.gmail.com resolves to both A and AAAA records, and Node
     * prefers IPv6 — but Render's containers have no IPv6 route, so every send
     * died with:
     *   connect ENETUNREACH 2404:6800:4003:c1a::6c:587
     * followed by a connection timeout. Identical credentials worked from a
     * home network with IPv6, which is why this only ever failed in production.
     * The dns.setServers() call at the top of server.js makes it more likely
     * still, since Google's resolvers readily return AAAA records.
     */
    family: 4,
    // Without these, nodemailer's defaults let a stalled connection hang for
    // minutes (socketTimeout defaults to 10 min). When a connection can't be
    // established, the socket just sits open, and any request that awaits the
    // send hangs with it. Fail fast instead.
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
const sendEmail = async ({ to, subject, html, replyTo }) => {
  // An HTTP provider wins when configured: it works from hosts that block
  // outbound SMTP ports, which is most free/shared hosting including Render.
  const httpProvider = getHttpProvider();
  if (httpProvider) {
    try {
      const result = await httpProvider.send({ to, subject, html, replyTo });
      console.log(
        `[sendEmail] "${subject}" via ${httpProvider.name} — accepted: [${result.accepted.join(", ")}]` +
          ` id: ${result.messageId || "n/a"}`
      );
      return { sent: true, accepted: result.accepted, messageId: result.messageId };
    } catch (error) {
      console.error(`[sendEmail] ${httpProvider.name} send failed:`, error.message);
      return { sent: false, reason: error.message };
    }
  }

  const client = getTransporter();
  if (!client) return { sent: false, reason: "smtp_not_configured" };

  try {
    const info = await client.sendMail({
      /*
       * getSenderAddress(), not SMTP_USER. This path used to hardcode the
       * authenticating account, so MAIL_FROM was honoured by the HTTP
       * providers and silently ignored here — setting it appeared to do
       * nothing and customers kept seeing whichever mailbox relayed the mail.
       *
       * Note that Gmail will still rewrite this to the authenticated account
       * unless the address is registered there under "Send mail as". A real
       * sending domain (Brevo/Resend below) is the durable fix.
       */
      from: `${FROM_NAME} <${getSenderAddress()}>`,
      replyTo: replyTo || getReplyToAddress(),
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

/**
 * Printed once at boot so a misconfigured deployment is obvious in the logs
 * instead of surfacing weeks later as "customers say they never got an email".
 * Never prints the password — only whether one is present.
 */
const logEmailConfigStatus = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, NOTIFY_EMAIL_TO } = process.env;
  const httpProvider = getHttpProvider();

  if (httpProvider) {
    console.log(
      `[email] Ready — ${httpProvider.name} HTTP API, sending as ${getSenderAddress()}. ` +
        `Lead alerts → ${NOTIFY_EMAIL_TO || "NOT SET — lead alerts disabled"}`
    );
    if (!NOTIFY_EMAIL_TO) {
      console.warn("[email] NOTIFY_EMAIL_TO is not set — nobody will be alerted when a lead comes in.");
    }
    return;
  }

  const missing = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"].filter((k) => !process.env[k]);
  if (missing.length) {
    console.warn(`[email] DISABLED — missing: ${missing.join(", ")}. Leads will still save; no mail will be sent.`);
    return;
  }

  console.log(
    `[email] Ready — SMTP ${SMTP_USER} via ${SMTP_HOST}:${SMTP_PORT || 587} (password set). ` +
      `Lead alerts → ${NOTIFY_EMAIL_TO || "NOT SET — lead alerts disabled"}`
  );

  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[email] Using SMTP in production. Many hosts (Render's free tier included) block outbound " +
        "ports 25/465/587, which shows up as 'Connection timeout'. If mail isn't arriving, set " +
        "BREVO_API_KEY or RESEND_API_KEY to send over HTTPS instead."
    );
  }

  if (!NOTIFY_EMAIL_TO) {
    console.warn("[email] NOTIFY_EMAIL_TO is not set — nobody will be alerted when a lead comes in.");
  } else if (NOTIFY_EMAIL_TO.split(",").map((e) => e.trim()).includes(SMTP_USER)) {
    // Gmail routinely hides a message you sent to yourself from your own Inbox
    // (it lands in Sent/All Mail instead), which looks exactly like mail that
    // was never delivered. Add a second, different recipient to avoid it.
    console.warn(
      `[email] NOTIFY_EMAIL_TO includes the sending account (${SMTP_USER}). ` +
        "Gmail often keeps self-addressed mail out of the Inbox — add a second, different address " +
        'e.g. NOTIFY_EMAIL_TO="you@gmail.com,someone-else@gmail.com"'
    );
  }
};

module.exports = sendEmail;
module.exports.logEmailConfigStatus = logEmailConfigStatus;
