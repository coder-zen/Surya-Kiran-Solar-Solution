import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { FaTrash, FaPlus, FaPen, FaTimes, FaExternalLinkAlt } from "react-icons/fa";
import api from "../../config/api";
import AdminSidebar from "../../components/admin/AdminSidebar";
import RichTextEditor from "../../components/admin/RichTextEditor";

// /blogs/all (not /blogs) so unpublished drafts are visible in the editor.
const fetchBlogs = async () => (await api.get("/blogs/all")).data.data;

const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  const { data } = await api.post("/upload", formData, { headers: { "Content-Type": undefined } });
  return data.url;
};

const EMPTY_POST = {
  title: "",
  category: "",
  tags: "",
  coverImage: "",
  excerpt: "",
  contentMarkdown: "",
  isPublished: false,
  seo: { metaTitle: "", metaDescription: "" },
};

const BlogForm = ({ initial, onCancel, onSaved }) => {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();
  const isEdit = Boolean(initial?._id);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      ...EMPTY_POST,
      ...initial,
      // Blog.tags is [String]; edited here as one comma-separated field.
      tags: (initial?.tags || []).join(", "),
      seo: { ...EMPTY_POST.seo, ...(initial?.seo || {}) },
    },
  });

  const coverImage = watch("coverImage");

  const saveMutation = useMutation({
    mutationFn: (payload) => (isEdit ? api.put(`/blogs/${initial._id}`, payload) : api.post("/blogs", payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blogs"] }); // public /blog listing
      toast.success(isEdit ? "Post updated" : "Post created");
      onSaved();
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Could not save post"),
  });

  const onSubmit = (formData) =>
    saveMutation.mutate({
      ...formData,
      tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
    });

  const handleCoverUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      setValue("coverImage", await uploadImage(file));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-6 shadow-sm mb-8 grid sm:grid-cols-2 gap-5">
      <div className="sm:col-span-2 flex justify-between items-center">
        <h2 className="font-display font-semibold text-navy">{isEdit ? `Edit — ${initial.title}` : "New Post"}</h2>
        <button type="button" onClick={onCancel} className="text-sm text-gray-400 hover:text-navy"><FaTimes /></button>
      </div>

      <div className="sm:col-span-2">
        <label className="section-label">Title</label>
        <input {...register("title", { required: "Required" })} className="input-field mt-1" />
        {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label className="section-label">Category</label>
        <input {...register("category")} className="input-field mt-1" placeholder="e.g. Subsidy Updates" />
      </div>
      <div>
        <label className="section-label">Tags (comma separated)</label>
        <input {...register("tags")} className="input-field mt-1" placeholder="solar, msedcl, rooftop" />
      </div>

      <div className="sm:col-span-2">
        <label className="section-label">Cover Image</label>
        <div className="flex items-center gap-4 mt-1">
          {coverImage && <img src={coverImage} alt="" className="h-20 w-32 rounded-lg object-cover bg-gray-100 shrink-0" />}
          <input
            type="file" accept="image/*" disabled={uploading}
            onChange={(e) => { handleCoverUpload(e.target.files?.[0]); e.target.value = ""; }}
            className="input-field"
          />
        </div>
        {uploading && <p className="text-xs text-gray-400 mt-1">Uploading…</p>}
      </div>

      <div className="sm:col-span-2">
        <label className="section-label">Excerpt (shown on the blog listing)</label>
        <textarea {...register("excerpt")} rows={2} className="input-field mt-1" placeholder="One or two sentence summary…" />
      </div>

      <div className="sm:col-span-2">
        <label className="section-label">Content</label>
        <Controller
          name="contentMarkdown"
          control={control}
          rules={{ required: "Content is required" }}
          render={({ field }) => (
            <RichTextEditor value={field.value} onChange={field.onChange} height={420} placeholder="Write your post…" />
          )}
        />
        {errors.contentMarkdown && <p className="text-sm text-red-500 mt-1">{errors.contentMarkdown.message}</p>}
      </div>

      <div>
        <label className="section-label">SEO Meta Title</label>
        <input {...register("seo.metaTitle")} className="input-field mt-1" />
      </div>
      <div>
        <label className="section-label">SEO Meta Description</label>
        <input {...register("seo.metaDescription")} className="input-field mt-1" />
      </div>

      <label className="flex items-center gap-2 text-sm text-navy sm:col-span-2">
        <input type="checkbox" {...register("isPublished")} className="h-4 w-4 accent-solar-orange" />
        Published — unchecked posts stay as drafts and never appear on the public blog
      </label>

      <div className="sm:col-span-2 flex gap-3">
        <button type="submit" disabled={saveMutation.isPending} className="btn-primary">
          {saveMutation.isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Post"}
        </button>
        <button type="button" onClick={onCancel} className="btn-navy !bg-gray-100 !text-gray-600">Cancel</button>
      </div>
    </form>
  );
};

/** Confirmation dialog — deleting a post with built-up SEO value shouldn't be one click. */
const DeleteDialog = ({ post, onClose, onConfirm, isDeleting }) => {
  const [typed, setTyped] = useState("");
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-dark/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-premium" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display font-bold text-xl text-navy mb-2">Delete this post?</h3>
        <p className="text-sm text-gray-500 mb-4">
          "{post.title}" will be permanently removed. Any search ranking or inbound links it has built
          up will be lost. Type <span className="font-semibold text-navy">DELETE</span> to confirm.
        </p>
        <input value={typed} onChange={(e) => setTyped(e.target.value)} className="input-field" placeholder="DELETE" />
        <div className="flex gap-3 mt-5">
          <button
            onClick={onConfirm}
            disabled={typed !== "DELETE" || isDeleting}
            className="btn-primary flex-1 !bg-none !bg-red-500 !text-white disabled:opacity-40"
          >
            {isDeleting ? "Deleting..." : "Delete Permanently"}
          </button>
          <button onClick={onClose} className="btn-navy !bg-gray-100 !text-gray-600">Cancel</button>
        </div>
      </div>
    </div>
  );
};

const AdminBlog = () => {
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({ queryKey: ["admin-blogs"], queryFn: fetchBlogs });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/blogs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast.success("Post deleted");
      setDeleting(null);
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Could not delete post"),
  });

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-display font-bold text-2xl text-navy">Blog</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {posts?.filter((p) => p.isPublished).length ?? 0} published · {posts?.filter((p) => !p.isPublished).length ?? 0} drafts
            </p>
          </div>
          {!editing && (
            <button onClick={() => setEditing({})} className="btn-primary !py-2.5 !px-5 text-sm">
              <FaPlus /> New Post
            </button>
          )}
        </div>

        {editing && (
          <BlogForm
            initial={editing._id ? editing : null}
            onCancel={() => setEditing(null)}
            onSaved={() => setEditing(null)}
          />
        )}

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {isLoading && <p className="p-6 text-gray-400 text-sm">Loading posts…</p>}
          {!isLoading && posts?.length === 0 && (
            <p className="p-6 text-gray-400 text-sm">No posts yet — write the first one above.</p>
          )}
          {posts?.map((post) => (
            <div key={post._id} className="flex items-center justify-between gap-4 p-5 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-4 min-w-0">
                {post.coverImage
                  ? <img src={post.coverImage} alt="" className="h-12 w-16 rounded-lg object-cover bg-gray-100 shrink-0" />
                  : <div className="h-12 w-16 rounded-lg bg-gray-100 shrink-0" />}
                <div className="min-w-0">
                  <p className="font-semibold text-navy truncate">{post.title}</p>
                  <p className="text-xs text-gray-400">
                    <span className={`inline-block px-2 py-0.5 rounded-full mr-2 ${post.isPublished ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                      {post.isPublished ? "Published" : "Draft"}
                    </span>
                    {post.category && <span className="mr-2">{post.category}</span>}
                    {post.publishedAt && new Date(post.publishedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 shrink-0">
                {post.isPublished && (
                  <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" aria-label="View on site" className="text-gray-400 hover:text-navy">
                    <FaExternalLinkAlt />
                  </a>
                )}
                <button onClick={() => setEditing(post)} aria-label="Edit post" className="text-gray-400 hover:text-solar-orange"><FaPen /></button>
                <button onClick={() => setDeleting(post)} aria-label="Delete post" className="text-gray-400 hover:text-red-500"><FaTrash /></button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {deleting && (
        <DeleteDialog
          post={deleting}
          isDeleting={deleteMutation.isPending}
          onClose={() => setDeleting(null)}
          onConfirm={() => deleteMutation.mutate(deleting._id)}
        />
      )}
    </div>
  );
};

export default AdminBlog;
