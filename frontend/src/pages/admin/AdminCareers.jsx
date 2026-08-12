import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { FaTrash, FaPlus, FaFileAlt, FaEnvelope, FaPhoneAlt } from "react-icons/fa";
import api from "../../config/api";
import AdminSidebar from "../../components/admin/AdminSidebar";

const JOB_TYPES = ["Full-Time", "Part-Time", "Internship", "Contract"];
const APPLICATION_STAGES = ["New", "Shortlisted", "Interviewing", "Rejected", "Hired"];
const STAGE_STYLES = {
  New: "bg-blue-50 text-blue-700",
  Shortlisted: "bg-amber-50 text-amber-700",
  Interviewing: "bg-violet-50 text-violet-700",
  Hired: "bg-green-50 text-green-700",
  Rejected: "bg-red-50 text-red-700",
};

const fetchAllJobs = async () => (await api.get("/careers/admin/all")).data.data;
const fetchApplications = async (jobId) =>
  (await api.get("/careers/admin/applications", { params: jobId ? { job: jobId } : {} })).data.data;

const EMPTY_JOB = { title: "", department: "", location: "", type: "Full-Time", experience: "", description: "" };

const JobForm = ({ onDone }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
    defaultValues: EMPTY_JOB,
  });
  const responsibilities = useFieldArray({ control, name: "responsibilities" });
  const requirements = useFieldArray({ control, name: "requirements" });

  const saveMutation = useMutation({
    mutationFn: (payload) => api.post("/careers", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-careers"] });
      queryClient.invalidateQueries({ queryKey: ["careers"] }); // public /career page
      toast.success("Job posting created");
      onDone();
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Could not create job posting"),
  });

  const onSubmit = (formData) =>
    saveMutation.mutate({
      ...formData,
      responsibilities: (formData.responsibilities || []).map((r) => r.value).filter(Boolean),
      requirements: (formData.requirements || []).map((r) => r.value).filter(Boolean),
    });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-6 shadow-sm mb-8 grid sm:grid-cols-2 gap-4">
      <div>
        <label className="section-label">Job Title</label>
        <input {...register("title", { required: "Required" })} className="input-field mt-1" />
        {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <label className="section-label">Department</label>
        <input {...register("department")} className="input-field mt-1" placeholder="e.g. Engineering" />
      </div>
      <div>
        <label className="section-label">Location</label>
        <input {...register("location")} className="input-field mt-1" placeholder="e.g. Pune" />
      </div>
      <div>
        <label className="section-label">Type</label>
        <select {...register("type")} className="input-field mt-1">
          {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="section-label">Experience</label>
        <input {...register("experience")} className="input-field mt-1" placeholder="e.g. 1-3 years" />
      </div>
      <div className="sm:col-span-2">
        <label className="section-label">Description</label>
        <textarea {...register("description")} rows={3} className="input-field mt-1" />
      </div>

      <div className="sm:col-span-2">
        <div className="flex justify-between items-center">
          <label className="section-label">Responsibilities</label>
          <button type="button" onClick={() => responsibilities.append({ value: "" })} className="text-sm text-solar-orange font-semibold">+ Add</button>
        </div>
        <div className="space-y-2 mt-2">
          {responsibilities.fields.map((field, i) => (
            <div key={field.id} className="flex gap-2">
              <input {...register(`responsibilities.${i}.value`)} className="input-field flex-1" />
              <button type="button" onClick={() => responsibilities.remove(i)} className="text-gray-300 hover:text-red-500 shrink-0"><FaTrash /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="sm:col-span-2">
        <div className="flex justify-between items-center">
          <label className="section-label">Requirements</label>
          <button type="button" onClick={() => requirements.append({ value: "" })} className="text-sm text-solar-orange font-semibold">+ Add</button>
        </div>
        <div className="space-y-2 mt-2">
          {requirements.fields.map((field, i) => (
            <div key={field.id} className="flex gap-2">
              <input {...register(`requirements.${i}.value`)} className="input-field flex-1" />
              <button type="button" onClick={() => requirements.remove(i)} className="text-gray-300 hover:text-red-500 shrink-0"><FaTrash /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="sm:col-span-2 flex gap-3">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? "Saving..." : "Save Job Posting"}
        </button>
        <button type="button" onClick={onDone} className="btn-navy !bg-gray-100 !text-gray-600">Cancel</button>
      </div>
    </form>
  );
};

const JobsTab = () => {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();
  const { data: jobs, isLoading } = useQuery({ queryKey: ["admin-careers"], queryFn: fetchAllJobs });

  const toggleOpenMutation = useMutation({
    mutationFn: ({ id, isOpen }) => api.put(`/careers/${id}`, { isOpen }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-careers"] });
      queryClient.invalidateQueries({ queryKey: ["careers"] });
      toast.success("Updated");
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Could not update"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/careers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-careers"] });
      queryClient.invalidateQueries({ queryKey: ["careers"] });
      toast.success("Job posting deleted");
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Could not delete"),
  });

  return (
    <>
      <div className="flex justify-end mb-6">
        <button onClick={() => setShowForm((p) => !p)} className="btn-primary !py-2.5 !px-5 text-sm">
          <FaPlus /> {showForm ? "Cancel" : "Add Job Posting"}
        </button>
      </div>

      {showForm && <JobForm onDone={() => setShowForm(false)} />}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {isLoading && <p className="p-6 text-gray-400 text-sm">Loading jobs…</p>}
        {!isLoading && jobs?.length === 0 && (
          <p className="p-6 text-gray-400 text-sm">
            No job postings yet — the public Careers page shows "No open positions right now" until
            the first one is added here.
          </p>
        )}
        {jobs?.map((job) => (
          <div key={job._id} className="flex items-center justify-between gap-4 p-5 border-b border-gray-100 last:border-0">
            <div className="min-w-0">
              <p className="font-semibold text-navy flex items-center gap-2">
                {job.title}
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${job.isOpen ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {job.isOpen ? "Open" : "Closed"}
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-1">{job.department} · {job.location} · {job.type}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => toggleOpenMutation.mutate({ id: job._id, isOpen: !job.isOpen })}
                className="text-sm text-solar-orange font-semibold whitespace-nowrap"
              >
                {job.isOpen ? "Close posting" : "Reopen"}
              </button>
              <button onClick={() => deleteMutation.mutate(job._id)} aria-label="Delete job posting" className="text-gray-400 hover:text-red-500">
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

const ApplicationsTab = () => {
  const [jobFilter, setJobFilter] = useState("");
  const queryClient = useQueryClient();
  const { data: jobs } = useQuery({ queryKey: ["admin-careers"], queryFn: fetchAllJobs });
  const { data: applications, isLoading } = useQuery({
    queryKey: ["admin-career-applications", jobFilter],
    queryFn: () => fetchApplications(jobFilter),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.put(`/careers/admin/applications/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-career-applications"] });
      toast.success("Status updated");
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Could not update status"),
  });

  return (
    <>
      <div className="flex justify-end mb-6">
        <select value={jobFilter} onChange={(e) => setJobFilter(e.target.value)} className="input-field !w-auto">
          <option value="">All jobs</option>
          {jobs?.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {isLoading && <p className="text-gray-400 text-sm">Loading applications…</p>}
        {!isLoading && applications?.length === 0 && (
          <p className="text-gray-400 text-sm bg-white rounded-2xl p-6 shadow-sm">No applications yet.</p>
        )}
        {applications?.map((app) => (
          <div key={app._id} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex flex-wrap justify-between items-start gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-navy">{app.fullName}</p>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STAGE_STYLES[app.status] || "bg-gray-100 text-gray-600"}`}>
                    {app.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Applied for <span className="font-medium text-gray-600">{app.job?.title || "Unknown role"}</span>
                  {" · "}{new Date(app.createdAt).toLocaleDateString()}
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                  <a href={`mailto:${app.email}`} className="flex items-center gap-1.5 text-navy min-w-0">
                    <FaEnvelope className="text-solar-orange text-xs shrink-0" /> <span className="truncate">{app.email}</span>
                  </a>
                  <a href={`tel:${app.phone}`} className="flex items-center gap-1.5 text-navy">
                    <FaPhoneAlt className="text-solar-orange text-xs" /> {app.phone}
                  </a>
                  <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-solar-orange font-semibold">
                    <FaFileAlt className="text-xs" /> View Resume
                  </a>
                </div>
                {app.coverLetter && <p className="text-sm text-gray-600 mt-2">{app.coverLetter}</p>}
              </div>
              <select
                value={app.status}
                onChange={(e) => statusMutation.mutate({ id: app._id, status: e.target.value })}
                className="input-field !w-auto !py-2 text-sm shrink-0"
              >
                {APPLICATION_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

/**
 * Two tabs: manage job postings (shown on the public /career page), and
 * review applications submitted against them. Saving a job posting here
 * appears on the public page on next fetch — same "no publish step" pattern
 * as Projects/Gallery/Testimonials.
 */
const AdminCareers = () => {
  const [tab, setTab] = useState("jobs");

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <h1 className="font-display font-bold text-2xl text-navy mb-1">Careers</h1>
        <p className="text-sm text-gray-500 mb-6">Manage job postings and review applications.</p>

        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setTab("jobs")}
            className={`option-btn ${tab === "jobs" ? "bg-navy text-white" : "bg-white text-gray-600 shadow-sm"}`}
          >
            Job Postings
          </button>
          <button
            onClick={() => setTab("applications")}
            className={`option-btn ${tab === "applications" ? "bg-navy text-white" : "bg-white text-gray-600 shadow-sm"}`}
          >
            Applications
          </button>
        </div>

        {tab === "jobs" ? <JobsTab /> : <ApplicationsTab />}
      </main>
    </div>
  );
};

export default AdminCareers;
