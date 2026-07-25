import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

/**
 * Animates a number counting up from 0 to `end` once it scrolls into view.
 * Used for all "statistics" style counters across the site (Hero, Stats section).
 */
const CountUp = ({ end, duration = 2 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const stepTime = Math.max(Math.floor((duration * 1000) / end), 15);
    const increment = Math.ceil(end / ((duration * 1000) / stepTime));

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setValue(end);
        clearInterval(timer);
      } else {
        setValue(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return <span ref={ref}>{value.toLocaleString()}</span>;
};

export default CountUp;
