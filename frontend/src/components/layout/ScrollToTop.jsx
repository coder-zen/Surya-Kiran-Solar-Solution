import { useLayoutEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Puts each new page at the top.
 *
 * A browser resets scroll on a full page load, but a client-side route change
 * is not one — React Router leaves the viewport exactly where it was. Following
 * a link from halfway down the homepage therefore landed the visitor halfway
 * down the next page, on whatever section happened to be at that offset. On
 * mobile that reads as the tap having done nothing at all, which is why
 * reloading appeared to "fix" it: a reload really does start at the top.
 *
 * useLayoutEffect rather than useEffect so the jump happens before the browser
 * paints. With useEffect the new page is painted at the old offset first and
 * the correction is visible as a flick.
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useLayoutEffect(() => {
    // Back and forward should return to where the visitor was — the browser
    // restores that itself, and overriding it loses their place.
    if (navigationType === "POP") return;

    // A link to #section is asking for a specific position, not the top.
    if (hash) return;

    window.scrollTo(0, 0);
  }, [pathname, hash, navigationType]);

  return null;
};

export default ScrollToTop;
