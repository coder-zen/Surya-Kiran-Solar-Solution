import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import api from "../config/api";
import { Assets } from "../config/images";

const CATEGORIES = ["All", "Installation", "Team", "Events", "Projects", "Office"];

const fetchGallery = async () => {
  const { data } = await api.get("/gallery").catch(() => ({ data: { data: [] } }));
  return data.data;
};

const Gallery = () => {
  const [filter, setFilter] = useState("All");
  const [lightbox, setLightbox] = useState(null);
  const { data } = useQuery({ queryKey: ["gallery"], queryFn: fetchGallery, retry: false });

  // TODO: replace with real photos once /api/gallery has admin-uploaded content
  const images = data?.length ? data : Assets.galleryPlaceholders.map((src, i) => ({ _id: i, image: src, category: "Installation" }));
  const filtered = filter === "All" ? images : images.filter((img) => img.category === filter);

  return (
    <>
      <Helmet><title>Gallery | Surya Kiran Solar Solution</title></Helmet>

      <section className="pt-32 pb-12 bg-navy-gradient text-white text-center">
        <div className="container-custom">
          <h1 className="text-4xl lg:text-5xl font-display font-bold">Gallery</h1>
          <p className="mt-4 text-gray-300 max-w-xl mx-auto">Installations, team moments, and events.</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${filter === cat ? "bg-navy text-white" : "bg-gray-100 text-gray-600"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="columns-2 sm:columns-3 gap-4 [column-fill:_balance]">
            {filtered.map((img) => (
              <motion.img
                key={img._id}
                src={img.image}
                alt={img.title || "Gallery image"}
                className="w-full mb-4 rounded-xl cursor-pointer break-inside-avoid"
                whileHover={{ scale: 1.02 }}
                onClick={() => setLightbox(img.image)}
                onError={(e) => (e.target.style.display = "none")}
              />
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[70] bg-navy-dark/95 flex items-center justify-center p-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <button className="absolute top-6 right-6 text-white text-2xl"><FaTimes /></button>
            <img src={lightbox} alt="" className="max-h-[85vh] rounded-xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Gallery;
