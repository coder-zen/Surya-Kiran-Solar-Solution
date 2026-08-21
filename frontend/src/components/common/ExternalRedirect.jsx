import { useEffect } from "react";

/**
 * Sends a retired internal route to an external URL.
 *
 * Used where a page has been removed in favour of somebody else's — the
 * subsidy page now points at the government's own portal. Old links, search
 * results and bookmarks still exist, and landing them on a 404 loses a visitor
 * who was looking for exactly what the destination provides.
 *
 * `replace` rather than `href`, so the retired route does not sit in history:
 * pressing Back would otherwise return here and immediately redirect again,
 * trapping the visitor.
 */
const ExternalRedirect = ({ to }) => {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);

  // Briefly visible while the browser navigates, and the fallback if a
  // redirect is blocked — never a blank screen.
  return (
    <div className="min-h-[60vh] grid place-items-center px-6 text-center">
      <div>
        <p className="text-gray-500">Taking you to the official PM Surya Ghar portal…</p>
        <a href={to} className="btn-navy inline-flex mt-5">
          Continue
        </a>
      </div>
    </div>
  );
};

export default ExternalRedirect;
