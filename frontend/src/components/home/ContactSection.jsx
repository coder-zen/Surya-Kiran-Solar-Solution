import { useForm } from "react-hook-form";
import { lazy, Suspense } from "react";
import toast from "react-hot-toast";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaWhatsapp } from "react-icons/fa";
import api from "../../config/api";
import { COMPANY } from "../../config/constants";
import SectionHeading from "../common/SectionHeading";
import LazyVisible from "../common/LazyVisible";

// Keeps Leaflet out of the eager homepage bundle — see OfficeMap.jsx.
const OfficeMap = lazy(() => import("./OfficeMap"));

const ContactSection = () => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (formData) => {
    try {
      await api.post("/enquiries", { ...formData, source: "contact_form" });
      toast.success("Message sent! We'll get back to you shortly.");
      reset();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <section className="py-24 bg-gray-50">
      <div className="container-custom">
        <SectionHeading eyebrow="Get In Touch" title="Let's Talk About Your Solar Project" />

        <div className="mt-14 grid lg:grid-cols-2 gap-10">
          <div className="rounded-3xl overflow-hidden shadow-premium h-80 lg:h-auto">
            {/* Fills the same frame as the map, so nothing shifts on swap.
                LazyVisible holds the chunk back until the section is near the
                viewport — lazy() alone would fetch Leaflet on page load. */}
            <LazyVisible className="h-full w-full" placeholder={<div className="h-full w-full bg-gray-100" />}>
              <Suspense fallback={<div className="h-full w-full bg-gray-100" />}>
                <OfficeMap />
              </Suspense>
            </LazyVisible>
          </div>

          <div className="glass-card !bg-white p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <input
                    {...register("name", { required: "Name is required" })}
                    placeholder="Full Name"
                    className="input-field"
                  />
                  {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <input
                    {...register("phone", { required: "Phone is required" })}
                    placeholder="Phone Number"
                    className="input-field"
                  />
                  {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
                </div>
              </div>
              <input
                {...register("email")}
                type="email"
                placeholder="Email Address"
                className="input-field"
              />
              <textarea
                {...register("message")}
                rows={4}
                placeholder="Tell us about your requirement..."
                className="input-field"
              />
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-base sm:text-sm">
              <a href={`tel:${COMPANY.phoneRaw}`} className="flex items-center gap-2 min-w-0 text-navy font-medium">
                <FaPhoneAlt className="text-solar-orange shrink-0" /> <span className="truncate">{COMPANY.phone}</span>
              </a>
              <a href={`mailto:${COMPANY.email}`} className="flex items-center gap-2 min-w-0 text-navy font-medium">
                <FaEnvelope className="text-solar-orange shrink-0" /> <span className="truncate">{COMPANY.email}</span>
              </a>
              <a
                href={`https://wa.me/${COMPANY.whatsapp.replace(/[^\d]/g, "")}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 min-w-0 text-navy font-medium"
              >
                <FaWhatsapp className="text-[#25D366] shrink-0" /> <span className="truncate">WhatsApp Us</span>
              </a>
            </div>
            <p className="flex items-start gap-2 text-base sm:text-sm text-gray-500 mt-4">
              <FaMapMarkerAlt className="text-solar-orange mt-0.5 shrink-0" /> {COMPANY.address}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
