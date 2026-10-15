import { useEffect, useRef, useState } from "react";
import "./Navbar.css";
import { toggleTheme } from "../../theme";

const LEFT = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
];
const RIGHT = [
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
];

export default function Navbar({ visible, activeSection }) {
  const [open, setOpen] = useState(false);
  // The last button you clicked, and how many times. It makes that button's
  // underline draw again each click, even if it was already the active one.
  const [click, setClick] = useState({ id: null, n: 0 });
  const pillRef = useRef(null);

  // While the menu is closed, its links can't be clicked or tabbed to.
  useEffect(() => {
    if (pillRef.current) pillRef.current.inert = !open;
  }, [open]);

  // The logo that flies in during the intro lives in HomeIntro, not here.
  // This flag lets it dissolve and reappear together with the menu.
  useEffect(() => {
    document.documentElement.dataset.navOpen = open ? "true" : "false";
  }, [open]);

  // Escape closes the menu
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const renderLink = ({ id, label }, k) => (
    <a
      key={id}
      href={`#${id}`}
      className={`navbar__link${activeSection === id ? " navbar__link--active" : ""}`}
      style={{ "--k": k }}
      onClick={() => setClick((c) => ({ id, n: c.id === id ? c.n + 1 : 1 }))}
    >
      {label}
      {/* The line under the button. Changing the key restarts its drawing. */}
      <span key={click.id === id ? click.n : 0} className="navbar__line" aria-hidden="true" />
    </a>
  );

  return (
    <div className={`navbar${visible ? " navbar--visible" : ""}${open ? " navbar--open" : ""}`}>
      {/* Light / dark switch, top right. The icon swaps with the theme. */}
      <button
        className="navbar__theme"
        onClick={(e) => toggleTheme(e.currentTarget)}
        aria-label="Switch between light and dark mode"
      >
        <svg className="navbar__sun" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
        <svg className="navbar__moon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      </button>

      {/* The clickable spot where the intro logo lands. The button itself is
          invisible: the logo you see is the one that flew in from HomeIntro.
          The id is how HomeIntro finds where to land. */}
      <button
        id="navbar-logo-slot"
        className="navbar__corner"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
      />

      <nav ref={pillRef} className="navbar__pill" aria-label="Main">
        <div className="navbar__side navbar__side--left">
          {/* k = how far from the logo (0 = closest), so the buttons nearest it appear first */}
          {LEFT.map((link, i) => renderLink(link, LEFT.length - 1 - i))}
        </div>

        <button className="navbar__mid" onClick={() => setOpen(false)} aria-label="Close menu">
          <svg
            width="44"
            height="44"
            viewBox="0 0 200 200"
            fill="none"
            stroke="#ffffff"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M 78 38 L 32 100 L 78 162" />
            <path d="M 122 38 L 168 100 L 122 162" />
            <text
              x="100"
              y="112"
              textAnchor="middle"
              stroke="none"
              fill="#dcf0ff"
              fontFamily="ui-monospace, Consolas, monospace"
              fontWeight="bold"
              fontSize="32"
            >
              JP
            </text>
          </svg>
        </button>

        <div className="navbar__side navbar__side--right">
          {RIGHT.map((link, i) => renderLink(link, i))}
        </div>
      </nav>
    </div>
  );
}