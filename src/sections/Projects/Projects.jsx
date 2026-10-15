import { useEffect, useRef, useState } from "react";
import ProjectCard from "../../components/ProjectCard/ProjectCard";
import ProjectExpandedPanel from "../../components/ProjectExpandedPanel/ProjectExpandedPanel";
import useInView from "../../hooks/useInView";
import "./Projects.css";

// AgriCOOL photos
import photo1 from "../../assets/photo1.png";
import photo2 from "../../assets/photo2.png";
import photo3 from "../../assets/photo3.png";
import photo4 from "../../assets/photo4.png";
import photo5 from "../../assets/photo5.png";
import photo6 from "../../assets/photo6.png";
import photo7 from "../../assets/photo7.png";
import photo8 from "../../assets/photo8.png";
import photo9 from "../../assets/photo9.png";
import photo10 from "../../assets/photo10.png";
import photo11 from "../../assets/photo11.png";

// Chatroom photos (photo12 is the front picture, 13-20 are the rest)
import photo12 from "../../assets/photo12.png";
import photo13 from "../../assets/photo13.png";
import photo14 from "../../assets/photo14.png";
import photo15 from "../../assets/photo15.png";
import photo16 from "../../assets/photo16.png";
import photo17 from "../../assets/photo17.png";
import photo18 from "../../assets/photo18.png";
import photo19 from "../../assets/photo19.png";
import photo20 from "../../assets/photo20.png";

// Blog Platform photos (photo21 is the front picture, 22-26 are the rest)
import photo21 from "../../assets/photo21.png";
import photo22 from "../../assets/photo22.png";
import photo23 from "../../assets/photo23.png";
import photo24 from "../../assets/photo24.png";
import photo25 from "../../assets/photo25.png";
import photo26 from "../../assets/photo26.png";

// Scholarship photos (Scholarship.png is the front picture, ss1-ss6 are the rest).
// The names must match the real files EXACTLY, including capital letters --
// Windows doesn't care, but the server you deploy to (Vercel) does.
// If any file is a .jpg instead of .png, change its extension here.
import scholarshipFront from "../../assets/Scholarship.png";
import ss1 from "../../assets/ss1.png";
import ss2 from "../../assets/ss2.png";
import ss3 from "../../assets/ss3.png";
import ss4 from "../../assets/ss4.png";
import ss5 from "../../assets/ss5.png";
import ss6 from "../../assets/ss6.png";

// Optional on any project: add `demoUrl` and/or `codeUrl` (full links) and a
// "Live demo" / "Source code" button appears in its expanded view. Without a
// link, no button is shown, so there are never dead buttons.
// A project can have an `images` array (first image = front picture on the
// card AND the default hero in the expanded view). Projects without
// `images` yet fall back to the emoji placeholder, so you can add real
// photos one project at a time.
const PROJECTS = [
  {
    name: "Chatroom REST API + UI",
    emoji: "💬",
    color: "#14b8a6",
    tags: ["React", "Tailwind CSS", "TypeScript", "MySQL"],
    images: [photo12, photo13, photo14, photo15, photo16, photo17, photo18, photo19, photo20],
    description:
      "A system that lets users send and receive messages in real time or near-real time. The REST API handles message creation, retrieval, users, and rooms, while the UI provides an interactive interface where users can join chatrooms, view conversations, and send messages easily.",
  },
  {
    name: "Blog Platform API + UI",
    emoji: "📝",
    color: "#10b981",
    tags: ["React", "Tailwind CSS", "TypeScript", "MySQL"],
    images: [photo21, photo22, photo23, photo24, photo25, photo26],
    description:
      "A simple blog platform where users can sign up, log in, write, edit, and share blog posts. It also lets users browse posts, read them, and leave comments.",
  },
  {
    name: "AgriCOOL — Arduino Misting System",
    emoji: "🌱",
    color: "#6ee7a0",
    tags: ["Arduino", "C++", "Sensors"],
    images: [photo1, photo2, photo3, photo4, photo5, photo6, photo7, photo8, photo9, photo10, photo11],
    description:
      "An Arduino-based automated misting system for agricultural use — reads temperature/humidity sensors and triggers misting cycles automatically to keep crops at optimal conditions.",
  },
  {
    name: "Scholarship Management System",
    emoji: "🎓",
    color: "#22c55e",
    // Placeholder tags and description -- replace both with the real
    // stack and the text from your project documentation.
    tags: ["PHP", "MySQL", "JavaScript"],
    images: [scholarshipFront, ss1, ss2, ss3, ss4, ss5, ss6],
    description:
      "A scholarship website where students can see the requirements and benefits, read the FAQ, contact the office, and sign up or sign in to join.",
  },
  {
    name: "Jayp's Snack Stack",
    emoji: "🍪",
    color: "#ffb84d",
    tags: ["React", "Vite", "Node.js", "CSS"],
    description:
      "A personal cookie-shop brand and e-commerce site, designed end-to-end in Figma then built in React — featuring a working cart, product catalog, and account flows.",
  },
];

// Filter chips above the gallery. A project shows under a chip if its
// `tags` contain that exact word. Edit this list freely.
const FILTERS = ["All", "React", "MySQL", "PHP", "Arduino"];

// Paste your GitHub profile link here, for example
// "https://github.com/your-username". While it's empty, the
// "Want to see more?" banner at the bottom stays hidden.
const GITHUB_URL = "";

// Which project is the wide "Featured" card (its position in PROJECTS, 0 = first).
// It only looks wide while the "All" chip is selected.
const FEATURED_INDEX = 0;

function Projects() {
  const cardRefs = useRef([]);
  const [filter, setFilter] = useState("All");
  const [shownFilter, setShownFilter] = useState(null);
  const [expanded, setExpanded] = useState(null); // { index, startRect, startHeroHeight } | null

  const [headRef, headIn] = useInView();
  const [galleryRef, galleryIn] = useInView({ threshold: 0.1 });
  const [moreRef, moreIn] = useInView();

  // Positions (in PROJECTS) of the projects the current chip lets through
  const visible = PROJECTS.map((_, i) => i).filter(
    (i) => filter === "All" || PROJECTS[i].tags.includes(filter)
  );

  // Changing the chip rebuilds the cards hidden, then two animation frames
  // later they're allowed to animate in. (Without the wait, the browser
  // would skip straight to the end and show no animation.)
  useEffect(() => {
    let second;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setShownFilter(filter));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [filter]);

  const revealed = galleryIn && shownFilter === filter;

  // Where a card (and its picture area) is on screen right now
  const getGeometry = (index) => {
    const el = cardRefs.current[index];
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const image = el.querySelector(".project-card__image");
    return { rect, heroHeight: image ? image.getBoundingClientRect().height : rect.width * 0.75 };
  };

  const openProject = (index) => {
    const geo = getGeometry(index);
    if (!geo) return;
    setExpanded({ index, startRect: geo.rect, startHeroHeight: geo.heroHeight });
  };

  // Previous / next project inside the expanded view (only among the visible ones)
  const step = (delta) => {
    const pos = visible.indexOf(expanded.index);
    const next = visible[(pos + delta + visible.length) % visible.length];
    setExpanded((prev) => ({ ...prev, index: next }));
  };

  return (
    <section id="projects" className="projects">
      <div ref={headRef} className={`projects__header${headIn ? " is-in" : ""}`}>
        <div>
          <p className="projects__eyebrow projects__rise" style={{ "--i": 0 }}>
            // Selected work
          </p>
          <h2 className="projects__heading">
            <span className="projects__heading-inner">Projects</span>
          </h2>
        </div>

        <div className="projects__filters projects__rise" style={{ "--i": 2 }}>
          {FILTERS.map((name) => (
            <button
              key={name}
              className={`projects__filter${filter === name ? " projects__filter--active" : ""}`}
              onClick={() => setFilter(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div ref={galleryRef} className="projects__gallery">
        {visible.map((i, n) => (
          <ProjectCard
            key={`${filter}-${PROJECTS[i].name}`}
            ref={(el) => (cardRefs.current[i] = el)}
            project={PROJECTS[i]}
            number={i + 1}
            order={n}
            featured={filter === "All" && i === FEATURED_INDEX}
            revealed={revealed}
            isExpanding={expanded?.index === i}
            onClick={() => openProject(i)}
          />
        ))}
      </div>

      {GITHUB_URL && (
        <div ref={moreRef} className={`projects__more${moreIn ? " is-in" : ""}`}>
          <div className="projects__more-card projects__rise" style={{ "--i": 0 }}>
            <p>Want to see more? My code lives on GitHub.</p>
            <a className="projects__btn" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              Visit my GitHub
            </a>
          </div>
        </div>
      )}

      {expanded && (
        <ProjectExpandedPanel
          project={PROJECTS[expanded.index]}
          startRect={expanded.startRect}
          startHeroHeight={expanded.startHeroHeight}
          position={{ current: visible.indexOf(expanded.index) + 1, total: visible.length }}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
          getCloseGeometry={() => getGeometry(expanded.index)}
          onClose={() => setExpanded(null)}
        />
      )}
    </section>
  );
}

export default Projects;