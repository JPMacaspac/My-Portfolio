import { useEffect, useState } from 'react'
import useInView from '../../hooks/useInView'
import './About.css'

const SKILLS = ['HTML', 'CSS', 'React', 'Github', 'Figma', 'JS']

const TABS = [
  { id: 'education', label: 'Education' },
  { id: 'experience', label: 'Experience' },
]

// `detail` is the small grey line under each title (optional).
const TIMELINES = {
  education: [
    { title: 'Cavite State University - Imus Campus', detail: 'BS in Information Technology' },
    { title: 'Unida Christian College' },
    { title: 'Imus National Highschool' },
    { title: 'Cayetano Topacio Elementary School' },
  ],
  experience: [
    {
      title: 'Soonest Global Express Corp.',
      detail: 'OJT Internship: clerical, administrative, and light IT tasks',
    },
    {
      title: 'Academic projects',
      detail: 'Chatroom, Blog Platform, AgriCOOL, and Scholarship systems',
    },
  ],
}

// pathLength={1} on every shape lets the CSS "draw" each icon line by line.
const FOCUS = [
  {
    title: 'Design',
    text: 'I plan interfaces in Figma, from wireframes to clickable prototypes, before writing any code.',
    icon: (
      <>
        <path pathLength={1} d="M12 19l7-7 3 3-7 7-3-3z" />
        <path pathLength={1} d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path pathLength={1} d="M2 2l7.586 7.586" />
        <circle pathLength={1} cx="11" cy="11" r="2" />
      </>
    ),
  },
  {
    title: 'Build',
    text: 'I turn those designs into working front-ends with React, backed by REST APIs and databases.',
    icon: (
      <>
        <polyline pathLength={1} points="16 18 22 12 16 6" />
        <polyline pathLength={1} points="8 6 2 12 8 18" />
      </>
    ),
  },
  {
    title: 'Tinker',
    text: 'I also build with hardware. AgriCOOL is an Arduino-based misting system for crops.',
    icon: (
      <>
        <rect pathLength={1} x="4" y="4" width="16" height="16" rx="2" />
        <rect pathLength={1} x="9" y="9" width="6" height="6" />
        <path pathLength={1} d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
      </>
    ),
  },
]

function About() {
  const [tab, setTab] = useState('education')
  const [drawnTab, setDrawnTab] = useState(null)

  // One "is it on screen?" flag per block, so each block animates on its own.
  const [mainRef, mainIn] = useInView()
  const [timelineRef, timelineIn] = useInView()
  const [cardsRef, cardsIn] = useInView()
  const [ctaRef, ctaIn] = useInView()

  // Each time the tab changes, the timeline list is rebuilt in its hidden
  // state, then two animation frames later it's allowed to draw itself.
  // (Without the wait, the browser would skip straight to the end.)
  useEffect(() => {
    let second
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setDrawnTab(tab))
    })
    return () => {
      cancelAnimationFrame(first)
      cancelAnimationFrame(second)
    }
  }, [tab])

  const drawn = timelineIn && drawnTab === tab

  return (
    <section id="about" className="about">
      <div className="about__inner">
        <div className="about__top">
          <div ref={mainRef} className={`about__main${mainIn ? ' is-in' : ''}`}>
            <p className="about__eyebrow about__rise" style={{ '--i': 0 }}>// Get to know me</p>
            <h2 className="about__heading">
              <span className="about__heading-inner">About Me</span>
            </h2>
            <p className="about__paragraph about__rise" style={{ '--i': 2 }}>
              I'm John Patrick, a Web Developer with a passion for creating
              interactive, user-focused digital experiences. I specialize in
              UI/UX design, web technologies, and building immersive front-end
              solutions.
            </p>
            <p className="about__paragraph about__rise" style={{ '--i': 3 }}>
              I recently graduated with a BS in Information Technology from
              Cavite State University – Imus Campus, and I'm looking for an
              entry-level Web Developer or UI/UX Designer role where I can
              design, build, and keep growing.
            </p>

            <p className="about__eyebrow about__eyebrow--skills about__rise" style={{ '--i': 4 }}>
              // What I work with
            </p>
            <div className="about__skills">
              {SKILLS.map((skill, i) => (
                // CHANGED: every pill now uses the same style (JS is no longer orange).
                <span
                  key={skill}
                  className="about__skill-pill"
                  style={{ '--i': i }}
                >
                  <span className="about__skill-text">{skill}</span>
                </span>
              ))}
            </div>
          </div>

          <div
            ref={timelineRef}
            className={`about__timeline-wrap${timelineIn ? ' is-in' : ''}`}
          >
            <p className="about__eyebrow about__rise" style={{ '--i': 0 }}>// Background</p>

            <div className="about__tabs about__rise" style={{ '--i': 1 }} role="tablist">
              {TABS.map(({ id, label }) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={tab === id}
                  className={`about__tab${tab === id ? ' about__tab--active' : ''}`}
                  onClick={() => setTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            <ul
              key={tab}
              className={`about__timeline${drawn ? ' about__timeline--drawn' : ''}`}
              role="tabpanel"
            >
              {TIMELINES[tab].map(({ title, detail }, i) => (
                <li key={title} className="about__timeline-item" style={{ '--i': i }}>
                  <b className="about__timeline-title">{title}</b>
                  {detail && <small className="about__timeline-detail">{detail}</small>}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div ref={cardsRef} className={`about__cards${cardsIn ? ' is-in' : ''}`}>
          {FOCUS.map(({ title, text, icon }, i) => (
            <article key={title} className="about__card" style={{ '--i': i }}>
              <svg viewBox="0 0 24 24">{icon}</svg>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>

        {/* The wrapper is what gets watched. The banner inside is clipped to
            nothing until it opens, and the browser treats a fully clipped
            element as "not on screen", so it could never watch itself. */}
        <div ref={ctaRef} className={`about__cta-wrap${ctaIn ? ' is-in' : ''}`}>
          <div className="about__cta">
            <p>Open to entry-level Web Developer and UI/UX Designer roles.</p>
            <div className="about__cta-buttons">
              {/* Put your real email here */}
              <a
                className="about__btn about__btn--primary"
                href="https://mail.google.com/mail/?extsrc=mailto&url=mailto%3Ajpmacaspac08%40gmail.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get in touch
              </a>
              {/* Works once your resume is at public/resume.pdf */}
              <a className="about__btn" href="/resume.pdf" download="John-Patrick-Resume.pdf">
                Download resume
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About