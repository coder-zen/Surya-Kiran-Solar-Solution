import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SeoHead from "../components/common/SeoHead";
import { Link } from "react-router-dom";
import api from "../config/api";
import { Assets } from "../config/images";
import { PROJECT_CATEGORIES } from "../config/constants";

const fetchProjects = async (params) => {
  const { data } = await api.get("/projects", { params });
  return data.data;
};

const Projects = () => {
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects", category, search],
    queryFn: () => fetchProjects({ category: category || undefined, search: search || undefined }),
  });

  return (
    <>
      <SeoHead title="Projects" path="/projects" description="Explore SK Solar Solutions' on-grid rooftop solar installations across all districts of Maharashtra." />

      <section className="pt-32 pb-12 bg-navy-gradient text-white text-center">
        <div className="container-custom">
          <h1 className="text-4xl lg:text-5xl font-display font-bold">Our Projects</h1>
          <p className="mt-4 text-gray-300 max-w-xl mx-auto">A portfolio of installations across Maharashtra.</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row gap-4 justify-between mb-10">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategory("")}
                className={`px-4 py-2 rounded-full text-sm font-medium ${!category ? "bg-navy text-white" : "bg-gray-100 text-gray-600"}`}
              >
                All
              </button>
              {PROJECT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${category === cat ? "bg-navy text-white" : "bg-gray-100 text-gray-600"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="rounded-full border border-gray-200 px-4 py-2 text-sm w-full sm:w-64"
            />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-72 rounded-2xl bg-gray-100 animate-pulse" />)}

            {!isLoading &&
              projects?.map((project, i) => (
                <Link
                  key={project._id}
                  to={`/projects/${project.slug}`}
                  className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-premium h-72"
                >
                  <img
                    src={project.coverImage || Assets.projectPlaceholders[i % Assets.projectPlaceholders.length]}
                    alt={project.title}
                    className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => (e.target.style.background = "#0B2447")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/90 to-transparent" />
                  <div className="absolute bottom-0 p-5 text-white">
                    <span className="text-xs uppercase text-solar-yellow font-semibold">{project.category} · {project.capacityKW}kW</span>
                    <h3 className="font-display font-semibold text-lg mt-1">{project.title}</h3>
                    <p className="text-xs text-gray-300 mt-1">{project.district}, Maharashtra</p>
                  </div>
                </Link>
              ))}

            {!isLoading && !projects?.length && (
              <p className="col-span-full text-center text-gray-400 py-12">No projects match your filters.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Projects;
