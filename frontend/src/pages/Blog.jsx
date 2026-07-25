import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import api from "../config/api";

const fetchBlogs = async (search) => {
  const { data } = await api.get("/blogs", { params: { search: search || undefined } }).catch(() => ({ data: { data: [] } }));
  return data.data;
};

const Blog = () => {
  const [search, setSearch] = useState("");
  const { data: blogs, isLoading } = useQuery({ queryKey: ["blogs", search], queryFn: () => fetchBlogs(search), retry: false });

  return (
    <>
      <Helmet><title>Blog | Surya Kiran Solar Solution</title></Helmet>
      <section className="pt-32 pb-12 bg-navy-gradient text-white text-center">
        <div className="container-custom">
          <h1 className="text-4xl lg:text-5xl font-display font-bold">Solar Insights & News</h1>
          <p className="mt-4 text-gray-300 max-w-xl mx-auto">Tips, subsidy updates, and industry news.</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-custom">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="rounded-full border border-gray-200 px-4 py-2 text-sm w-full sm:w-72 mb-10 block mx-auto"
          />

          {!isLoading && !blogs?.length && (
            <p className="text-center text-gray-400 py-12">No articles published yet — check back soon.</p>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs?.map((post) => (
              <Link key={post._id} to={`/blog/${post.slug}`} className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-premium transition-shadow">
                <img src={post.coverImage} alt={post.title} className="h-44 w-full object-cover bg-gray-100" onError={(e) => (e.target.style.background = "#f3f4f6")} />
                <div className="p-5">
                  <span className="text-xs uppercase text-solar-orange font-semibold">{post.category}</span>
                  <h3 className="font-display font-semibold text-lg text-navy mt-1">{post.title}</h3>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Blog;
