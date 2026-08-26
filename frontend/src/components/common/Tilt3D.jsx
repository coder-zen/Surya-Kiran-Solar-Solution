import { useRef } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Tips its child toward the cursor in real perspective, with a specular sheen
 * that tracks the pointer across the surface — the way light moves on a panel
 * as you change your angle to it.
 *
 * Wraps rather than replaces: the rotation lives on this element and the child
 * keeps whatever transform it already had. Cards here are framer-motion
 * elements animating their own `y` on scroll, and two owners writing `transform`
 * on one node would fight — nested, they compose.
 *
 * Written straight to style rather than through state. A pointermove handler
 * that called setState would re-render the card on every pixel of travel; this
 * costs one composited transform and no React work at all.
 */
const Tilt3D = ({
  children,
  className = "",
  max = 8, // degrees; past ~10 a card starts to look like it's falling over
  glare = true,
}) => {
  const wrapRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const onMove = (event) => {
    const el = wrapRef.current;
    if (!el || reduceMotion) return;

    // Coarse pointers have no hover position to speak of — a tap would snap the
    // card to one angle and leave it there.
    if (event.pointerType !== "mouse") return;

    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width; // 0 → 1
    const py = (event.clientY - rect.top) / rect.height;

    // Y follows horizontal travel, X inverts vertical: pushing the top edge away
    // is what reads as tilting rather than sliding.
    el.style.setProperty("--rx", `${(0.5 - py) * max * 2}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * max * 2}deg`);
    el.style.setProperty("--gx", `${px * 100}%`);
    el.style.setProperty("--gy", `${py * 100}%`);
    el.style.setProperty("--sheen", "1");
  };

  const reset = () => {
    const el = wrapRef.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--sheen", "0");
  };

  /*
   * Nothing at all on a touch device — not an attached handler that returns
   * early, which is what this did first. A finger dragging to scroll emits a
   * stream of pointermove events, and React dispatches every one of them
   * through its synthetic event system before the guard inside can decline.
   * Across eighteen cards on the homepage that is real main-thread work during
   * exactly the interaction that must stay smooth. A device with no hover has
   * nothing to gain from the effect anyway.
   */
  const canHover =
    typeof window !== "undefined" && window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;

  if (reduceMotion || !canHover) return <div className={className}>{children}</div>;

  return (
    <div
      ref={wrapRef}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ perspective: "900px" }}
      className={className}
    >
      <div
        className="relative h-full w-full transition-transform duration-200 ease-out
                   [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))]
                   [transform-style:preserve-3d]"
      >
        {children}

        {/* Sheen sits above the card but must not swallow its clicks. */}
        {glare && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 rounded-2xl opacity-[var(--sheen,0)]
                       transition-opacity duration-300"
            style={{
              background:
                "radial-gradient(340px circle at var(--gx,50%) var(--gy,50%), rgba(255,255,255,0.18), transparent 60%)",
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Tilt3D;
