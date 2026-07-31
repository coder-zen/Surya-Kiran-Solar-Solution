import SeoHead from "../components/common/SeoHead";

const LegalNotice = () => (
  <>
    <SeoHead title="Privacy Policy" path="/privacy-policy" />
    <section className="pt-32 pb-20 bg-white">
      <div className="container-custom max-w-3xl prose">
        <h1 className="section-heading !text-3xl">Privacy Policy</h1>
        <p className="text-gray-500 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        <p className="text-gray-600 mt-6 leading-relaxed">
          SK Solar Solutions ("we", "us") respects your privacy. This policy outlines how we
          collect, use, and protect information submitted through our enquiry forms, calculators,
          and career applications. Data collected (name, phone, email, and project details) is
          used solely to respond to your enquiry, prepare your solar quotation, and coordinate
          installation and MSEDCL net-metering paperwork on your behalf. It is never sold to
          third parties.
        </p>
      </div>
    </section>
  </>
);

export default LegalNotice;
