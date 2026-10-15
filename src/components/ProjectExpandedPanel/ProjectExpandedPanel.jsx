import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./ProjectExpandedPanel.css";

// Must match the CSS transition duration on .project-expand-panel
// (top/left/width/height) -- kept as one constant so the JS timing and
// the CSS timing can never drift apart.
const RESIZE_DURATION_MS = 500;

function ExpandIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 3h6v6" />
      <path d="M9 21H3v-6" />
      <path d="M21 3l-7 7" />
      <path d="M3 21l7-7" />
    </svg>
  );
}

function MinimizeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 14h6v6" />
      <path d="M20 10h-6V4" />
      <path d="M14 10l7-7" />
      <path d="M3 21l7-7" />
    </svg>
  );
}

function ChevronIcon({ direction }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={direction === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
    </svg>
  );
}

/**
 * Renders (via a portal, so it's not clipped by any parent's overflow)
 * a panel that starts EXACTLY where the clicked card was on screen, then
 * animates to a centered, larger size -- the same FLIP technique used
 * for the navbar logo.
 *
 * Props from Projects.jsx:
 *  - startRect / startHeroHeight: where the clicked card (and its picture
 *    area) was on screen when it was clicked
 *  - position: { current, total } for the "Project 2 of 5" label
 *  - onPrev / onNext: switch to the neighboring project without closing
 *  - getCloseGeometry: measures the CURRENT project's card, so closing
 *    shrinks back to the right card even after you've switched projects
 */
export default function ProjectExpandedPanel({
  project,
  startRect,
  startHeroHeight,
  position,
  onPrev,
  onNext,
  getCloseGeometry,
  onClose,
}) {
  const panelRef = useRef(null);
  const heroRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  // Hover / selection / full-photo state is remembered together with the
  // project's name. When you switch to another project the name no longer
  // matches, so everything starts fresh for it (no reset code needed).
  const [hover, setHover] = useState(null);
  const [selected, setSelected] = useState({ name: project.name, index: 0 });
  const [lightboxFor, setLightboxFor] = useState(null);

  const hasImages = Boolean(project.images?.length);
  const total = project.images?.length ?? 0;
  // With real photos: one thumbnail per photo. Without: 3 emoji placeholders.
  const thumbs = hasImages ? project.images : [0, 1, 2];
  const tint = (n) => `${project.color}${(0x15 + n * 8).toString(16)}`;

  const hoverIndex = hover && hover.name === project.name ? hover.index : null;
  const selectedIndex = selected.name === project.name ? selected.index : 0;
  const lightboxOpen = lightboxFor === project.name;
  const setHoverIndex = (index) => setHover(index === null ? null : { name: project.name, index });
  const setSelectedIndex = (index) => setSelected({ name: project.name, index });
  const setLightboxOpen = (open) => setLightboxFor(open ? project.name : null);

  useEffect(() => {
    const panel = panelRef.current;
    const hero = heroRef.current;
    if (!panel || !hero) return;

    // Start state: panel sits exactly on top of the clicked card, and the
    // hero is the same height as the card's picture area, so the
    // card -> panel swap is invisible.
    panel.style.position = "fixed";
    panel.style.top = `${startRect.top}px`;
    panel.style.left = `${startRect.left}px`;
    panel.style.width = `${startRect.width}px`;
    panel.style.height = `${startRect.height}px`;
    panel.style.borderRadius = "16px";
    hero.style.height = `${startHeroHeight}px`;

    panel.getBoundingClientRect(); // force reflow, so the lines above "count" as the start point

    requestAnimationFrame(() => {
      const targetWidth = Math.min(720, window.innerWidth - 80);
      const targetHeight = Math.min(window.innerHeight * 0.85, 580);
      panel.style.top = `${(window.innerHeight - targetHeight) / 2}px`;
      panel.style.left = `${(window.innerWidth - targetWidth) / 2}px`;
      panel.style.width = `${targetWidth}px`;
      panel.style.height = `${targetHeight}px`;
      panel.style.borderRadius = "20px";
      hero.style.height = `${targetHeight * 0.44}px`;
    });

    const revealTimer = setTimeout(() => setIsOpen(true), RESIZE_DURATION_MS);
    return () => clearTimeout(revealTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    const panel = panelRef.current;
    const hero = heroRef.current;
    if (!panel || !hero || closing) return;
    setClosing(true);
    setIsOpen(false); // fades out the text/tags immediately
    setHover(null);
    setLightboxFor(null);

    // Shrink back onto the card of the project you're looking at right now
    const geo = getCloseGeometry?.();
    const rect = geo?.rect ?? startRect;
    const heroHeight = geo?.heroHeight ?? startHeroHeight;

    setTimeout(() => {
      panel.style.top = `${rect.top}px`;
      panel.style.left = `${rect.left}px`;
      panel.style.width = `${rect.width}px`;
      panel.style.height = `${rect.height}px`;
      panel.style.borderRadius = "16px";
      hero.style.height = `${heroHeight}px`;
    }, 150); // small pause so the text finishes fading before it shrinks

    setTimeout(() => {
      onClose();
    }, 150 + RESIZE_DURATION_MS);
  };

  // Which picture is showing in the hero: the hovered thumbnail while the
  // mouse is on one, otherwise the one you last clicked (the front picture
  // until you click another).
  const shownIndex = hoverIndex ?? selectedIndex;
  const heroImage = hasImages ? project.images[shownIndex] : null;
  const heroBackground =
    !hasImages && hoverIndex !== null ? tint(hoverIndex) : `${project.color}22`;

  // Step through the photos in the full view. Wraps around.
  const goToPhoto = (delta) => {
    if (total < 2) return;
    setHoverIndex(null);
    setSelectedIndex((shownIndex + delta + total) % total);
  };

  // Keyboard. Escape closes the full photo first, then the panel.
  // Left/Right flip photos while the full photo is open, otherwise they
  // switch to the previous / next project.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (closing) return;
      if (e.key === "Escape") {
        if (lightboxOpen) setLightboxOpen(false);
        else handleClose();
      } else if (e.key === "ArrowLeft") {
        if (lightboxOpen) goToPhoto(-1);
        else onPrev?.();
      } else if (e.key === "ArrowRight") {
        if (lightboxOpen) goToPhoto(1);
        else onNext?.();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return createPortal(
    <>
      <div
        className={`project-expand-backdrop${isOpen && !closing ? " project-expand-backdrop--open" : ""}`}
        onClick={handleClose}
      />
      <div ref={panelRef} className="project-expand-panel">
        <div
          ref={heroRef}
          className="project-expand-panel__hero"
          style={{ background: heroBackground }}
        >
          {hasImages ? (
            <img
              key={heroImage}
              src={heroImage}
              alt={project.name}
              className="project-expand-panel__hero-img"
              draggable="false"
              onClick={() => isOpen && setLightboxOpen(true)}
            />
          ) : (
            project.emoji
          )}

          {hasImages && (
            <button
              className={`project-expand-panel__expand${isOpen ? " project-expand-panel__expand--visible" : ""}`}
              onClick={() => setLightboxOpen(true)}
              aria-label="View full photo"
            >
              <ExpandIcon />
              <span>View full photo</span>
            </button>
          )}

          <button
            className={`project-expand-panel__close${isOpen ? " project-expand-panel__close--visible" : ""}`}
            onClick={handleClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className={`project-expand-panel__body${isOpen ? " project-expand-panel__body--visible" : ""}`}>
          {/* key={project.name} makes the text fade in again when you switch projects */}
          <div key={project.name} className="project-expand-panel__content">
            <p className="project-expand-panel__name">{project.name}</p>
            <div className="project-expand-panel__tags">
              {project.tags.map((tag) => (
                <span key={tag} className="project-expand-panel__tag">
                  {tag}
                </span>
              ))}
            </div>
            <p className="project-expand-panel__desc">{project.description}</p>

            {(project.demoUrl || project.codeUrl) && (
              <div className="project-expand-panel__actions">
                {project.demoUrl && (
                  <a
                    className="project-expand-panel__btn project-expand-panel__btn--primary"
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Live demo
                  </a>
                )}
                {project.codeUrl && (
                  <a
                    className="project-expand-panel__btn"
                    href={project.codeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Source code
                  </a>
                )}
              </div>
            )}

            <p className="project-expand-panel__subheading">
              // More pictures (hover to preview, click to keep)
            </p>
            <div className="project-expand-panel__thumbs">
              {thumbs.map((item, n) => (
                <div
                  key={n}
                  className={`project-expand-panel__thumb${hasImages && shownIndex === n ? " project-expand-panel__thumb--active" : ""}`}
                  style={hasImages ? undefined : { background: tint(n) }}
                  onMouseEnter={() => setHoverIndex(n)}
                  onMouseLeave={() => setHoverIndex(null)}
                  onClick={() => hasImages && setSelectedIndex(n)}
                >
                  {hasImages ? (
                    <img src={item} alt="" className="project-expand-panel__thumb-img" draggable="false" />
                  ) : (
                    project.emoji
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {position && position.total > 1 && (
          <div className={`project-expand-panel__nav${isOpen ? " project-expand-panel__nav--visible" : ""}`}>
            <span>
              Project {position.current} of {position.total}
            </span>
            <div>
              <button onClick={onPrev} aria-label="Previous project">
                <ChevronIcon direction="left" />
              </button>
              <button onClick={onNext} aria-label="Next project">
                <ChevronIcon direction="right" />
              </button>
            </div>
          </div>
        )}
      </div>

      {lightboxOpen && hasImages && (
        <div className="project-lightbox" onClick={() => setLightboxOpen(false)}>
          <div className="project-lightbox__frame" onClick={(e) => e.stopPropagation()}>
            <img
              key={project.images[shownIndex]}
              src={project.images[shownIndex]}
              alt={project.name}
              className="project-lightbox__img"
              draggable="false"
            />
            <button
              className="project-lightbox__close"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close full photo"
            >
              <MinimizeIcon />
            </button>
            <span className="project-lightbox__counter">
              {shownIndex + 1} / {total}
            </span>

            {total > 1 && (
              <div className="project-lightbox__nav">
                <button
                  className="project-lightbox__arrow"
                  onClick={() => goToPhoto(-1)}
                  aria-label="Previous photo"
                >
                  <ChevronIcon direction="left" />
                </button>
                <button
                  className="project-lightbox__arrow"
                  onClick={() => goToPhoto(1)}
                  aria-label="Next photo"
                >
                  <ChevronIcon direction="right" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>,
    document.body
  );
}