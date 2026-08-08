import { useEffect } from "react";

/**
 * Injects a schema.org JSON-LD block for the current page.
 *
 * Structured data is what turns a plain blue link into a rich result — star
 * ratings, FAQ accordions, service details shown directly in Google. The
 * site-wide LocalBusiness block lives in Layout.jsx because it never changes;
 * this handles the per-page blocks that do.
 *
 * Removes its script on unmount, which the Layout version deliberately does
 * not need to. Without that, navigating from one service page to the next
 * would leave the previous page's schema in <head> and Google would see two
 * conflicting Service blocks describing different things.
 *
 * Renders nothing.
 */
const JsonLd = ({ id, data }) => {
  // Serialised once so the effect re-runs when the *content* changes, not on
  // every render — an inline object literal would be a new reference each time.
  const serialised = data ? JSON.stringify(data) : null;

  useEffect(() => {
    if (!serialised) return undefined;

    // Replace rather than append: React 18 StrictMode double-invokes effects in
    // development, which would otherwise emit the same block twice.
    document.getElementById(id)?.remove();

    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = serialised;
    document.head.appendChild(script);

    return () => document.getElementById(id)?.remove();
  }, [id, serialised]);

  return null;
};

export default JsonLd;
