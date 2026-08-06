/**
 * Regenerates public/sitemap.xml from the live API.
 *
 * The sitemap used to be hand-maintained, which was fine when every page was
 * hardcoded. Services, projects and blog posts are now admin-editable in the
 * database, so a static file silently goes stale the moment staff publish
 * anything — new work would never be indexed. This pulls the real slugs
 * instead.
 *
 * Run after publishing content:
 *   npm run sitemap
 *
 * Fails loudly if the API is unreachable rather than writing a truncated
 * sitemap — quietly dropping every project URL is worse than not running.
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SITE_URL = process.env.SITE_URL || "https://www.sksolarsolution.com";
const API_URL = process.env.SITEMAP_API_URL || "https://surya-kiran-solar-solution.onrender.com/api";

/** Routes that exist in App.jsx and aren't driven by the database. */
const STATIC_ROUTES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/services", changefreq: "monthly", priority: "0.9" },
  { path: "/pricing", changefreq: "weekly", priority: "0.9" },
  { path: "/projects", changefreq: "weekly", priority: "0.8" },
  { path: "/government-subsidy", changefreq: "monthly", priority: "0.8" },
  { path: "/contact", changefreq: "monthly", priority: "0.8" },
  // Ranks for "solar savings calculator" / "solar EMI calculator" — high
  // commercial intent, and it was missing from the hand-written sitemap.
  { path: "/calculators", changefreq: "monthly", priority: "0.8" },
  { path: "/amc-plans", changefreq: "monthly", priority: "0.7" },
  { path: "/gallery", changefreq: "monthly", priority: "0.6" },
  { path: "/products", changefreq: "monthly", priority: "0.6" },
  { path: "/blog", changefreq: "weekly", priority: "0.6" },
  { path: "/career", changefreq: "monthly", priority: "0.4" },
  { path: "/privacy-policy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
];

const fetchJson = async (path) => {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`GET ${path} returned ${res.status}`);
  const body = await res.json();
  return body.data || [];
};

const urlEntry = ({ path, changefreq, priority, lastmod }) =>
  `  <url><loc>${SITE_URL}${path}</loc>` +
  (lastmod ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>` : "") +
  `<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;

const run = async () => {
  console.log(`Fetching content from ${API_URL} …`);

  const [services, projects, blogs] = await Promise.all([
    fetchJson("/services"),
    fetchJson("/projects"),
    fetchJson("/blogs"),
  ]);

  const entries = [
    ...STATIC_ROUTES,
    ...services
      .filter((s) => s.slug)
      .map((s) => ({ path: `/services/${s.slug}`, changefreq: "monthly", priority: "0.7", lastmod: s.updatedAt })),
    ...projects
      .filter((p) => p.slug)
      .map((p) => ({ path: `/projects/${p.slug}`, changefreq: "monthly", priority: "0.6", lastmod: p.updatedAt })),
    ...blogs
      .filter((b) => b.slug)
      .map((b) => ({ path: `/blog/${b.slug}`, changefreq: "monthly", priority: "0.6", lastmod: b.updatedAt })),
  ];

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries.map(urlEntry).join("\n") +
    `\n</urlset>\n`;

  const outPath = join(__dirname, "..", "public", "sitemap.xml");
  writeFileSync(outPath, xml, "utf8");

  console.log(
    `Wrote ${entries.length} URLs → public/sitemap.xml ` +
      `(${STATIC_ROUTES.length} static, ${services.length} services, ${projects.length} projects, ${blogs.length} blog posts)`
  );
};

run().catch((err) => {
  console.error("\n[sitemap] FAILED:", err.message);
  console.error("[sitemap] sitemap.xml left unchanged — fix the API and re-run.\n");
  process.exit(1);
});
