import SeoHead from "../components/common/SeoHead";
import { useQuery } from "@tanstack/react-query";
import { FaDownload } from "react-icons/fa";
import api from "../config/api";

const fetchProducts = async () => {
  const { data } = await api.get("/products").catch(() => ({ data: { data: [] } }));
  return data.data;
};

const Products = () => {
  const { data: products } = useQuery({ queryKey: ["products"], queryFn: fetchProducts, retry: false });

  return (
    <>
      <SeoHead title="Products" path="/products" description="Solar panels, inverters and mounting structures from trusted brands — Waaree, Adani Solar, Growatt, UTL Solar and more." />
      <section className="pt-32 pb-12 bg-navy-gradient text-white text-center">
        <div className="container-custom">
          <h1 className="text-4xl lg:text-5xl font-display font-bold">Products</h1>
          <p className="mt-4 text-gray-300 max-w-xl mx-auto">Premium panels, inverters and accessories from trusted brands.</p>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-navy">
        <div className="container-custom">
          {!products?.length && (
            <p className="text-center text-gray-400 py-12">
              No products published yet — add products from the admin panel (Panels, Inverters, Batteries,
              Mounting Structures, Cables, Accessories).
            </p>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products?.map((p) => (
              <div key={p._id} className="rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-6">
                <img
                  src={p.images?.[0]}
                  alt={p.name}
                  className="h-40 w-full object-cover rounded-xl mb-4 bg-gray-100 dark:bg-navy-light"
                  onError={(e) => (e.target.style.background = "#f3f4f6")}
                />
                <span className="text-xs uppercase text-solar-orange font-semibold">{p.brand}</span>
                <h3 className="font-display font-semibold text-lg text-navy dark:text-white mt-1">{p.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">{p.warranty}</p>
                {p.brochureUrl && (
                  <a href={p.brochureUrl} className="inline-flex items-center gap-2 text-sm font-semibold text-solar-orange mt-3">
                    <FaDownload /> Download Brochure
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Products;
