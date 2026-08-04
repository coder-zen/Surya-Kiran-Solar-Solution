import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import api from "../../config/api";
import { Assets } from "../../config/images";
import SectionHeading from "../common/SectionHeading";

const fetchSettings = async () => (await api.get("/settings")).data.data;

/**
 * Used while /api/settings is loading or if it's unreachable, so this section
 * is never blank. Editable at /admin/homepage once loaded.
 */
const FALLBACK = {
  aboutImageUrl: "",
  aboutEyebrow: "About SK Solar Solutions",
  aboutHeadline: "Engineering A Cleaner, More Independent Future",
  aboutBodyText:
    "SK Solar Solutions (Surya Kiran Solar Solutions), led by Director Suraj Dhotre, plans and delivers rooftop and ground-mounted solar power plants end-to-end — site survey, system design, module & BOS selection, erection, commissioning and MSEDCL liaisoning. Our residential solar solutions have helped solarize 70+ homes across India, using high-efficiency Monocrystalline panels backed by a 25-year performance warranty.",
  aboutBulletPoints: [
    "MNRE & IEC-certified installation standards on every project",
    "In-house engineering, fabrication & commissioning teams",
    "Complete MSEDCL net-metering and subsidy paperwork, handled for you",
    "25-year panel performance warranty and up to 10-year inverter warranty",
  ],
  aboutStatValue: "70+",
  aboutStatLabel: "Homes Solarized",
};

const AboutSection = () => {
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings, retry: false });
  const content = { ...FALLBACK, ...(settings?.homepageContent || {}) };

  // Admin-set image wins; the bundled asset stays the default so an empty
  // Settings document still renders the original photo rather than nothing.
  const imageSrc = content.aboutImageUrl || Assets.aboutImage;
  const points = content.aboutBulletPoints?.length ? content.aboutBulletPoints : FALLBACK.aboutBulletPoints;

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container-custom grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <img
            src={imageSrc}
            alt="SK Solar Solutions installation team"
            className="rounded-3xl shadow-premium w-full h-[420px] object-cover"
            onError={(e) => (e.target.style.background = "linear-gradient(135deg,#19376D,#0B2447)")}
          />
          <div className="absolute -bottom-8 -right-6 glass-card p-6 hidden sm:block">
            <p className="text-3xl font-display font-bold text-navy">{content.aboutStatValue}</p>
            <p className="text-sm text-gray-500">{content.aboutStatLabel}</p>
          </div>
        </motion.div>

        <div>
          <SectionHeading
            align="left"
            eyebrow={content.aboutEyebrow}
            title={content.aboutHeadline}
          />
          <p className="mt-6 text-gray-600 leading-relaxed">{content.aboutBodyText}</p>

          <ul className="mt-8 space-y-3">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <FaCheckCircle className="text-solar-orange mt-1 shrink-0" />
                <span className="text-gray-700">{point}</span>
              </li>
            ))}
          </ul>

          <Link to="/about" className="btn-navy inline-flex mt-9">
            More About Us
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
