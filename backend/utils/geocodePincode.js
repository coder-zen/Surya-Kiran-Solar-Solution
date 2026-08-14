/**
 * Turns an Indian PIN code into map coordinates.
 *
 * The homepage map placed every project at its district centre, so all three
 * Pune installations sat on one pixel and no amount of zooming separated them —
 * a cluster labelled "3" was the most detail the map could ever show. A PIN
 * code resolves to an actual locality, which is the granularity a visitor
 * wants ("do they work in my area?") without publishing a customer's exact
 * address, which nobody should.
 *
 * Nominatim (OpenStreetMap) is used because it is free, needs no key, and
 * covers Indian PIN codes well. Its usage policy requires an identifying
 * User-Agent and at most one request per second — both fine here, since this
 * runs only when an admin saves a project, not on visitor traffic.
 */

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

// Required by Nominatim's usage policy: requests without a real contact are
// blocked. https://operations.osmfoundation.org/policies/nominatim/
const USER_AGENT = "SKSolarSolutions/1.0 (info@sksolarsolution.com)";

/** Indian PIN codes are exactly six digits and never start with zero. */
const PINCODE_PATTERN = /^[1-9][0-9]{5}$/;

const isValidPincode = (pincode) => PINCODE_PATTERN.test(String(pincode || "").trim());

/*
 * Process-lifetime cache. The same PIN code is looked up every time a project
 * in that locality is saved or edited, and the answer never changes — caching
 * keeps repeat edits off Nominatim entirely, which is the polite thing to do
 * with a free service and also makes re-saves instant.
 */
const cache = new Map();

/**
 * Resolves a PIN code to GeoJSON [lng, lat], or null when it can't be placed.
 *
 * Never throws. A geocoding failure must not fail the save that triggered it —
 * the caller falls back to the district centre, which is what the map did for
 * every project before this existed.
 */
const geocodePincode = async (pincode) => {
  const pin = String(pincode || "").trim();
  if (!isValidPincode(pin)) return null;
  if (cache.has(pin)) return cache.get(pin);

  try {
    const url = `${NOMINATIM_URL}?postalcode=${pin}&country=India&format=json&limit=1`;

    // Without a timeout a hung request would stall the admin's save until the
    // platform's own proxy gave up, which on Render is a long time.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "en" },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) throw new Error(`Nominatim ${res.status}`);

    const results = await res.json();
    if (!Array.isArray(results) || !results.length) {
      console.warn(`[geocode] PIN ${pin} returned no match — falling back to district centre.`);
      cache.set(pin, null);
      return null;
    }

    const { lat, lon, display_name: label } = results[0];
    const coords = [Number(lon), Number(lat)]; // GeoJSON is [lng, lat]

    /*
     * Reject anything outside Maharashtra's bounding box. A mistyped PIN can
     * resolve cleanly to a real place a thousand kilometres away, and a pin
     * for a Pune rooftop appearing in Assam is worse than no pin at all.
     */
    const [lng, latitude] = coords;
    const insideMaharashtra = lng > 72.6 && lng < 80.9 && latitude > 15.6 && latitude < 22.1;
    if (!insideMaharashtra) {
      console.warn(`[geocode] PIN ${pin} resolved outside Maharashtra (${label}) — ignoring.`);
      cache.set(pin, null);
      return null;
    }

    console.log(`[geocode] PIN ${pin} -> ${label}`);
    cache.set(pin, coords);
    return coords;
  } catch (error) {
    // Aborts and network failures both land here; both mean "use the fallback".
    console.warn(`[geocode] PIN ${pin} lookup failed (${error.message}) — falling back to district centre.`);
    return null;
  }
};

module.exports = geocodePincode;
module.exports.isValidPincode = isValidPincode;
