# Surya Kiran Solar Solution — MERN Web Platform

A lead-generation website + admin platform for a Solar EPC company, built on
MongoDB, Express, React (Vite), and Node.js.

> **Read this first.** This repository is a real, running foundation — not a
> mockup. The sections below are honest about what's fully built, what's a
> working scaffold, and what's next, so you can pick up development quickly.

---

## 1. What's fully built

**Backend (production-ready core)**
- Express REST API with Helmet, CORS, rate limiting, Mongo sanitization, XSS protection
- JWT auth (httpOnly cookies) + bcrypt password hashing + role-based access (`protect` / `authorize`)
- Mongoose models for all 15 collections in the spec (Users, Projects, Services, Products,
  Blogs, Testimonials, Gallery, FAQs, Careers + Applications, Enquiries, AMC Plans + Bookings,
  Quote Requests, Site Visits, Settings)
- Full CRUD controllers + routes for: Auth, Projects (incl. a dedicated `/map` endpoint for
  the homepage map), Services, Testimonials, Enquiries (lead capture), Blogs
- Central error handler, async wrapper, seed script with realistic sample data

**Frontend (production-quality UI)**
- Vite + React 18 + Tailwind + Framer Motion, with a centralized design-token setup
  (`tailwind.config.js`) and a single `src/config/images.js` asset registry — replace any
  image sitewide by editing one file
- Fully built pages: **Home** (Hero w/ video bg, About, Services grid, Why Choose Us, animated
  Stats, Featured Projects, **interactive Leaflet project map with clustering**, Testimonials
  slider, Brands carousel, FAQ accordion, Contact w/ office map), **About**, **Services**
  (listing + dynamic detail page), **Projects** (filterable listing + detail page), **Contact**
- Lead-gen system wired end-to-end: sticky WhatsApp button, floating Call button, "Get Free
  Quote" modal (used by header, hero, service pages), exit-intent popup — all POST to
  `/api/enquiries` with a `source` tag for attribution
- Solar Savings Calculator + EMI Calculator with live charts (Recharts)
- Admin: login (JWT cookie auth) + dashboard shell reading real lead/project data from the API

**DevOps**
- Dockerfiles for both services + `docker-compose.yml` (Mongo + backend + Nginx-served frontend)
- `.env.example` for both apps

## 2. What's scaffolded (works, but intentionally minimal)

These pages render, call real (or gracefully-degrading) endpoints, and follow the same
component patterns as the finished pages — extend them the same way:

- **Gallery** (masonry + lightbox + category filter, falls back to placeholder images)
- **Products**, **AMC Plans**, **Government Subsidy**, **Blog** (+ detail), **Career**
  (listing + apply form — resume upload endpoint not yet wired)
- **Admin Dashboard** — shows real lead/project counts and a leads-by-status chart, but only
  Projects/Services/Testimonials/Enquiries/Blogs have full CRUD routes so far. Add
  `/admin/gallery`, `/admin/products`, `/admin/careers`, `/admin/users`, `/admin/settings`
  screens following `AdminDashboard.jsx`'s pattern, and mount the matching backend routers in
  `server.js` (models already exist for all of them).

## 3. Known simplifications vs. the original brief

- **Project map**: uses OpenStreetMap tiles via Leaflet + marker clustering, centered on
  Maharashtra, with real popups (project name, district, capacity, "View Full Project" link).
  It does **not** yet do the animated India → Maharashtra → district GeoJSON zoom sequence —
  that's a clean extension point noted in `ProjectMap.jsx` (coordinates already stored as
  GeoJSON with a `2dsphere` index, so no schema changes are needed to add it).
- **Cloudinary uploads**: the backend is configured for Cloudinary (env vars in
  `.env.example`), but the actual multer→Cloudinary upload route/controller isn't wired yet —
  add an `uploadRoutes.js` using `multer` + the `cloudinary` SDK.
- **TypeScript**: the brief listed TS as "preferred." This build uses modern JS with clear
  prop/data shape comments instead, to keep the codebase approachable — migrating is
  straightforward given the modular structure.
- Images/videos are **placeholders by convention**: every image import has a `TODO` comment
  with the exact replacement path, recommended dimensions, and format (see
  `frontend/src/config/images.js` — the single file to edit when real brand assets arrive).
  Components also `onError`-fallback gracefully if a placeholder path 404s, so the site never
  breaks visually before real assets are added.

---

## 4. Project structure

```
surya-kiran-solar/
├── backend/
│   ├── config/db.js
│   ├── models/            # 14 Mongoose schemas
│   ├── controllers/       # business logic
│   ├── routes/            # Express routers
│   ├── middleware/        # auth.js, errorHandler.js
│   ├── utils/generateToken.js
│   ├── seed/seed.js
│   ├── server.js
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── assets/        # logo/ images/ videos/ icons/ illustrations/ (empty — see below)
│   │   ├── components/
│   │   │   ├── layout/    # Navbar, Footer, Layout
│   │   │   ├── home/      # Hero, ServicesGrid, ProjectMap, Testimonials, etc.
│   │   │   ├── common/    # EnquiryModal, WhatsAppButton, CallButton, SectionHeading
│   │   │   └── ui/        # CountUp
│   │   ├── pages/          # one file per route, + pages/admin/
│   │   ├── context/AuthContext.jsx
│   │   ├── config/         # images.js (asset registry), api.js, constants.js
│   │   └── App.jsx / main.jsx
│   └── Dockerfile / nginx.conf
├── docker-compose.yml
└── README.md (this file)
```

---

## 5. Local setup

### Prerequisites
- Node.js 18+
- MongoDB running locally, **or** a free MongoDB Atlas cluster
- npm

### Backend
```bash
cd backend
cp .env.example .env       # then edit MONGO_URI, JWT_SECRET, etc.
npm install
npm run seed                # inserts sample projects/services/testimonials/FAQs + a default admin
npm run dev                 # starts on http://localhost:5000
```
Default seeded admin login: `admin@suryakiransolar.com` / `ChangeMe@123` — **change this
immediately** after first login (or better, change the password in `seed/seed.js` before
running it).

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev                 # starts on http://localhost:5173, proxies /api to :5000
```

### With Docker (both services + MongoDB)
```bash
cp backend/.env.example backend/.env   # edit as needed
docker compose up --build
# frontend → http://localhost
# backend  → http://localhost:5000
```

---

## 6. API reference (implemented routes)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login, sets httpOnly JWT cookie |
| POST | `/api/auth/logout` | Private | Clears auth cookie |
| GET | `/api/auth/me` | Private | Current user profile |
| GET | `/api/projects` | Public | List projects (`?category=&district=&featured=&search=`) |
| GET | `/api/projects/map` | Public | Lightweight project points for the homepage map |
| GET | `/api/projects/:slug` | Public | Single project |
| POST/PUT/DELETE | `/api/projects` | Admin/Editor | Manage projects |
| GET | `/api/services` | Public | List services |
| GET | `/api/services/:slug` | Public | Single service |
| POST/PUT/DELETE | `/api/services` | Admin/Editor | Manage services |
| GET | `/api/testimonials` | Public | List testimonials |
| POST | `/api/enquiries` | Public | **Every lead form on the site posts here** |
| GET | `/api/enquiries` | Admin/Employee | CRM lead list |
| GET | `/api/blogs`, `/api/blogs/:slug` | Public | Blog listing/detail |

Add the remaining routers (Products, FAQs, Careers, AMC, Quote Requests, Site Visits, Gallery,
Settings) the same way — models already exist, just add `controllers/xController.js` +
`routes/xRoutes.js` and mount in `server.js`.

---

## 7. Recommended next steps (in priority order)

1. Add real brand assets by editing `frontend/src/config/images.js` only.
2. Wire Cloudinary upload route (`multer` + `cloudinary` SDK, both already in `package.json`).
3. Build out remaining admin CRUD screens (Gallery, Products, Careers, Users, Settings)
   following `AdminDashboard.jsx` + `ProtectedRoute.jsx`.
4. Add the animated India → Maharashtra GeoJSON zoom sequence to `ProjectMap.jsx`.
5. Add email/WhatsApp notifications on new-lead creation (`enquiryController.js` has a TODO
   marking exactly where to hook this in).
6. Write the XML sitemap / robots.txt and JSON-LD schema once real content and a production
   domain are finalized (SEO scaffolding — meta tags, `react-helmet-async` — is already wired
   into every page).
7. Migrate to TypeScript if desired — the modular file structure makes this an incremental,
   file-by-file migration rather than a rewrite.

---

## 8. Security checklist before going live

- [ ] Change the seeded admin password immediately (`ChangeMe@123` is a placeholder)
- [ ] Set a long, random `JWT_SECRET` in production `.env`
- [ ] Set `NODE_ENV=production` and serve over HTTPS (cookie `secure` flag depends on this)
- [ ] Review and tighten the `express-rate-limit` window/max for your expected traffic
- [ ] Replace placeholder `CLIENT_URL` / CORS origin with your real production domain
