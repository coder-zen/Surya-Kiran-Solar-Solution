import { useEffect, useRef, useState } from "react";

/**
 * Defers mounting its children until they are close to the viewport.
 *
 * Code-splitting alone does not help a component that sits far down the page:
 * React.lazy fetches the chunk as soon as the element renders, so both
 * homepage maps were initialising Leaflet, wiring up touch handlers and
 * pulling map tiles roughly 12,000px below the fold on a phone — all before
 * the visitor had scrolled anywhere near them. On a mid-range Android that
 * work lands squarely on the main thread and drops taps elsewhere on the page.
 *
 * The placeholder occupies the same box as the real content, so nothing shifts
 * when the swap happens. rootMargin starts the work slightly before the
 * element scrolls in, so it is ready by the time it is actually on screen.
 *
 * Falls back to rendering immediately where IntersectionObserver is missing —
 * a browser that old should still see the content, just without the saving.
 */
const LazyVisible = ({ children, className = "", rootMargin = "400px", placeholder = null }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return undefined;

    const node = ref.current;
    if (!node) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  return (
    <div ref={ref} className={className}>
      {visible ? children : placeholder}
    </div>
  );
};

export default LazyVisible;
