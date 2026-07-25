import { Helmet } from "react-helmet-async";

const LegalNotice = () => (
  <>
    <Helmet><title>Privacy Policy | Surya Kiran Solar Solution</title></Helmet>
    <section className="pt-32 pb-20 bg-white">
      <div className="container-custom max-w-3xl prose">
        <h1 className="section-heading !text-3xl">Privacy Policy</h1>
        <p className="text-gray-500 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        <p className="text-gray-600 mt-6 leading-relaxed">
          {/* TODO: Replace with your finalized, legally-reviewed privacy policy text. */}
          Surya Kiran Solar Solution ("we", "us") respects your privacy. This placeholder policy
          outlines how we collect, use, and protect information submitted through our enquiry
          forms, calculators, and career applications. Data collected (name, phone, email, and
          project details) is used solely to respond to your enquiry and is never sold to third
          parties. Replace this section with counsel-reviewed policy text before going live.
        </p>
      </div>
    </section>
  </>
);

export default LegalNotice;
