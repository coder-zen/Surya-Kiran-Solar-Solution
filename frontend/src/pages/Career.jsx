import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaMapMarkerAlt, FaBriefcase } from "react-icons/fa";

const openings = [
  { id: "1", title: "Solar Installation Engineer", department: "Engineering", location: "Pune", type: "Full-Time" },
  { id: "2", title: "Sales Executive", department: "Sales", location: "Pune / Kolhapur", type: "Full-Time" },
  { id: "3", title: "Site Supervisor", department: "Operations", location: "Solapur", type: "Full-Time" },
];

const Career = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const onApply = async () => {
    // TODO: wire to POST /api/careers/:id/apply with multipart/form-data for resume upload
    toast.success("Application submitted! We'll review it and get back to you.");
    reset();
    setSelectedJob(null);
  };

  return (
    <>
      <Helmet><title>Careers | Surya Kiran Solar Solution</title></Helmet>
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
              <div key={job.id} className={`rounded-2xl border p-6 flex justify-between items-center ${selectedJob === job.id ? "border-solar-orange" : "border-gray-100"}`}>
                <div>
                  <h3 className="font-display font-semibold text-lg text-navy">{job.title}</h3>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><FaBriefcase /> {job.department}</span>
                    <span className="flex items-center gap-1"><FaMapMarkerAlt /> {job.location}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedJob(job.id)} className="btn-navy !py-2 !px-5 text-sm shrink-0">Apply</button>
              </div>
            ))}
          </div>

          <div className="glass-card !bg-gray-50 p-6 h-fit">
            <h3 className="font-display font-semibold text-lg text-navy mb-4">
              {selectedJob ? "Apply Now" : "Select a role to apply"}
            </h3>
            {selectedJob && (
              <form onSubmit={handleSubmit(onApply)} className="space-y-4">
                <input {...register("fullName", { required: true })} placeholder="Full Name" className="w-full rounded-lg border border-gray-200 px-4 py-3" />
                <input {...register("email", { required: true })} type="email" placeholder="Email" className="w-full rounded-lg border border-gray-200 px-4 py-3" />
                <input {...register("phone", { required: true })} placeholder="Phone" className="w-full rounded-lg border border-gray-200 px-4 py-3" />
                <input {...register("resume")} type="file" accept=".pdf,.doc,.docx" className="w-full text-sm" />
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full">Submit Application</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Career;
