import { useQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { FaStar, FaCheckCircle, FaQuoteLeft } from "react-icons/fa";
import api from "../../config/api";
import { Assets } from "../../config/images";
import SectionHeading from "../common/SectionHeading";
import "swiper/css";
import "swiper/css/pagination";

const fetchTestimonials = async () => {
  const { data } = await api.get("/testimonials");
  return data.data;
};

const Testimonials = () => {
  const { data: testimonials, isLoading } = useQuery({ queryKey: ["testimonials"], queryFn: fetchTestimonials });

  return (
    <section className="py-24 bg-gray-50">
      <div className="container-custom">
        <SectionHeading eyebrow="Customer Stories" title="What Our Customers Say" />

        {!isLoading && testimonials?.length > 0 && (
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{ 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
            autoplay={{ delay: 5000 }}
            pagination={{ clickable: true }}
            className="mt-14 !pb-12"
          >
            {testimonials.map((t) => (
              <SwiperSlide key={t._id}>
                <div className="glass-card !bg-white p-7 h-full flex flex-col">
                  <FaQuoteLeft className="text-solar-orange text-2xl mb-4" />
                  <p className="text-gray-600 leading-relaxed flex-1">{t.message}</p>
                  <div className="flex items-center gap-3 mt-6">
                    {/* TODO: replace with real customer photo (consent required) */}
                    <img
                      src={t.image || Assets.testimonialPlaceholder}
                      alt={t.customerName}
                      className="h-11 w-11 rounded-full object-cover bg-gray-200"
                      onError={(e) => (e.target.style.visibility = "hidden")}
                    />
                    <div>
                      <p className="font-semibold text-navy flex items-center gap-1.5">
                        {t.customerName} {t.isVerified && <FaCheckCircle className="text-blue-500 text-xs" />}
                      </p>
                      <p className="text-xs text-gray-400">{t.location}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-3 text-solar-yellow text-sm">
                    {Array.from({ length: t.rating }).map((_, i) => <FaStar key={i} />)}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
