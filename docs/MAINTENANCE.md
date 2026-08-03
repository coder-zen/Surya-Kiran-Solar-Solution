# Maintenance Guide — Mobile Typography, Customer Stories & Lead Notifications

Operational reference for the four features added in this change: mobile
typography scale, the contact-info overlap fix, the Customer Stories
marquee + admin management screen, and the lead email notification system.
Written for whoever operates this site day-to-day after deployment — not
necessarily the person who built it.

---

## 1. Mobile Typography Scale

**Where it lives:** [`frontend/src/index.css`](../frontend/src/index.css) —
one `@media (max-width: 640px)` block near the bottom of the file, plus a
handful of new reusable classes declared in `@layer components`.

| Class | Mobile size | Where it's used today |
|---|---|---|
| `.section-heading` | 26px | Every `<SectionHeading>` title sitewide, modal headings |
| `.subtitle-text` | 16px | `<SectionHeading>` subtitle, quote modal intro text |
| `.input-field` | 16px | Quote modal, homepage contact form, calculator inputs |
| `.section-label` | 16px | Calculator field labels, admin form labels |
| `.option-btn` | 15px | Calculator's Savings/EMI tab switcher |
| `.terms-text` | 13px | AMC/Pricing/Calculator disclaimer paragraphs |
| `.badge-text` | 12px | AMC "Most Popular" badge |
| `.btn-primary` / `.btn-outline` / `.btn-navy` | 18px | Every CTA button sitewide |
| native `input` / `select` / `textarea` | 16px (forced) | Every form control sitewide, no opt-in needed |

**How to extend it:** give any new component's heading/subtitle/label/button
the matching class name above instead of inlining a font-size. The mobile
override is global and automatic — you don't touch `index.css` again unless
you're introducing a genuinely new text role.

**Why the native-element rule exists:** `input, select, textarea { font-size:
16px !important; }` is there specifically to stop iOS Safari's
zoom-on-focus behavior. This is a blanket rule (not scoped to `.input-field`)
because most forms in this codebase still use ad-hoc utility classes rather
than the shared class — removing this rule will bring the zoom bug back on
any form that hasn't been migrated to `.input-field` yet.

**Known scope limitation:** page-level hero `<h1>` tags (e.g. `AMC Plans`,
`Pricing`, `Calculators` hero banners) use their own independent Tailwind
responsive scale (`text-4xl lg:text-5xl`) and were **not** migrated to
`.section-heading` — that class carries a fixed navy text color via
`@apply`, which would break hero sections that need white text on a dark
background. If a future redesign wants heroes on the same 26px mobile scale,
add a color-agnostic variant rather than reusing `.section-heading` as-is.

**Troubleshooting:**
- *A new component isn't getting the mobile size* → confirm it's using one
  of the class names above, not a Tailwind `text-*` utility. A Tailwind
  utility on the same element can still win the cascade if it's more
  specific or added via `!` (see `!important` note below).
- *Desktop text size changed unexpectedly* → check nothing was added inside
  the `@media (max-width: 640px)` block without the `640px` guard — every
  rule in that file must stay inside that one media query.
- *iOS zoom is back on some input* → check the input didn't get an inline
  `style="font-size: ..."` (inline styles beat the `!important` media-query
  rule) — remove it or add `.input-field`.

---

## 2. Contact Info Overlap Fix

**Where it lives:** [`frontend/src/components/home/ContactSection.jsx`](../frontend/src/components/home/ContactSection.jsx),
the phone/email/WhatsApp row below the "Send Message" button.

**What changed:** the 3-column grid now activates at `md:` (768px) instead
of `sm:` (640px), and each column has `min-w-0` + `truncate` on its text
with `shrink-0` on its icon.

**If this breaks again:** it will almost always be because a new column was
added to that row, or the email/company name got longer, without the same
three ingredients:
1. `min-w-0` on the flex item itself (a flex/grid item defaults to
   `min-width: auto`, which ignores its container width and overflows)
2. `truncate` on the text (not the wrapping `<a>`)
3. `shrink-0` on the icon so it's the text that gives way, not the icon

If a genuinely long value needs to be fully visible rather than truncated,
wrap instead of truncating (`whitespace-normal break-words`) and drop back
to a 2-column grid at `md:` instead of 3.

---

## 3. Customer Stories (Testimonials)

### a) Never-empty section

**Where it lives:** [`frontend/src/components/home/Testimonials.jsx`](../frontend/src/components/home/Testimonials.jsx),
the `FALLBACK_TESTIMONIALS` array near the top of the file.

The component always renders `data?.length > 0 ? data : FALLBACK_TESTIMONIALS`.
The moment the database has at least one real testimonial, the fallback
array stops being used — no config flag, no code change, no deploy. **To
confirm the site is running on real data**, check `/api/testimonials` — if
`count` is 0, visitors are seeing the fallback set.

**If you want to change the fallback copy** (e.g. real customer names
became available before the admin screen is populated), edit
`FALLBACK_TESTIMONIALS` directly — each entry needs `_id`, `customerName`,
`location`, `rating` (1–5), `message`, and `isVerified`.

### b) Marquee animation

Uses the exact same pattern as the "Trusted Component Brands" logo carousel
in [`Brands.jsx`](../frontend/src/components/home/Brands.jsx): the list is
duplicated (`[...testimonials, ...testimonials]`) and a Framer Motion
`animate={{ x: ["0%", "-50%"] }}` with `duration: 35, repeat: Infinity, ease:
"linear"` scrolls it right-to-left, looping seamlessly because the second
half is an exact copy of the first.

**If the loop visibly "jumps"** at the seam, it's almost always because the
testimonial count changed (e.g. one very long card) and the doubled track's
halfway point no longer lines up with `-50%`. This only happens if the
`track` array construction (`[...testimonials, ...testimonials]`) was
changed to something asymmetric — as long as it's always exactly two full
copies of the same list, `-50%` is always correct regardless of count.

**Tuning speed:** `duration: 35` in `Testimonials.jsx` (Brands.jsx uses
`20` — testimonial cards are wider than logos, so a longer duration keeps
the scroll speed visually consistent rather than making it feel rushed).
Lower the number for faster scroll, raise it for slower.

### c) Admin testimonial management

**Where it lives:**
- Frontend screen: [`frontend/src/pages/admin/AdminTestimonials.jsx`](../frontend/src/pages/admin/AdminTestimonials.jsx)
  at `/admin/testimonials`, linked from the shared
  [`AdminSidebar.jsx`](../frontend/src/components/admin/AdminSidebar.jsx)
- Backend: [`backend/controllers/testimonialController.js`](../backend/controllers/testimonialController.js)
  + [`backend/routes/testimonialRoutes.js`](../backend/routes/testimonialRoutes.js)
  (pre-existing REST endpoints — this feature only added the frontend screen
  and a `.populate("relatedProject")` call to the list endpoint)

**Who can do what:**
- Create a testimonial: roles `admin`, `super_admin`, `editor`
- Delete a testimonial: roles `admin`, `super_admin` only
- Both are enforced **server-side** in `testimonialRoutes.js` — the admin UI
  doesn't hide buttons by role, so a lower-privileged user will see a normal
  "Could not delete testimonial" toast if they lack permission, rather than
  a broken UI.

**Linking to a project:** the "Link to Project" dropdown calls the public
`GET /api/projects` endpoint (same one `AdminDashboard.jsx` already uses for
its stats), which only returns projects with `isPublished: true`. If a
just-completed project isn't showing up in the dropdown, check its
`isPublished` flag.

**Going live immediately:** there is no separate publish/approval step. A
testimonial saved from this screen is immediately returned by
`GET /api/testimonials` and picked up by the public Customer Stories section
on its next fetch (React Query's `staleTime` is 5 minutes site-wide — see
`frontend/src/main.jsx` — so a visitor already on the page may need up to 5
minutes or a refresh to see a brand-new testimonial; a fresh page load
always gets it immediately).

**Troubleshooting:**
- *New testimonial doesn't appear on the public page* → check
  `isPublished` on the Testimonial document (defaults to `true`, but could
  have been toggled by a direct DB edit — there's no UI for this field by
  design, per spec); check the browser network tab for `/api/testimonials`
  returning it.
- *"Link to Project" dropdown is empty* → the connected account may have no
  published projects yet, or `GET /api/projects` is failing — check the
  Network tab.
- *Delete button does nothing* → check the logged-in user's role; only
  `admin`/`super_admin` can delete (see above).

---

## 4. Lead Email Notification System

**Where it lives:**
- [`backend/utils/sendEmail.js`](../backend/utils/sendEmail.js) — generic,
  reusable mailer (nodemailer wrapper). Knows nothing about leads.
- [`backend/utils/leadNotification.js`](../backend/utils/leadNotification.js) —
  builds the lead-alert email (HTML template, WhatsApp reply link, source
  label mapping) and calls `sendEmail.js`.
- [`backend/controllers/enquiryController.js`](../backend/controllers/enquiryController.js) —
  calls `notifyNewLead(enquiry)` right after `Enquiry.create()`, **without
  `await`**. This is intentional (see below).

### Required environment variables

Set these in `backend/.env` (already present as commented placeholders in
`backend/.env.example` — nothing new to add to that file):

| Variable | Purpose |
|---|---|
| `SMTP_HOST` | e.g. `smtp.gmail.com` |
| `SMTP_PORT` | `587` (STARTTLS) or `465` (implicit TLS) |
| `SMTP_USER` | mailbox the notification is sent *from* |
| `SMTP_PASS` | app password (for Gmail: a 16-character App Password, **not** the account password — requires 2FA enabled on the Google account) |
| `NOTIFY_EMAIL_TO` | address the alert is sent *to* (can be a distribution list) |
| `COMPANY_WHATSAPP` | not read by this feature directly — the WhatsApp reply link is built from the **lead's own phone number**, not the company's |

If **any** of `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` is missing, the system
logs one warning on first use (`[sendEmail] SMTP_HOST/SMTP_USER/SMTP_PASS
not fully configured...`) and silently no-ops from then on — leads still
save normally, they just don't trigger an email. If `NOTIFY_EMAIL_TO` is
missing specifically, `notifyNewLead` returns immediately with no attempt
to send at all.

**This means:** after changing `backend/.env`, you must restart the backend
process for the new SMTP config to take effect — it's read once and cached
in a module-level variable (`transporter`), not re-read per request.

### How the non-blocking guarantee works

`createEnquiry` does **not** `await notifyNewLead(...)` — it fires the call
and immediately proceeds to send the HTTP response. Inside
`leadNotification.js`, `sendEmail()` catches its own errors and always
resolves (never rejects), and the `.catch()` on top of that is a second
safety net for anything unexpected. Net effect: a customer's form submission
can never be slowed down or fail because of email/SMTP problems — the
enquiry is already written to MongoDB before the notification is even
attempted.

**Do not add `await` in front of `notifyNewLead(enquiry)`** in
`enquiryController.js` — doing so would make a slow or hung SMTP connection
add latency to every single form submission on the site (hero CTA, contact
form, exit-intent, calculator, service pages, AMC page — all of them go
through this one controller).

### What triggers a notification

Every path that calls `POST /api/enquiries` — which is *every* lead-capture
form on the site, since they all funnel through this one endpoint
(`EnquiryModal.jsx`, `ContactSection.jsx`, `Calculators.jsx`, and any future
form that follows the same pattern). There is nothing to configure
per-form; a new form automatically gets the notification for free as long
as it POSTs to `/api/enquiries`.

**Source attribution:** the email subject and body show a human-readable
label (e.g. "Hero \"Get Free Quote\" Button") mapped from the `source` enum
value on the `Enquiry` model. If you add a new `source` value to
`backend/models/Enquiry.js`, also add a matching entry to `SOURCE_LABELS` in
`leadNotification.js` — otherwise the email will fall back to showing the
raw enum string (e.g. `pricing_page_cta` instead of a readable label), which
still works but looks unpolished.

### Troubleshooting

- *No emails arriving at all* → check the backend process logs for
  `[sendEmail] SMTP_HOST/SMTP_USER/SMTP_PASS not fully configured` (means
  env vars are missing/not loaded) or `[sendEmail] Failed to send email:
  ...` (means SMTP is configured but the send itself failed — read the
  error message; common causes are a Gmail account password instead of an
  App Password, a firewall blocking outbound port 587/465, or `SMTP_PORT`
  not matching `secure: true/false`).
- *Leads aren't saving even though email is failing* → this should be
  impossible by design (see "non-blocking guarantee" above). If it's
  happening, the bug is not in the notification code — check
  `Enquiry.create()` itself and MongoDB connectivity.
- *WhatsApp button in the email opens with no pre-filled message* → this is
  a `wa.me` deep-link limitation on some WhatsApp Desktop clients, not a
  bug in the link generation — `buildWhatsAppLink()` in
  `leadNotification.js` always includes an encoded `text=` parameter.
- *Want to test without spamming the real sales inbox* → temporarily point
  `NOTIFY_EMAIL_TO` at a personal test address in `backend/.env`, restart
  the server, submit a test enquiry, then revert. Do **not** test against
  the production `NOTIFY_EMAIL_TO` unless you intend the team to receive it.

### Extending this system

- **Add SMS/WhatsApp Business API notifications:** create a sibling to
  `sendEmail.js` (e.g. `sendSms.js`) with the same "never throws, no-ops if
  unconfigured" contract, and call it alongside `notifyNewLead` in
  `enquiryController.js` — keep it equally non-blocking.
- **Add a Slack webhook alert:** same pattern — a new util, called
  fire-and-forget from the same spot, independent of whether email
  succeeds or fails.
- **Change the email template:** edit `buildLeadEmailHtml()` in
  `leadNotification.js`. It's inline-styled HTML (no external CSS/JS) because
  most email clients strip `<style>` blocks and block external requests —
  keep any edits inline-styled too.

---

## Quick Reference — Where Everything Lives

```
frontend/src/index.css                                  → mobile typography classes + media query
frontend/src/components/common/SectionHeading.jsx        → uses .section-heading / .subtitle-text
frontend/src/components/common/EnquiryModal.jsx          → uses .input-field, quote modal
frontend/src/components/home/ContactSection.jsx          → contact-overlap fix, .input-field
frontend/src/components/home/Testimonials.jsx            → marquee + fallback data
frontend/src/components/home/Brands.jsx                  → reference marquee pattern (unchanged)
frontend/src/components/admin/AdminSidebar.jsx           → shared admin nav (used by Dashboard + Testimonials)
frontend/src/pages/admin/AdminTestimonials.jsx            → admin CRUD screen
frontend/src/App.jsx                                      → /admin/testimonials route
backend/models/Testimonial.js                             → schema (unchanged — already had relatedProject)
backend/controllers/testimonialController.js              → added .populate("relatedProject")
backend/routes/testimonialRoutes.js                       → unchanged — already had full CRUD + role auth
backend/utils/sendEmail.js                                → generic mailer
backend/utils/leadNotification.js                         → lead email template + WhatsApp link
backend/controllers/enquiryController.js                  → fires notifyNewLead() after Enquiry.create()
backend/.env / backend/.env.example                       → SMTP_*, NOTIFY_EMAIL_TO (already present)
```
