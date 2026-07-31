import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppButton from "../common/WhatsAppButton";
import CallButton from "../common/CallButton";
import { COMPANY } from "../../config/constants";
import { SITE_URL, DEFAULT_OG_IMAGE } from "../../config/seo";

// Site-wide LocalBusiness structured data — helps Google show a rich local
// result (address, phone, service area) for "solar Pune" / "SK Solar"
// searches. Mounted once here (not per-page) since NAP data doesn't change
// across routes; areaServed lists the districts we actually serve.
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "RoofingContractor",
  name: COMPANY.name,
  alternateName: COMPANY.legalName,
  image: DEFAULT_OG_IMAGE,
  logo: DEFAULT_OG_IMAGE,
  url: SITE_URL,
  telephone: COMPANY.phoneRaw,
  email: COMPANY.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Near Akshay Garden Hotel, Belekar Wasti, Manjari Budruk",
    addressLocality: "Pune",
    addressRegion: "Maharashtra",
    postalCode: "412307",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: COMPANY.officeCoordinates.lat,
    longitude: COMPANY.officeCoordinates.lng,
  },
  areaServed: ["Pune", "Solapur", "Kolhapur", "Maharashtra"],
  priceRange: "₹₹",
  // Only include real profile links — COMPANY.social currently holds bare
  // placeholder domains (no handle yet), which would be false structured
  // data if published as-is.
  sameAs: Object.values(COMPANY.social).filter((url) => new URL(url).pathname.length > 1),
};

const Layout = () => {
  useEffect(() => {
    const id = "local-business-schema";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(localBusinessSchema);
    document.head.appendChild(script);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <CallButton />
    </div>
  );
};

export default Layout;
