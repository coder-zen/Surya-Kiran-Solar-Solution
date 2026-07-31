import { useEffect } from "react";
import { COMPANY } from "../../config/constants";
import { DEFAULT_OG_IMAGE, absoluteUrl } from "../../config/seo";

/**
 * Sets <title>, meta description, canonical, Open Graph and Twitter tags for
 * the current page.
 *
 * Implemented with a plain effect rather than react-helmet-async: that library
 * applies tags correctly under `vite dev` but silently applies nothing in a
 * production build here (verified with a bare <Helmet> probe at the app root
 * — zero tags emitted), which would have shipped every route with the generic
 * index.html title and no canonical. Direct DOM writes behave identically in
 * dev and prod, so what is verified locally is what search engines get.
 *
 * Each tag is looked up by selector and updated IN PLACE — including the
 * static fallback og:/description tags in index.html, which are adopted on
 * first run rather than duplicated. That matters because duplicate
 * description/canonical tags let Google pick the wrong one for a page.
 */
const MANAGED_ATTR = "data-seo";

const setTag = (selector, create, content) => {
  // Match an existing tag whether it came from index.html or a previous
  // render, so client-side navigation rewrites rather than appends.
  let el = document.head.querySelector(selector);
  if (!content) {
    // Only remove tags we created; leave index.html's static fallbacks intact
    // so non-JS link-preview bots still get something.
    if (el?.hasAttribute(MANAGED_ATTR)) el.remove();
    return;
  }
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(MANAGED_ATTR, "");
  if (el.tagName === "LINK") el.setAttribute("href", content);
  else el.setAttribute("content", content);
};

const setMetaByName = (name, content) =>
  setTag(`meta[name="${name}"]`, () => {
    const m = document.createElement("meta");
    m.setAttribute("name", name);
    return m;
  }, content);

const setMetaByProperty = (property, content) =>
  setTag(`meta[property="${property}"]`, () => {
    const m = document.createElement("meta");
    m.setAttribute("property", property);
    return m;
  }, content);

const SeoHead = ({ title, description, path = "/", image = DEFAULT_OG_IMAGE, type = "website" }) => {
  const fullTitle = title?.includes(COMPANY.name) ? title : `${title} | ${COMPANY.name}`;
  const url = absoluteUrl(path);

  useEffect(() => {
    document.title = fullTitle;

    setMetaByName("description", description);
    setTag('link[rel="canonical"]', () => {
      const l = document.createElement("link");
      l.setAttribute("rel", "canonical");
      return l;
    }, url);

    setMetaByProperty("og:type", type);
    setMetaByProperty("og:site_name", COMPANY.name);
    setMetaByProperty("og:title", fullTitle);
    setMetaByProperty("og:description", description);
    setMetaByProperty("og:url", url);
    setMetaByProperty("og:image", image);
    setMetaByProperty("og:locale", "en_IN");

    setMetaByName("twitter:card", "summary_large_image");
    setMetaByName("twitter:title", fullTitle);
    setMetaByName("twitter:description", description);
    setMetaByName("twitter:image", image);
  }, [fullTitle, description, url, image, type]);

  return null;
};

export default SeoHead;
