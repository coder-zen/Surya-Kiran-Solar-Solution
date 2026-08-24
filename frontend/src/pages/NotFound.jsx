import { Link } from "react-router-dom";
import SeoHead from "../components/common/SeoHead";
import { FaSolarPanel } from "react-icons/fa";

const NotFound = () => (
  <>
    <SeoHead title="Page Not Found" path="/404" />
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gray-50 dark:bg-navy-dark">
      {/* TODO: replace icon with a branded 404 illustration — Assets.notFoundIllustration */}
      <FaSolarPanel className="text-6xl text-solar-orange mb-6" />
      <h1 className="text-6xl font-display font-bold text-navy dark:text-white">404</h1>
      <p className="text-gray-500 dark:text-gray-300 mt-3 max-w-md">
        Looks like this page took an unplanned trip off the grid. Let's get you back on track.
      </p>
      <Link to="/" className="btn-primary mt-8">Back to Home</Link>
    </section>
  </>
);

export default NotFound;
