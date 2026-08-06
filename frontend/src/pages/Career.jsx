import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SeoHead from "../components/common/SeoHead";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaMapMarkerAlt, FaBriefcase } from "react-icons/fa";
import api from "../config/api";

const fetchCareers = async () => (await api.get("/careers")).data.data;

/**
 * Shown while /api/careers is loading or if it's unreachable, so the page is
 * never blank. Real postings (added at /admin/careers) replace this on next
 * fetch — same pattern as the Testimonials/Gallery fallback content.
 */
const FALLBACK_OPENINGS = [
  { _id: "fallback-1", title: "Solar Installation Engineer", department: "Engineering", location: "Pune", type: "Full-Time" },
  { _id: "fallback-2", title: "Sales Executive", department: "Sales", location: "Pune / Kolhapur", type: "Full-Time" },
  { _id: "fallback-3", title: "Site Supervisor", department: "Operations", location: "Solapur", type: "Full-Time" },
];

const Career = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const { data, isLoading } = useQuery({ queryKey: ["careers"], queryFn: fetchCareers, retry: false });

  const openings = !isLoading && data?.length > 0 ? data : FALLBACK_OPENINGS;
  const isFallback = openings === FALLBACK_OPENINGS;

  const onApply = async (formData) => {
    if (isFallback) {
      // These are placeholder listings, not real Career documents — there's
      // nothing to POST an application against yet.
      toast.error("This listing isn't open for applications yet — please check back soon.");
      return;
    }
    if (!formData.resume?.[0]) {
      toast.error("Please attach your resume (PDF, DOC or DOCX).");
      return;
    }

    const body = new FormData();
    body.append("fullName", formData.fullName);
    body.append("email", formData.email);
    body.append("phone", formData.phone);
    if (formData.coverLetter) body.append("coverLetter", formData.coverLetter);
    body.append("resume", formData.resume[0]);

    try {
      // Override the instance's default JSON content-type so the browser sets
      // the multipart boundary itself — see backend/routes/careerRoutes.js.
      await api.post(`/careers/${selectedJob}/apply`, body, { headers: { "Content-Type": undefined } });
      toast.success("Application submitted! We'll review it and get back to you.");
      reset();
      setSelectedJob(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <SeoHead title="Careers" path="/career" description="Join the SK Solar Solutions team — careers in solar installation, engineering and sales in Pune, Maharashtra." />
      <section className="pt-32 pb-12 bg-navy-gradient text-white text-center">
        <div className="container-custom">
          <h1 className="text-4xl lg:text-5xl font-display font-bold">Careers</h1>
          <p className="mt-4 text-gray-300 max-w-xl mx-auto">Join a team building Maharashtra's solar future.</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-custom grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {openings.map((job) => (
              <div key={job._id} className={`rounded-2xl border p-6 flex justify-between items-center ${selectedJob === job._id ? "border-solar-orange" : "border-gray-100"}`}>
                <div>
                  <h3 className="font-display font-semibold text-lg text-navy">{job.title}</h3>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><FaBriefcase /> {job.department}</span>
                    <span className="flex items-center gap-1"><FaMapMarkerAlt /> {job.location}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedJob(job._id)} className="btn-navy !py-2 !px-5 text-sm shrink-0">Apply</button>
              </div>
            ))}
            {!isLoading && openings.length === 0 && (
              <p className="text-gray-400 text-center py-12">No open positions right now — check back soon.</p>
            )}
          </div>

          <div className="glass-card !bg-gray-50 p-6 h-fit">
            <h3 className="font-display font-semibold text-lg text-navy mb-4">
              {selectedJob ? "Apply Now" : "Select a role to apply"}
            </h3>
            {selectedJob && (
              <form onSubmit={handleSubmit(onApply)} className="space-y-4">
                <div>
                  <input {...register("fullName", { required: "Required" })} placeholder="Full Name" className="input-field" />
                  {errors.fullName && <p className="text-sm text-red-500 mt-1">{errors.fullName.message}</p>}
                </div>
                <div>
                  <input {...register("email", { required: "Required" })} type="email" placeholder="Email" className="input-field" />
                  {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <input {...register("phone", { required: "Required" })} placeholder="Phone" className="input-field" />
                  {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
                </div>
                <textarea {...register("coverLetter")} rows={3} placeholder="Cover letter (optional)" className="input-field" />
                <div>
                  <input {...register("resume", { required: "Please attach your resume" })} type="file" accept=".pdf,.doc,.docx" className="input-field text-sm" />
                  {errors.resume && <p className="text-sm text-red-500 mt-1">{errors.resume.message}</p>}
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Career;
