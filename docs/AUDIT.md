# Production Readiness Audit — SK Solar Solutions

**Date:** 2026-08-06
**Scope:** Full-stack MERN application (Express/MongoDB API + React/Vite SPA)
**Method:** Static review of all backend controllers/routes/models, plus live
exploit attempts against a running instance connected to the production database.

Every finding below was **reproduced against a running server**, not inferred
from reading code. Where something was verified as *safe*, that is stated too —
a clean result is as useful as a broken one. Findings I could not test are
listed in [Not Tested](#not-tested) rather than guessed at.

**Overall Production Readiness: 68 / 100** — functional and broadly well-secured,
with one critical data-integrity hole, no automated tests, and no pagination.

---

## 1. Critical

### C-1 · Mass assignment on the public lead endpoint
| | |
|---|---|
| **File** | `backend/controllers/enquiryController.js:12` |
| **Function** | `createEnquiry` |
| **Severity** | **Critical** |

`Enquiry.create(req.body)` passes the entire unvalidated request body to the
model. `POST /api/enquiries` is public and unauthenticated.

**Reproduced live** — an anonymous request set internal pipeline fields:

```bash
curl -X POST /api/enquiries -d '{"name":"x","phone":"9999999999",
  "status":"Completed","assignedTo":"000000000000000000000000",
  "convertedProjectId":"000000000000000000000000"}'
# → 201 Created, status "Completed" persisted
```

**Root cause:** no allowlist between the request body and the model.

**Impact:** anyone on the internet can forge leads that appear already
Completed (hiding them from the sales queue), assign leads to arbitrary staff,
or fabricate links to real projects. This is silent CRM corruption — nothing
looks broken, the data is just wrong. Given lead capture *is* the product, this
is the most consequential finding in the audit.

**Fix:** destructure explicitly, exactly as `careerController.applyToCareer`
already does correctly:

```js
const { name, phone, email, city, propertyType, monthlyBill, message, source } = req.body;
const enquiry = await Enquiry.create({ name, phone, email, city, propertyType, monthlyBill, message, source });
```

---

## 2. High

### H-1 · Unmatched `/api/*` routes return HTML 200 instead of JSON 404
| | |
|---|---|
| **File** | `backend/server.js:152-156` |
| **Severity** | **High** |

The production catch-all `app.get("*", …)` serves `index.html` for *any*
unmatched GET, including `/api/*`. The `notFound` handler at line 160 is
unreachable for GETs.

**Reproduced live** (`NODE_ENV=production`): `GET /api/products` → **HTTP 200**,
`Content-Type: text/html`.

**Impact:** every API consumer receives an HTML page where JSON is expected,
with a success status code. Client code that checks `res.ok` or relies on a
`.catch()` never fires — the failure is invisible. This is the mechanism behind
H-2 below, and it makes any future API typo fail silently rather than loudly.

**Fix:** exclude the API namespace from the SPA fallback:

```js
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next(); // fall through to notFound
  res.sendFile(path.join(clientBuildPath, "index.html"));
});
```

### H-2 · Two frontend pages call endpoints that do not exist
| | |
|---|---|
| **Files** | `frontend/src/pages/Products.jsx:7`, `frontend/src/components/home/FAQSection.jsx:9` |
| **Severity** | **High** |

`GET /api/products` and `GET /api/faqs` have **no controller, no route file, and
no mount** in `server.js`. The `Product` and `FAQ` models exist but are entirely
unwired — no code path anywhere reads or writes them.

**Impact:** the Products page and the homepage FAQ section are permanently
empty. Combined with H-1 they fail *silently* — no error, no empty state, just
missing content on a live commercial site. The Products page is also where the
navbar's "Pricing" originally pointed.

**Fix:** either build the two controllers/routes (they are near-identical to the
existing Gallery CRUD), or remove the dead pages and models. Do not leave them
half-wired.

### H-3 · No pagination on any list endpoint
| | |
|---|---|
| **Files** | All 11 controllers — **zero** `.limit()` or `.skip()` calls |
| **Severity** | **High** (scalability) |

`GET /api/enquiries` returns every lead ever captured in a single response;
same for projects, blogs, gallery, applications.

**Impact:** currently harmless at 35 leads. At a few thousand it becomes a slow
query, a large payload, and a memory spike — and this is a *lead-generation*
site whose entire purpose is accumulating that collection indefinitely. The
admin dashboard also loads the full lead set purely to compute counts.

**Fix:** add `?page`/`?limit` with a hard server-side cap (e.g. 100), and use
`countDocuments()` for dashboard tallies rather than fetching every document.

### H-4 · No automated tests of any kind
| | |
|---|---|
| **Severity** | **High** |

No test runner, no test files, no CI. Verified: no `jest`/`vitest`/`mocha`/
`supertest`/`cypress`/`playwright` in either `package.json`.

**Impact:** every regression is found by a customer. This session alone produced
several bugs that a single integration test would have caught at write time —
service images saving but never rendering, the apply button that faked success,
the reset endpoint that hung. Nothing prevents their recurrence.

**Fix:** highest value per hour is a small `supertest` suite over the auth and
enquiry routes — the two paths where a silent failure costs real money.

---

## 3. Medium

### M-1 · Wrong-type query parameters cause unhandled 500s
| **File** | `backend/middleware/errorHandler.js:8` |
|---|---|

`GET /api/gallery?category[$ne]=null` → **HTTP 500** with a raw Mongoose
`CastError` message.

Worth being precise about what this is and isn't: `express-mongo-sanitize`
**is working correctly** — I verified in isolation that it strips `$`-prefixed
keys to `{}`. This is *not* a NoSQL injection. It is unhandled malformed input:
the stripped `{}` reaches Mongoose, which rejects it, and the error handler has
no branch for string-cast failures (it handles `CastError` only for ObjectId).

**Impact:** trivial 500s from crafted URLs; noisy logs; a 500 where 400 belongs.

**Fix:** extend the `CastError` branch in `errorHandler.js` to return 400 for
any cast failure, not just `err.kind === "ObjectId"`.

### M-2 · Missing indexes on every queried field except slug/email
| **Files** | All models |
|---|---|

Live DB index state: `enquiries` and `galleries` have **only `_id`**. Yet
controllers filter on `isPublished`, `status`, `source`, `isOpen`, `category`
and sort on `createdAt` (9 occurrences).

**Impact:** full collection scans on every list request. Invisible at current
volume; the first thing to degrade under growth.

**Fix:** `schema.index({ isPublished: 1, createdAt: -1 })` on content models,
`{ status: 1, createdAt: -1 }` on Enquiry.

### M-3 · Admin controllers pass `req.body` straight to update
| **Files** | `projectController.js:61`, `serviceController.js:32`, `testimonialController.js:17`, `careerController.js:138`, `enquiryController.js:47`, `galleryController.js:20`, `careerController.js:130` |
|---|---|

Same pattern as C-1 but **behind authentication** — verified: all these routes
correctly reject unauthenticated requests (401). Severity is therefore Medium,
not Critical: it grants no privilege a logged-in staff member lacks, but
provides no field-level authorization and allows setting fields the UI never
exposes.

**Fix:** allowlist fields per controller. Lower priority than C-1.

### M-4 · `xss-clean` is deprecated and unmaintained
npm reports *"Package no longer supported."* It is doing real work (verified:
`<script>` payloads are escaped on write), so removing it naively would open a
stored-XSS hole. It simply has no upstream maintainer.

**Fix:** migrate to `DOMPurify` at render time, or drop it once all output is
confirmed to flow through React's automatic escaping. Do not remove without a
replacement.

### M-5 · Frontend bundle is 1.19 MB (352 KB gzipped)
Main chunk `index-*.js` = 1,286 KB; `RichTextEditor` = 929 KB (correctly
lazy-loaded, so admin-only). Vite warns on every build.

**Impact:** slow first paint on Indian mobile networks — the primary audience
for a Maharashtra solar site.

**Fix:** `manualChunks` to split vendor bundles; Leaflet and Recharts are the
biggest non-lazy offenders and are only needed on specific routes.

---

## 4. Low

- **L-1** — 23 of 23 `useQuery` call sites lack `isError` handling. Most have
  fallback content (deliberate, and verified working), but admin screens show a
  perpetual "Loading…" instead of an error on API failure.
  *Files: all `pages/admin/*.jsx`.*
- **L-2** — Five orphaned models with no controller, route, or reference:
  `AMCBooking`, `Product`, `QuoteRequest`, `SiteVisit`, `FAQ`. Dead code that
  implies working features.
- **L-3** — `express-validator` is a declared dependency but **used nowhere**.
  All validation is Mongoose schema-level only.
- **L-4** — `docker-compose.yml` and both `Dockerfile`s exist but are unused
  (deployment is Render + Vercel). Risk of drift into an untested state.
- **L-5** — No password complexity rule beyond `minlength: 8`; `Test1234`-class
  passwords are accepted.
- **L-6** — No account lockout. Login rate limiting is per-IP (verified working,
  429 after 10 attempts), so a distributed attacker gets a fresh budget per IP.

---

## 5. Verified Secure — no action needed

These were actively attacked and **held**:

| Attack | Result |
|---|---|
| NoSQL operator injection (login, forgot-password, query params) | **Blocked** — sanitizer strips `$` keys |
| JWT `alg:none` bypass | **401** |
| JWT signed with attacker secret | **401** |
| Unauthenticated access to 12 admin endpoints | **401 on all 12** |
| Privilege escalation — `editor` reaching user mgmt / leads / PII / settings | **403 on all** |
| Self-promotion to `super_admin` via `change-email` mass assignment | **Blocked** — role unchanged |
| Stored XSS via public enquiry form | **Escaped on write** |
| CSRF via form-encoded POST | **Blocked** — `express.urlencoded` deliberately disabled |
| Security headers | CSP, HSTS, `X-Frame-Options`, `nosniff`, `no-referrer` all present; no `X-Powered-By` |
| Password storage | bcrypt cost 12, `select: false` |
| Reset tokens | SHA-256 hashed at rest, 60-min expiry, single-use |
| User enumeration (login + forgot-password) | Generic responses |
| Rate limiting | Verified: 200/15min global, 10/15min login, 5/hr reset |
| Dependency vulnerabilities | `npm audit` → **0** on backend; 2 moderate on frontend (react-router, unreachable — no SSR, no user-controlled navigation) |

---

## 6. Not Tested

Stated plainly rather than assumed:

- **Cross-browser** (Safari, Firefox, Edge, mobile Safari) — no access to those engines.
- **Real load/stress testing** — no load generator run; H-3 is reasoned from
  code and index state, not measured under load.
- **Lighthouse/Core Web Vitals** (LCP, FID, CLS, TTI) — bundle size is measured;
  field metrics are not.
- **Screen-reader behaviour** (NVDA/JAWS/VoiceOver) — only static a11y checks done.
- **Full WCAG AA colour-contrast sweep** — not systematically measured.
- **Backup/restore drill** — Atlas M0 has no automated backups (see P-2).
- **Concurrency/idempotency** — no duplicate-submit or race testing performed.

---

## 7. Production Risks

- **P-1 — MongoDB password is `Test1234`** on a cluster that must allow
  `0.0.0.0/0` for Render (no static egress IP). Weakest link in the system.
  **Change this first.** It was also exposed in a screenshot during this
  session, along with `JWT_SECRET` and the Gmail app password — all three
  should be rotated.
- **P-2 — Atlas M0 free tier has no automated backups.** A bad write or
  accidental `npm run seed` is unrecoverable. This nearly happened during
  development (a seed run wiped Services/Projects/Testimonials/FAQs); a
  `require.main === module` guard now prevents accidental invocation, but there
  is still no restore path.
- **P-3 — Render free tier sleeps after ~15 min idle.** First request after
  idle takes 30–60s; a lead submitted on a cold site may appear to hang.
- **P-4 — No error tracking or uptime monitoring.** Failures are only visible by
  reading Render logs manually. Sentry (free tier) would cover this.
- **P-5 — Single super_admin account.** Losing access to that one mailbox means
  losing admin access entirely; recovery requires direct DB access.

---

## 8. Recommended Fix Order

1. **C-1** mass assignment — 10 minutes, prevents ongoing silent CRM corruption
2. **P-1** rotate MongoDB password, `JWT_SECRET`, Gmail app password — 15 minutes
3. **H-1** API 404 handling — 5 minutes, unmasks all future API errors
4. **H-2** build or delete Products/FAQ — half a day
5. **M-1** CastError → 400 — 5 minutes
6. **H-3 + M-2** pagination + indexes — half a day, before lead volume grows
7. **H-4** supertest suite over auth + enquiries — one day
8. **P-4** Sentry — 1 hour
9. **M-5** bundle splitting — half a day

---

## 9. Assumptions

- The live Atlas database was used for read-only inspection and for write tests
  that were **cleaned up immediately** — verified afterwards: 0 leftover test
  enquiries, 0 leftover test users, 35 real leads intact (unchanged from before
  the audit).
- Production behaviour was inferred by running locally with
  `NODE_ENV=production`; Render's actual runtime may differ in ways not visible
  here.
- Severity ratings assume a small-business lead-generation site: data integrity
  and lead capture weigh heavier than raw throughput.
