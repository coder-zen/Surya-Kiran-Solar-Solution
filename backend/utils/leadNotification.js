const sendEmail = require("./sendEmail");
const sendSms = require("./sendSms");

const SOURCE_LABELS = {
  hero_cta: "Hero \"Get Free Quote\" Button",
  contact_form: "Contact Page Form",
  exit_intent: "Exit-Intent Popup",
  whatsapp_widget: "Sticky WhatsApp Widget",
  service_page: "Service Page CTA",
  calculator: "Solar Savings Calculator",
  career: "Careers Page",
  amc: "AMC Plans Page",
  other: "Other / Unspecified",
};

const escapeHtml = (str = "") =>
  String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const buildWhatsAppLink = (phone) => {
  const digits = String(phone || "").replace(/[^\d]/g, "");
  const withCountryCode = digits.length === 10 ? `91${digits}` : digits;
  const message = encodeURIComponent(
    "Hi! Thanks for your interest in SK Solar Solutions. I'm following up on your solar enquiry — when's a good time to talk?"
  );
  return `https://wa.me/${withCountryCode}?text=${message}`;
};

const buildLeadEmailHtml = (enquiry) => {
  const sourceLabel = SOURCE_LABELS[enquiry.source] || enquiry.source || "Unknown";
  const whatsappLink = buildWhatsAppLink(enquiry.phone);

  const row = (label, value) =>
    value
      ? `<tr><td style="padding:8px 12px;color:#6B7280;font-size:13px;white-space:nowrap;vertical-align:top;">${label}</td><td style="padding:8px 12px;color:#0B2447;font-size:14px;">${value}</td></tr>`
      : "";

  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,#0B2447,#19376D);padding:24px;border-radius:12px 12px 0 0;">
        <p style="margin:0;color:#FFC93C;font-size:12px;letter-spacing:1px;text-transform:uppercase;">New Lead</p>
        <h1 style="margin:6px 0 0;color:#fff;font-size:20px;">${escapeHtml(enquiry.name)}</h1>
        <p style="margin:6px 0 0;color:#cbd5e1;font-size:13px;">via ${escapeHtml(sourceLabel)}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #E5E7EB;border-top:none;">
        ${row("Phone", `<a href="tel:${escapeHtml(enquiry.phone)}" style="color:#0B2447;">${escapeHtml(enquiry.phone)}</a>`)}
        ${row("Email", enquiry.email ? `<a href="mailto:${escapeHtml(enquiry.email)}" style="color:#0B2447;">${escapeHtml(enquiry.email)}</a>` : "")}
        ${row("City", escapeHtml(enquiry.city))}
        ${row("Property Type", escapeHtml(enquiry.propertyType))}
        ${row("Monthly Bill", enquiry.monthlyBill ? `₹${enquiry.monthlyBill}` : "")}
        ${row("Message", enquiry.message ? escapeHtml(enquiry.message) : "")}
      </table>
      <div style="padding:20px 12px;text-align:center;background:#fff;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 12px 12px;">
        <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer"
           style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 24px;border-radius:999px;">
          Reply on WhatsApp
        </a>
        <p style="margin:16px 0 0;color:#9CA3AF;font-size:11px;">
          Lead saved to the admin dashboard — status defaults to "New".
        </p>
      </div>
    </div>
  `;
};

/**
 * Acknowledgement sent to the customer confirming we received their enquiry.
 *
 * Only sent when they actually gave an email — it's optional on the Enquiry
 * model and plenty of leads arrive with a phone number only.
 *
 * Deliberately does NOT quote a price. Real solar pricing depends on a site
 * survey (roof condition, shading, sanctioned load), so this sets the
 * expectation of a callback instead of implying a binding quote.
 */
const buildCustomerAckHtml = (enquiry) => {
  const phone = process.env.COMPANY_PHONE || "+91 90678 56576";
  const whatsapp = (process.env.COMPANY_WHATSAPP || phone).replace(/[^\d]/g, "");

  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,#0B2447,#19376D);padding:28px 24px;border-radius:12px 12px 0 0;">
        <p style="margin:0;color:#FFC93C;font-size:12px;letter-spacing:1px;text-transform:uppercase;">SK Solar Solutions</p>
        <h1 style="margin:8px 0 0;color:#fff;font-size:22px;">Thanks, ${escapeHtml(enquiry.name)} — we've got your enquiry</h1>
      </div>
      <div style="padding:24px;background:#fff;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 12px 12px;">
        <p style="color:#2B2D42;font-size:14px;line-height:1.6;margin-top:0;">
          One of our solar experts will call you on
          <strong>${escapeHtml(enquiry.phone)}</strong> within 24 hours to understand your
          requirement and arrange a <strong>free site survey</strong>.
        </p>
        <p style="color:#2B2D42;font-size:14px;line-height:1.6;">
          Your exact system size and price depend on your roof and current electricity usage,
          so we confirm both after the survey — no obligation, and no cost for the visit.
        </p>
        <div style="margin:24px 0;padding:16px;background:#F9FAFB;border-radius:10px;">
          <p style="margin:0 0 8px;color:#6B7280;font-size:12px;text-transform:uppercase;letter-spacing:.5px;">Need us sooner?</p>
          <p style="margin:0;color:#0B2447;font-size:14px;">
            Call <a href="tel:${escapeHtml(phone)}" style="color:#0B2447;font-weight:bold;">${escapeHtml(phone)}</a>
            &nbsp;·&nbsp;
            <a href="https://wa.me/${whatsapp}" style="color:#25D366;font-weight:bold;">WhatsApp us</a>
          </p>
        </div>
        <p style="color:#9CA3AF;font-size:11px;margin-bottom:0;">
          You're receiving this because you submitted an enquiry on our website.
          If that wasn't you, please ignore this email.
        </p>
      </div>
    </div>
  `;
};

/**
 * Best-effort side effect fired after an Enquiry is saved. Never throws —
 * sendEmail() already swallows its own errors, and this is called without
 * awaiting the caller's response, so a slow or down SMTP server can never
 * delay or fail the customer's form submission.
 */
const notifyNewLead = (enquiry) => {
  const sourceLabel = SOURCE_LABELS[enquiry.source] || enquiry.source || "Unknown";

  // Last-resort net: both senders already catch internally and resolve, so this
  // only fires on a truly unexpected throw. Nothing here may reach the request.
  const swallow = (channel) => (error) =>
    console.error(`[notifyNewLead] Unexpected ${channel} failure:`, error.message);

  const emailTo = process.env.NOTIFY_EMAIL_TO;
  if (emailTo) {
    sendEmail({
      to: emailTo,
      subject: `New Lead: ${enquiry.name} (${sourceLabel})`,
      html: buildLeadEmailHtml(enquiry),
    }).catch(swallow("email"));
  }

  // Independent of email: if SMTP is down or unset, the SMS still goes out, and
  // vice versa. sendSms no-ops silently when no provider is configured.
  sendSms({
    to: process.env.SMS_ALERT_TO,
    message:
      `New SK Solar lead: ${enquiry.name}, ${enquiry.phone}` +
      `${enquiry.city ? `, ${enquiry.city}` : ""} (via ${sourceLabel}).`,
  }).catch(swallow("sms"));

  // Acknowledgement to the customer. Skipped when no email was given — the
  // field is optional and many leads arrive with only a phone number.
  if (enquiry.email) {
    sendEmail({
      to: enquiry.email,
      subject: "We've received your solar enquiry — SK Solar Solutions",
      html: buildCustomerAckHtml(enquiry),
    }).catch(swallow("customer acknowledgement"));
  }
};

module.exports = { notifyNewLead, buildLeadEmailHtml, buildWhatsAppLink };
