# Deploying the Backend to Render

The backend is deploy-ready: it listens on `process.env.PORT`, has an
`npm start` script, declares Node ≥18, and exposes a health check at
`/api/health`. A [`render.yaml`](../render.yaml) blueprint at the repo root
declares the service so you don't have to fill the settings in by hand.

---

## Before you start

You need these values to hand — copy them from your local `backend/.env`:

| Variable | Where it comes from |
|---|---|
| `MONGO_URI` | MongoDB Atlas → Connect → Drivers. **Use the non-SRV form** (`mongodb://host1,host2,host3/...`) — see note below. |
| `JWT_SECRET` | Any long random string. Rotate it if it has ever been shared or screenshotted. |
| `CLIENT_URL` | Your deployed frontend URL, e.g. `https://your-site.vercel.app`. Comma-separate multiple origins. |
| `CLOUDINARY_*` | Cloudinary dashboard → API keys. |
| `SMTP_*`, `NOTIFY_EMAIL_TO` | Gmail App Password setup. Optional — leads still save without it. |

---

## Steps

1. **Push the code to GitHub** (already done if you followed the commit step).

2. In Render: **New + → Blueprint**, connect the GitHub repo, and select the
   branch you want to deploy from. Render reads `render.yaml` automatically.

3. Render will prompt for every variable marked `sync: false`. Paste the values
   from the table above. **Do not** commit them to the repo.

4. Deploy. First build takes a few minutes. Watch the logs for:
   ```
   [Server] Running in production mode on port 10000
   [MongoDB] Connected: ...
   ```

5. Confirm it's live:
   ```bash
   curl https://<your-service>.onrender.com/api/health
   ```
   Expect `{"success":true,"message":"API is healthy"}`.

6. **Point the frontend at it.** In your Vercel project settings, set
   `VITE_API_URL` to `https://<your-service>.onrender.com/api` and redeploy.

7. **Set `CLIENT_URL` on Render** to the final frontend URL and redeploy the
   backend, so CORS accepts requests from it.

---

## Things that will bite you if skipped

**`NODE_ENV` must be `production`.** The blueprint sets this. The auth cookie's
`Secure` and `SameSite=None` flags are keyed off it in
`backend/utils/generateToken.js`. Without them the browser silently refuses to
send the login cookie from a Vercel frontend to a Render backend, and admin
login will appear to succeed but every subsequent request will 401.

**Use the non-SRV MongoDB connection string.** `mongodb+srv://` requires a DNS
SRV lookup that fails on some networks (it failed locally during development —
see the `MONGO_URI` comment in `backend/.env.example`). The standard
`mongodb://host1,host2,host3/...?replicaSet=...` form skips that lookup.

**Atlas Network Access must allow Render.** Render's free tier does not give you
a static outbound IP, so allow `0.0.0.0/0` in Atlas → Network Access, or the
connection will hang. Access is still protected by the database username and
password.

**The free plan sleeps.** Render free services spin down after ~15 minutes idle,
so the first request afterwards takes 30–60 seconds. That means a lead submitted
on a cold site may appear to hang. Upgrade to a paid instance before real traffic.

---

## After deploying

- Change the default admin password immediately if `admin@sksolarsolutions.com`
  still exists — see [MAINTENANCE.md](MAINTENANCE.md).
- Never run `npm run seed` against production: it deletes and replaces the
  Service, Project, Testimonial and FAQ collections.
- If you get locked out, `backend/scripts/recover-admin.js` can repoint an admin
  account at a mailbox you control so password reset can reach you.

---

## Email: sending as the company, not a personal Gmail

Render blocks outbound SMTP ports, so mail from production goes through an
HTTP email API. Brevo is the configured default (300/day free). Once
`BREVO_API_KEY` is set, `utils/sendEmail.js` prefers it automatically and the
`SMTP_*` variables become a local-development fallback only.

Setting `MAIL_FROM` without authenticating the domain is not enough. Providers
check that whoever sent the mail is allowed to use the From domain; fail that
and the message lands in spam even though it "sent successfully".

### DNS facts for sksolarsolution.com

Recorded here because they decide which steps matter:

| | |
|---|---|
| DNS hosted at | **Hostinger** (`*.dns-parking.com` nameservers) — not Vercel |
| Existing SPF | `v=spf1 include:_spf.google.com ~all` — Google Workspace |
| Existing DKIM | `google._domainkey` present |
| DMARC | **none** |
| MX | `smtp.google.com` — `info@` is a real Workspace mailbox |

### Steps

1. Sign up at brevo.com and open **Senders, Domains & Dedicated IPs → Domains
   → Add a domain**. Enter `sksolarsolution.com`.
2. Brevo offers to configure DNS automatically by signing into the DNS host.
   That works when it recognises the provider; otherwise take the manual
   records and add them in **Hostinger hPanel → Domains → DNS Zone Editor**.
3. Add the three records Brevo shows: the **Brevo code** (TXT, proves
   ownership), the **DKIM** record, and the **DMARC** record.
   - **Do not touch the existing SPF record.** Brevo handles SPF on its own
     return-path domain and does not need an `include:`. Editing the Google
     SPF entry risks breaking Workspace mail delivery for no benefit.
   - Brevo's DKIM uses its own selector, so it coexists with
     `google._domainkey`.
   - There is no DMARC record today, so Brevo's can be added as-is. (Had one
     existed, Brevo would offer to replace it — decline and merge by hand.)
4. Wait for propagation, then press verify in Brevo. Success looks like a
   green **"Value matched"** against all three records.
5. Create an API key: **SMTP & API → API Keys → Generate a new API key**.
6. On Render → the service → **Environment**, set:

   ```
   BREVO_API_KEY = <the key>
   MAIL_FROM     = info@sksolarsolution.com
   NOTIFY_EMAIL_TO = info@sksolarsolution.com
   ```

   `REPLY_TO` is optional — it defaults to the first `NOTIFY_EMAIL_TO`
   address. Leave the `SMTP_*` variables in place; they are ignored while a
   Brevo key is present and keep local development working.

7. Redeploy and check the boot log. It prints the active configuration:

   ```
   [email] Ready — brevo HTTP API, sending as info@sksolarsolution.com.
   ```

   If it still says `SMTP ...`, the key did not reach the environment.

8. Submit a real enquiry through the site. Two mails should follow: the lead
   alert to `info@`, whose Reply-To is the customer, and the acknowledgement
   to the customer, sent from `info@` with Reply-To `info@`.

### Checking it properly

In Gmail, open the received acknowledgement → ⋮ → **Show original**. Look for
`SPF: PASS`, `DKIM: PASS` and `DMARC: PASS`. Anything else means the domain
authentication has not fully taken effect, regardless of the mail arriving.
