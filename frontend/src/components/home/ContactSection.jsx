import { useForm } from "react-hook-form";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import toast from "react-hot-toast";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaWhatsapp } from "react-icons/fa";
import api from "../../config/api";
import { COMPANY } from "../../config/constants";
import SectionHeading from "../common/SectionHeading";

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
            <MapContainer
              center={[COMPANY.officeCoordinates.lat, COMPANY.officeCoordinates.lng]}
              zoom={13}
              scrollWheelZoom={false}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[COMPANY.officeCoordinates.lat, COMPANY.officeCoordinates.lng]}>
                <Popup>{COMPANY.name}</Popup>
              </Marker>
            </MapContainer>
          </div>

          <div className="glass-card !bg-white p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <input
                    {...register("name", { required: "Name is required" })}
                    placeholder="Full Name"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-solar-orange"
                  />
                  {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <input
                    {...register("phone", { required: "Phone is required" })}
                    placeholder="Phone Number"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-solar-orange"
                  />
                  {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
                </div>
              </div>
              <input
                {...register("email")}
                type="email"
                placeholder="Email Address"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-solar-orange"
              />
              <textarea
                {...register("message")}
                rows={4}
                placeholder="Tell us about your requirement..."
                className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-solar-orange"
              />
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-base sm:text-sm">
              <a href={`tel:${COMPANY.phoneRaw}`} className="flex items-center gap-2 text-navy font-medium">
                <FaPhoneAlt className="text-solar-orange" /> {COMPANY.phone}
              </a>
              <a href={`mailto:${COMPANY.email}`} className="flex items-center gap-2 text-navy font-medium">
                <FaEnvelope className="text-solar-orange" /> {COMPANY.email}
              </a>
              <a
                href={`https://wa.me/${COMPANY.whatsapp.replace(/[^\d]/g, "")}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-navy font-medium"
              >
                <FaWhatsapp className="text-[#25D366]" /> WhatsApp Us
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
