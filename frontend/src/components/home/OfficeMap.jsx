import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { COMPANY } from "../../config/constants";

/**
 * The office locator from ContactSection, split into its own module purely so
 * react-leaflet stays out of the eager homepage chunk. ContactSection also
 * holds the enquiry form, which is the page's main conversion path and has to
 * stay eager — extracting just the map keeps the form immediate while Leaflet
 * loads lazily alongside the page, sharing one chunk with ProjectMap.
 *
 * Markup is unchanged from where it used to live inline; the sizing wrapper
 * stays in ContactSection so the placeholder and the map share one frame.
 */
const OfficeMap = () => (
  <MapContainer
    center={[COMPANY.officeCoordinates.lat, COMPANY.officeCoordinates.lng]}
    zoom={13}
    scrollWheelZoom={false}
    className="h-full w-full"
  >
    <TileLayer
      attribution="&copy; OpenStreetMap contributors"
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <Marker position={[COMPANY.officeCoordinates.lat, COMPANY.officeCoordinates.lng]}>
      <Popup>{COMPANY.name}</Popup>
    </Marker>
  </MapContainer>
);

export default OfficeMap;
