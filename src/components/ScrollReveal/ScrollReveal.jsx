import { useEffect, useRef, useState } from "react";
import "./ScrollReveal.css";

/**
 * Wraps any content and fades/slides it in when it scrolls into view --
 * and back out when it scrolls out of view, in either direction. Unlike
 * a typical "reveal once" scroll animation, this re-triggers every time,
 * since that's what was asked for.
 *
 * Usage:
 *   <ScrollReveal><h2>Some heading</h2></ScrollReveal>
 *   <ScrollReveal delay={150}><p>Appears slightly after the above</p></ScrollReveal>
 */
export default function ScrollReveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      {
        threshold: 0.15, // fires once 15% of the element is visible
        // Small buffer on both edges -- the navbar itself now has an
        // opaque background (see Navbar.css), so it physically covers
        // scrolled-up content on its own. This margin is just for a
        // natural-feeling fade timing, not for avoiding overlap.
        rootMargin: "-40px 0px -40px 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`scroll-reveal${inView ? " scroll-reveal--visible" : ""} ${className}`}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}