import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaTimes } from "react-icons/fa";
import api from "../../config/api";

/**
 * "Get Free Quote" modal — triggered from header CTA, hero buttons, exit-intent,
 * and service page CTAs. Posts to POST /api/enquiries with a `source` tag so
 * leads can be attributed back to whichever UI element opened the modal.
 *
 * `contextMessage` lets a caller attach what the visitor was doing when they
 * opened it — the quotation configurator passes the system they built, so the
 * lead arrives with the specification rather than as a bare callback request.
 * It is prepended to anything the customer types, never replacing it.
 */
const EnquiryModal = ({ isOpen, onClose, source = "other", contextMessage = "" }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (formData) => {
    try {
      const message = [contextMessage, formData.message].filter(Boolean).join("\n\n");
      await api.post("/enquiries", { ...formData, message, source });
      toast.success("Thanks! Our team will call you shortly.");
      reset();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-dark/60 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-premium"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 text-gray-400 hover:text-navy"
            >
              <FaTimes size={18} />
            </button>

            <h3 className="section-heading !text-2xl mb-1">Get Your Free Solar Quote</h3>
            <p className="subtitle-text !mt-0 !text-base mb-6">Fill in your details — our solar expert will call you within 24 hours.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: { value: /^[0-9+\s-]{10,15}$/, message: "Enter a valid phone number" },
                  })}
                  placeholder="Phone Number"
                  className="input-field"
                />
                {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
              </div>

              {/*
                Required, because the acknowledgement email has nowhere to go
                without it — the quote form previously collected only a phone
                number, so a customer submitting it could never be sent
                anything in writing.
              */}
              <div>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required — we'll send your quote here",
                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address" },
                  })}
                  placeholder="Email Address"
                  className="input-field"
                />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              <input
                {...register("city")}
                placeholder="City"
                className="input-field"
              />

              <select
                {...register("propertyType")}
                defaultValue=""
                className="input-field text-gray-600"
              >
                <option value="" disabled>Property Type</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
                <option value="Government">Government</option>
              </select>

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? "Submitting..." : "Request Free Quote"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EnquiryModal;
