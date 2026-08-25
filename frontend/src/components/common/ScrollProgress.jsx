import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";

/**
 * Reading progress along the top of the page, drawn in the solar gradient so it
 * reads as charging rather than as a generic loading bar — the one piece of
 * chrome on the site that can carry the product's own metaphor without saying
 * anything.
 *
 * scaleX on a fixed element, so it never touches layout: the browser composites
 * it on the GPU and the rest of the page is untouched by it scrolling.
 */
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const reduceMotion = useReducedMotion();

  /*
   * Spring rather than the raw value. Wheel and trackpad scrolling arrives in
   * jumps, and a bar bound directly to it stutters; the spring gives it weight
   * without lagging far enough behind to feel disconnected.
   */
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  // A bar that whips across the screen is exactly what someone who asked for
  // less motion is trying to avoid.
  if (reduceMotion) return null;

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-solar-gradient"
    />
  );
};

export default ScrollProgress;
