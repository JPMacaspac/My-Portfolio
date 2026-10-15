import { useEffect, useState } from "react";
import useInView from "../../hooks/useInView";
import "./SkillsCarousel.css";

const AUTOPLAY_MS = 4000; // how long each skill stays centered before moving on
const MAX_VISIBLE_OFFSET = 2; // shows 5 cards at once: active + 2 on each side

// `description` and `usedIn` fill the panel under the carousel.
// These are drafts, so edit them to match your real work.
const SKILLS = [
  {
    name: "HTML",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg",
    description: "The structure under every page I build.",
    usedIn: ["Portfolio", "Snack Stack"],
  },
  {
    name: "CSS",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg",
    description:
      "Layout, animation and the look of everything, with Tailwind when a project calls for it.",
    usedIn: ["Portfolio", "Chatroom", "Blog Platform", "Snack Stack"],
  },
  {
    name: "React",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",
    description: "My main tool for building interfaces that stay fast and organized.",
    usedIn: ["Portfolio", "Chatroom", "Blog Platform", "Snack Stack"],
  },
  {
    name: "JavaScript",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg",
    description: "The logic behind the interaction: state, animation and data.",
    usedIn: ["Portfolio", "Snack Stack"],
  },
  {
    name: "Figma",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg",
    description: "Where every project starts: wireframes, design and clickable prototypes.",
    usedIn: ["Portfolio", "Snack Stack"],
  },
  {
    name: "GitHub",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg",
    needsInvert: true,
    description: "Version control for my work, and where my projects live.",
    usedIn: ["Portfolio"],
  },
];

function getOffset(index, activeIndex, total) {
  let offset = index - activeIndex;
  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;
  return offset;
}

function getCardStyle(offset) {
  const abs = Math.abs(offset);

  const scale = abs === 0 ? 1 : abs === 1 ? 0.82 : abs === 2 ? 0.66 : 0.55;
  const opacity = abs === 0 ? 1 : abs === 1 ? 0.85 : abs === 2 ? 0.5 : 0.22;
  const translateX = offset * 190;
  const rotateY = offset * -10; // subtle 3D turn, adds depth without being gimmicky
  const zIndex = 100 - abs;

  return {
    transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
    opacity: abs > MAX_VISIBLE_OFFSET ? 0 : opacity,
    zIndex,
    pointerEvents: abs > MAX_VISIBLE_OFFSET ? "none" : "auto",
  };
}

export default function SkillsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  // inView drives the entrance animation and also decides when to auto-rotate
  const [rootRef, inView] = useInView();
  const total = SKILLS.length;
  const active = SKILLS[activeIndex];

  const goTo = (index) => {
    setActiveIndex(((index % total) + total) % total);
  };

  const goNext = () => goTo(activeIndex + 1);
  const goPrev = () => goTo(activeIndex - 1);

  // Auto-rotate. The timer restarts every time the active skill changes
  // (including when you click), so a manual click always gets a full pause.
  // It stops while your mouse is on the carousel or it's off screen.
  useEffect(() => {
    if (hovered || !inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setTimeout(() => {
      setActiveIndex((i) => (i + 1) % total);
    }, AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [activeIndex, hovered, inView, total]);

  return (
    <div
      ref={rootRef}
      className={`skills-carousel${inView ? " is-in" : ""}`}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <div className="skills-carousel__stage">
        {SKILLS.map((skill, i) => {
          const offset = getOffset(i, activeIndex, total);
          const isActive = offset === 0;
          return (
            <div
              key={skill.name}
              className={`skills-carousel__card${isActive ? " skills-carousel__card--active" : ""}`}
              style={getCardStyle(offset)}
              onClick={() => goTo(i)}
            >
              <img
                src={skill.icon}
                alt={skill.name}
                className={`skills-carousel__icon${skill.needsInvert ? " skills-carousel__icon--invert" : ""}`}
                draggable="false"
              />
              <div className="skills-carousel__label">{skill.name}</div>
            </div>
          );
        })}
      </div>

      <div className="skills-carousel__controls">
        <button
          className="skills-carousel__nav-btn"
          onClick={goPrev}
          aria-label="Previous skill"
        >
          &#8249;
        </button>

        <div className="skills-carousel__dots">
          {SKILLS.map((skill, i) => (
            <button
              key={skill.name}
              className={`skills-carousel__dot${i === activeIndex ? " skills-carousel__dot--active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Go to ${skill.name}`}
            />
          ))}
        </div>

        <button
          className="skills-carousel__nav-btn"
          onClick={goNext}
          aria-label="Next skill"
        >
          &#8250;
        </button>
      </div>

      <div className="skills-carousel__detail" aria-live="polite">
        {/* key={active.name} restarts the fade each time the skill changes */}
        <div key={active.name} className="skills-carousel__detail-inner">
          <h3>{active.name}</h3>
          <p>{active.description}</p>
          <div className="skills-carousel__used">
            <small>Used in</small>
            {active.usedIn.map((project) => (
              <span key={project} className="skills-carousel__chip">
                {project}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}