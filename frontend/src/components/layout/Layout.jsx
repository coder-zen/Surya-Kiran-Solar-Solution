import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollProgress from "../common/ScrollProgress";
import WhatsAppButton from "../common/WhatsAppButton";
import CallButton from "../common/CallButton";
import api from "../../config/api";
import { COMPANY, MAHARASHTRA_DISTRICTS, resolveSocialLinks } from "../../config/constants";
import { SITE_URL, DEFAULT_OG_IMAGE } from "../../config/seo";

const fetchSettings = async () => (await api.get("/settings")).data.data;

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
  /*
   * Every district actually served, not just the three the business started in.
   * areaServed is the field Google weighs for "solar installer near me" in a
   * given city, so listing only Pune/Solapur/Kolhapur told it not to surface
   * this business anywhere else in the state — including Nashik, Nagpur and
   * Thane, which are among the largest solar markets in Maharashtra.
   * Derived from MAHARASHTRA_DISTRICTS so it can't drift from the districts
   * offered in the admin dropdowns.
   */
  areaServed: [
    { "@type": "State", name: "Maharashtra" },
    ...MAHARASHTRA_DISTRICTS.map((district) => ({
      "@type": "AdministrativeArea",
      name: `${district}, Maharashtra`,
    })),
  ],
  priceRange: "₹₹",
};

const Layout = () => {
  // sameAs is what ties this site to its social profiles in Google's knowledge
  // graph, so it has to follow whatever the admin has saved rather than a
  // build-time constant. Shares the "settings" cache with Hero and Footer.
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings, retry: false });

  useEffect(() => {
    const id = "local-business-schema";
    // Rebuilt when the links arrive, so the tag isn't frozen with whatever was
    // known on first paint.
    document.getElementById(id)?.remove();

    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      ...localBusinessSchema,
      // resolveSocialLinks drops bare domains, so an unclaimed network is
      // omitted rather than published as a profile that doesn't exist.
      sameAs: Object.values(resolveSocialLinks(settings)),
    });
    document.head.appendChild(script);
  }, [settings]);

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollProgress />
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
