/**
 * All 36 districts of Maharashtra with approximate district-centre coordinates
 * in [lng, lat] (GeoJSON order, matching Project.location.coordinates).
 *
 * Used to place admin-created projects on the homepage map without requiring a
 * precise GPS pin at creation time — a project pinned only to its district
 * lands at the district centre.
 *
 * NOTE: the district *names* are mirrored in frontend/src/config/constants.js
 * (MAHARASHTRA_DISTRICTS) for the admin dropdowns. Frontend and backend are
 * separate packages with no shared module, so if you add or rename a district
 * here, update that list too — the two must stay in sync.
 *
 * Renamed districts keep their long-standing names where existing project data
 * already uses them (e.g. "Ahmednagar" rather than "Ahilyanagar"), so stored
 * documents continue to match the dropdown options.
 */
const DISTRICT_COORDS = {
  Ahmednagar: [74.748, 19.0952],
  Akola: [77.0082, 20.7002],
  Amravati: [77.7523, 20.9374],
  Beed: [75.7601, 18.9891],
  Bhandara: [79.65, 21.17],
  Buldhana: [76.18, 20.53],
  Chandrapur: [79.3, 19.95],
  "Chhatrapati Sambhajinagar": [75.3433, 19.8762],
  Dharashiv: [76.0419, 18.186],
  Dhule: [74.7749, 20.9042],
  Gadchiroli: [80.0, 20.18],
  Gondia: [80.1961, 21.4624],
  Hingoli: [77.15, 19.7167],
  Jalgaon: [75.5626, 21.0077],
  Jalna: [75.8864, 19.841],
  Kolhapur: [74.2433, 16.705],
  Latur: [76.5604, 18.4088],
  "Mumbai City": [72.8347, 18.9388],
  "Mumbai Suburban": [72.8562, 19.1136],
  Nagpur: [79.0882, 21.1458],
  Nanded: [77.321, 19.1383],
  Nandurbar: [74.24, 21.37],
  Nashik: [73.7898, 19.9975],
  Palghar: [72.765, 19.697],
  Parbhani: [76.7767, 19.2704],
  Pune: [73.8567, 18.5204],
  Raigad: [73.18, 18.51],
  Ratnagiri: [73.312, 16.9902],
  Sangli: [74.5815, 16.8524],
  Satara: [74.0183, 17.6805],
  Sindhudurg: [73.52, 16.13],
  Solapur: [75.9064, 17.6599],
  Thane: [72.9781, 19.2183],
  Wardha: [78.6022, 20.7453],
  Washim: [77.1333, 20.1],
  Yavatmal: [78.13, 20.39],
};

/** District names, alphabetical — the order they appear in admin dropdowns. */
const DISTRICT_NAMES = Object.keys(DISTRICT_COORDS);

/** Returns a GeoJSON Point for a district, or null if the district is unknown. */
const pointForDistrict = (district) =>
  DISTRICT_COORDS[district] ? { type: "Point", coordinates: DISTRICT_COORDS[district] } : null;

module.exports = { DISTRICT_COORDS, DISTRICT_NAMES, pointForDistrict };
