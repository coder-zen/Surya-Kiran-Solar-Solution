import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../config/api";
import SeoHead from "../components/common/SeoHead";

const fetchBlog = async (slug) => {
  const { data } = await api.get(`/blogs/${slug}`);
  return data.data;
};

const BlogDetail = () => {
  const { slug } = useParams();
  const { data: blog, isLoading, isError } = useQuery({ queryKey: ["blog", slug], queryFn: () => fetchBlog(slug), retry: false });

  if (isLoading) return <div className="pt-40 pb-20 text-center text-gray-400">Loading article...</div>;

  if (isError || !blog) {
    return (
      <div className="pt-40 pb-20 text-center">
        <p className="text-gray-500">Article not found.</p>
        <Link to="/blog" className="btn-navy inline-flex mt-6">Back to Blog</Link>
      </div>
    );
  }

  return (
    <>
      <SeoHead
        title={`${blog.title} | Blog`}
        path={`/blog/${slug}`}
        description={blog.excerpt || blog.contentMarkdown?.slice(0, 155)}
        image={blog.coverImage || undefined}
        type="article"
      />
      <article className="pt-32 pb-20 bg-white">
        <div className="container-custom max-w-3xl">
          <span className="text-xs uppercase text-solar-orange font-semibold">{blog.category}</span>
          <h1 className="section-heading mt-2">{blog.title}</h1>
          <p className="text-gray-400 text-sm mt-3">By {blog.author?.name || "SK Solar Team"}</p>
          {blog.coverImage && <img src={blog.coverImage} alt={blog.title} className="w-full h-80 object-cover rounded-2xl my-8" />}
          <div className="prose max-w-none text-gray-600 leading-relaxed whitespace-pre-line">{blog.contentMarkdown}</div>
        </div>
      </article>
    </>
  );
};

export default BlogDetail;
