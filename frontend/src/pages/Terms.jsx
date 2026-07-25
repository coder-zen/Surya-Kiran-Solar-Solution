import { Helmet } from "react-helmet-async";

const Terms = () => (
  <>
    <Helmet><title>Terms & Conditions | Surya Kiran Solar Solution</title></Helmet>
    <section className="pt-32 pb-20 bg-white">
      <div className="container-custom max-w-3xl prose">
        <h1 className="section-heading !text-3xl">Terms &amp; Conditions</h1>
        <p className="text-gray-500 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        <p className="text-gray-600 mt-6 leading-relaxed">
          {/* TODO: Replace with your finalized, legally-reviewed terms of service text. */}
          These placeholder Terms &amp; Conditions govern use of the Surya Kiran Solar Solution
          website. By submitting an enquiry or using our calculators, you agree that estimates
          provided are indicative only and not a binding offer. Replace this section with
          counsel-reviewed terms before going live.
        </p>
      </div>
    </section>
  </>
);

export default Terms;
