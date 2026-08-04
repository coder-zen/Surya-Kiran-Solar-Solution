/**
 * Best-effort SMS sender — same contract as sendEmail.js: never throws, and
 * silently no-ops when unconfigured, so a missing provider can never fail the
 * customer's form submission.
 *
 * Two providers are supported. Set SMS_PROVIDER to pick one:
 *   SMS_PROVIDER=msg91   → MSG91_AUTHKEY, MSG91_SENDER_ID, MSG91_TEMPLATE_ID
 *   SMS_PROVIDER=twilio  → TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM
 * Plus SMS_ALERT_TO — the sales number that receives new-lead alerts.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * BEFORE THIS CAN SEND TO INDIAN NUMBERS — READ THIS
 *
 * Transactional SMS to Indian numbers is regulated by TRAI. You cannot send
 * until you have completed DLT (Distributed Ledger Technology) registration:
 *   1. Register the business as a Principal Entity on a DLT portal
 *      (Jio/Airtel/Vodafone all operate one; registering on any one is enough).
 *   2. Register a 6-character Sender ID (e.g. SKSOLR).
 *   3. Register the exact message template — the text below must match the
 *      approved template character-for-character, with variables in {#var#}
 *      placeholders. Unregistered or mismatched templates are silently dropped
 *      by the carrier, which looks identical to a bug.
 * This typically takes a few working days and needs GST/business documents.
 *
 * Until DLT is done, WhatsApp (already linked from the lead alert email) reaches
 * Indian customers with no registration and no per-message cost.
 * ─────────────────────────────────────────────────────────────────────────
 */

let warnedMissingConfig = false;

const isConfigured = () => {
  const provider = process.env.SMS_PROVIDER;
  if (!provider || !process.env.SMS_ALERT_TO) return false;
  if (provider === "msg91") return Boolean(process.env.MSG91_AUTHKEY && process.env.MSG91_SENDER_ID);
  if (provider === "twilio") {
    return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM);
  }
  return false;
};

/** Normalises an Indian mobile number to E.164 (+91XXXXXXXXXX). */
const toE164 = (phone) => {
  const digits = String(phone || "").replace(/[^\d]/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `+91${digits.slice(1)}`;
  return `+${digits}`;
};

const sendViaMsg91 = async (to, message) => {
  const res = await fetch("https://control.msg91.com/api/v5/flow/", {
    method: "POST",
    headers: { "Content-Type": "application/json", authkey: process.env.MSG91_AUTHKEY },
    body: JSON.stringify({
      template_id: process.env.MSG91_TEMPLATE_ID,
      sender: process.env.MSG91_SENDER_ID,
      short_url: "0",
      recipients: [{ mobiles: to.replace("+", ""), message }],
    }),
  });
  if (!res.ok) throw new Error(`MSG91 responded ${res.status}: ${await res.text()}`);
};

const sendViaTwilio = async (to, message) => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const auth = Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ To: to, From: process.env.TWILIO_FROM, Body: message }),
  });
  if (!res.ok) throw new Error(`Twilio responded ${res.status}: ${await res.text()}`);
};

/**
 * Fire-and-forget. Resolves with a result object rather than throwing, exactly
 * like sendEmail — callers must not need a try/catch.
 */
const sendSms = async ({ to, message }) => {
  if (!isConfigured()) {
    if (!warnedMissingConfig) {
      console.warn(
        "[sendSms] SMS_PROVIDER / credentials / SMS_ALERT_TO not fully configured — SMS alerts are disabled. " +
          "Lead emails are unaffected. See the DLT note in utils/sendSms.js before enabling for Indian numbers."
      );
      warnedMissingConfig = true;
    }
    return { sent: false, reason: "sms_not_configured" };
  }

  try {
    const recipient = toE164(to);
    if (process.env.SMS_PROVIDER === "msg91") await sendViaMsg91(recipient, message);
    else await sendViaTwilio(recipient, message);
    return { sent: true };
  } catch (error) {
    console.error("[sendSms] Failed to send SMS:", error.message);
    return { sent: false, reason: error.message };
  }
};

module.exports = sendSms;
module.exports.toE164 = toE164;
module.exports.isConfigured = isConfigured;
