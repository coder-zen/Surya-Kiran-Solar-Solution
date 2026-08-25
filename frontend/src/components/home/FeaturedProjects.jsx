import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../../config/api";
import { cdnImage, IMG } from "../../utils/cloudinaryImage";
import SectionHeading from "../common/SectionHeading";
import Tilt3D from "../common/Tilt3D";

const fetchFeatured = async () => {
  const { data } = await api.get("/projects", { params: { featured: true } });
  return data.data;
};

const FeaturedProjects = () => {
  const { data: projects, isLoading, isError } = useQuery({
    queryKey: ["featured-projects"],
    queryFn: fetchFeatured,
    // Matches ProjectMap. With React Query's default 3 retries the component
    // sat on skeletons for ~7s and then fell through to the "no projects yet"
    // message rather than reporting the failure — an outage read as an empty
    // portfolio. Failing on the first attempt surfaces the real state promptly.
    retry: false,
  });

  return (
    <section className="py-24 bg-gray-50 dark:bg-navy-dark">
      <div className="container-custom">
        <SectionHeading
          eyebrow="Our Work"
          title="Featured Projects Across Maharashtra"
          subtitle="A glimpse of installations we've delivered for homes, factories and institutions."
        />

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-gray-200 dark:bg-navy-light animate-pulse" />
            ))}

          {!isLoading && !isError &&
            (projects?.length ? projects : []).slice(0, 4).map((project, i) => (
              <Tilt3D key={project._id} className="h-80">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-premium h-full"
              >
                {/* No stock-photo fallback: a project without its own photo
                    shows the brand gradient rather than borrowing an unrelated
                    installation's image, which misrepresents the portfolio. */}
                {project.coverImage ? (
                  <img
                    src={cdnImage(project.coverImage, IMG.card)}
                    alt={project.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => (e.target.style.background = "#0B2447")}
                  />
                ) : (
                  <div className="absolute inset-0 bg-navy-gradient" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/90 via-navy-dark/20 to-transparent" />
                <div className="absolute bottom-0 p-5 text-white">
                  <span className="text-xs uppercase tracking-wide text-solar-yellow font-semibold">
                    {project.category} · {project.capacityKW}kW
                  </span>
                  <h3 className="font-display font-semibold text-lg mt-1">{project.title}</h3>
                  <p className="text-xs text-gray-300 mt-1">{project.district}, Maharashtra</p>
                  <Link
                    to={`/projects/${project.slug}`}
                    className="inline-block mt-3 text-sm font-semibold text-solar-yellow hover:underline"
                  >
                    View Project →
                  </Link>
                </div>
              </motion.div>
              </Tilt3D>
            ))}

          {!isLoading && isError && (
            <p className="col-span-full text-center text-gray-400">
              Couldn't load projects right now. Please refresh the page.
            </p>
          )}

          {!isLoading && !isError && !projects?.length && (
            <p className="col-span-full text-center text-gray-400">
              No featured projects yet — add some from the admin panel.
            </p>
          )}
        </div>

        <div className="text-center mt-12">
          <Link to="/projects" className="btn-navy inline-flex">
            View All Projects
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
