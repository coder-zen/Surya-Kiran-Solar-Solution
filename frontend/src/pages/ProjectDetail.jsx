import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaMapMarkerAlt, FaBolt, FaCalendarAlt, FaStar } from "react-icons/fa";
import api from "../config/api";
import { Assets } from "../config/images";
import SeoHead from "../components/common/SeoHead";

const fetchProject = async (slug) => {
  const { data } = await api.get(`/projects/${slug}`);
  return data.data;
};

const ProjectDetail = () => {
  const { slug } = useParams();
  const { data: project, isLoading, isError } = useQuery({
    queryKey: ["project", slug],
    queryFn: () => fetchProject(slug),
    retry: false,
  });

  if (isLoading) return <div className="pt-40 pb-20 text-center text-gray-400">Loading project...</div>;

  if (isError || !project) {
    return (
      <div className="pt-40 pb-20 text-center">
        <p className="text-gray-500">Project not found.</p>
        <Link to="/projects" className="btn-navy inline-flex mt-6">Back to Projects</Link>
      </div>
    );
  }

  return (
    <>
      <SeoHead
        title={project.title}
        path={`/projects/${slug}`}
        description={project.description || `${project.title} — a ${project.capacityKW}kW on-grid rooftop solar installation in ${project.district}, Maharashtra by SK Solar Solutions.`}
        image={project.coverImage || undefined}
      />

      <section className="pt-32 pb-16 bg-navy-gradient text-white">
        <div className="container-custom">
          <h1 className="text-3xl lg:text-4xl font-display font-bold">{project.title}</h1>
          <div className="flex flex-wrap gap-6 mt-5 text-sm text-gray-300">
            <span className="flex items-center gap-2"><FaMapMarkerAlt className="text-solar-yellow" /> {project.district}, Maharashtra</span>
            <span className="flex items-center gap-2"><FaBolt className="text-solar-yellow" /> {project.capacityKW} kW</span>
            {project.installationDate && (
              <span className="flex items-center gap-2"><FaCalendarAlt className="text-solar-yellow" /> {new Date(project.installationDate).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-custom grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <img
              src={project.coverImage || Assets.projectPlaceholders[0]}
              alt={project.title}
              className="rounded-2xl w-full h-96 object-cover"
              onError={(e) => (e.target.style.background = "#0B2447")}
            />
            <p className="text-gray-600 leading-relaxed">{project.description || "Project details coming soon."}</p>

            {project.technologiesUsed?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.technologiesUsed.map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">{tech}</span>
                ))}
              </div>
            )}

            {project.customerFeedback?.text && (
              <div className="glass-card !bg-gray-50 p-6">
                <div className="flex gap-1 text-solar-yellow mb-2">
                  {Array.from({ length: project.customerFeedback.rating || 5 }).map((_, i) => <FaStar key={i} />)}
                </div>
                <p className="text-gray-600 italic">"{project.customerFeedback.text}"</p>
                {project.customerName && <p className="text-sm text-gray-400 mt-2">— {project.customerName}</p>}
              </div>
            )}
          </div>

          <div className="glass-card !bg-gray-50 p-6 h-fit">
            <h3 className="font-display font-semibold text-lg text-navy mb-4">Project Summary</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><strong className="text-navy">Category:</strong> {project.category}</li>
              <li><strong className="text-navy">Capacity:</strong> {project.capacityKW} kW</li>
              <li><strong className="text-navy">Location:</strong> {project.district}, Maharashtra</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProjectDetail;
