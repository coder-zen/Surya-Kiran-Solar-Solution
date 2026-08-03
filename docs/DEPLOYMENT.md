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
