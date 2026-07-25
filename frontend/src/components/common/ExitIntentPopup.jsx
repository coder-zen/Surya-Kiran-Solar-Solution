import { useState, useEffect } from "react";
import EnquiryModal from "./EnquiryModal";

/**
 * Fires the "Get Free Quote" modal once when the user's mouse leaves the
 * viewport toward the browser chrome (classic exit-intent pattern).
 * Uses sessionStorage so it only fires once per browser session, not on
 * every mouse movement near the top of the page.
 */
const ExitIntentPopup = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("exitIntentShown")) return;

    const handleMouseLeave = (e) => {
      if (e.clientY <= 0) {
        setShow(true);
        sessionStorage.setItem("exitIntentShown", "true");
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, []);

  return <EnquiryModal isOpen={show} onClose={() => setShow(false)} source="exit_intent" />;
};

export default ExitIntentPopup;
