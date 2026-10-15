import { forwardRef } from "react";
import "./ProjectCard.css";

// forwardRef is needed because the parent (Projects.jsx) must measure this
// exact DOM element's position/size when it's clicked, to animate the
// FLIP expand from its real on-screen position.
const ProjectCard = forwardRef(function ProjectCard(
  { project, number, order, featured, revealed, isExpanding, onClick },
  ref
) {
  const frontImage = project.images?.[0];

  const classes = [
    "project-card",
    featured && "project-card--featured",
    revealed && "project-card--in",
    isExpanding && "project-card--expanding",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={ref}
      className={classes}
      style={{ "--i": order }}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div
        className="project-card__image"
        style={{ background: `${project.color}22` }}
      >
        {frontImage ? (
          <img
            src={frontImage}
            alt={project.name}
            className="project-card__img"
            draggable="false"
          />
        ) : (
          <span className="project-card__emoji">{project.emoji}</span>
        )}
        <span className="project-card__number">{String(number).padStart(2, "0")}</span>
        {featured && <span className="project-card__badge">Featured</span>}
        <span className="project-card__view">View project &rarr;</span>
      </div>

      <div className="project-card__body">
        <p className="project-card__name">{project.name}</p>
        <div className="project-card__tags">
          {project.tags.map((tag) => (
            <span key={tag} className="project-card__tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});

export default ProjectCard;