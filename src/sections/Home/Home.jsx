import { useEffect, useState } from 'react'
import HomeIntro from '../../components/HomeIntro/HomeIntro'
import useInView from '../../hooks/useInView'
import photo from '../../assets/jp-photo-neon-glow-transparent.png'
import './Home.css'

// The words that type and delete in the "I'm a ..." line.
const ROLES = ['Web Developer', 'UI/UX Designer', 'Web Designer']

// Replace each href with your real link. Names that have an icon below:
// GitHub, LinkedIn, Facebook, Email. Delete a line to remove that icon.
const SOCIALS = [
  { name: 'GitHub', href: 'https://github.com/JPMacaspac' },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/jp-macaspac-106410443/' },
  { name: 'Facebook', href: 'https://www.facebook.com/JpMacaspac08/' },
  { name: 'Email', href: 'https://mail.google.com/mail/?extsrc=mailto&url=mailto%3Ajpmacaspac08%40gmail.com' },
]

const ICONS = {
  GitHub: (
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  ),
  LinkedIn: (
    <>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </>
  ),
  Facebook: (
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  ),
  Email: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 6l-10 7L2 6" />
    </>
  ),
}

// Types out each role, pauses, deletes it, then moves to the next one.
// Waits for `active` so it starts only once the intro animation is over.
function TypingRole({ roles, active }) {
  const [text, setText] = useState('')
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (!active || reducedMotion) return

    let roleIndex = 0
    let charCount = 0
    let deleting = false
    let timer

    const tick = () => {
      const word = roles[roleIndex]
      charCount += deleting ? -1 : 1
      setText(word.slice(0, charCount))

      let delay = deleting ? 45 : 85
      if (!deleting && charCount === word.length) {
        deleting = true
        delay = 1400 // pause on the finished word
      } else if (deleting && charCount === 0) {
        deleting = false
        roleIndex = (roleIndex + 1) % roles.length
        delay = 300
      }
      timer = setTimeout(tick, delay)
    }

    timer = setTimeout(tick, 400)
    return () => clearTimeout(timer)
  }, [active, reducedMotion, roles])

  return (
    <>
      <b className="home__role-text">{reducedMotion ? roles[0] : text}</b>
      <i className="home__caret" />
    </>
  )
}

const SIGN_ROLES = ['Web Developer', 'UI/UX Designer']
const GLITCH_CHARS = '!<>-_/[]{}=+*^?#%&'

// The caption under the signature. It swaps between roles with a glitch:
// the letters flicker through random symbols and settle into the new word,
// left to right.
function GlitchRole({ roles, active }) {
  const [text, setText] = useState(roles[0])
  const [glitching, setGlitching] = useState(false)
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (!active || reducedMotion) return

    let roleIndex = 0
    let holdTimer
    let scrambleTimer

    const goToNextRole = () => {
      roleIndex = (roleIndex + 1) % roles.length
      const target = roles[roleIndex]
      const totalFrames = 18
      let frame = 0
      setGlitching(true)

      scrambleTimer = setInterval(() => {
        frame += 1
        const revealed = Math.floor((frame / totalFrames) * target.length)
        setText(
          target
            .split('')
            .map((ch, i) =>
              i < revealed || ch === ' ' || ch === '/'
                ? ch
                : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
            )
            .join('')
        )
        if (frame >= totalFrames) {
          clearInterval(scrambleTimer)
          setText(target)
          setGlitching(false)
          holdTimer = setTimeout(goToNextRole, 2600) // how long each role stays
        }
      }, 45)
    }

    holdTimer = setTimeout(goToNextRole, 2600)
    return () => {
      clearTimeout(holdTimer)
      clearInterval(scrambleTimer)
    }
  }, [active, reducedMotion, roles])

  return (
    <small className={`home__sign-role${glitching ? ' home__sign-role--glitch' : ''}`}>
      {text}
    </small>
  )
}

// Counts up from 0 to `to` each time `active` turns true (and resets to 0
// when it turns false), so the numbers count again whenever you scroll back.
function CountUp({ to, active }) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active) return

    const start = performance.now() + 1400 // wait for the card to finish rising
    let id
    const step = (now) => {
      const progress = Math.min(Math.max((now - start) / 1200, 0), 1)
      setValue(Math.round(to * (1 - Math.pow(1 - progress, 3)))) // eases out
      if (progress < 1) id = requestAnimationFrame(step)
    }
    id = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(id)
      setValue(0)
    }
  }, [active, to])

  return <>{value}</>
}

// introDone comes from App.jsx. Nothing animates in until the intro is over,
// so the animations don't play hidden underneath it. It defaults to true so
// the page still works if you haven't passed it yet.
function Home({ onLogoLanded, introDone = true }) {
  const [photoRef, photoInView] = useInView()
  const [textRef, textInView] = useInView()
  const [stripRef, stripInView] = useInView()

  // A block is "in" while it's on screen AND the intro is finished.
  // Scrolling away makes it false again, which plays the "out" animation.
  const photoIn = introDone && photoInView
  const textIn = introDone && textInView
  const stripIn = introDone && stripInView

  return (
    <section id="home" className="home">
      <HomeIntro onLanded={onLogoLanded} />

      <div className="home__inner">
        <div className="home__hero">
          <div ref={photoRef} className={`home__photo-wrap${photoIn ? ' is-in' : ''}`}>
            <img src={photo} alt="JP" className="home__photo" />
          </div>

          <div ref={textRef} className={`home__text${textIn ? ' is-in' : ''}`}>
            <span className="home__badge home__rise" style={{ '--i': 0 }}>
              <i />
              Open to entry-level roles
            </span>
            <p className="home__eyebrow home__rise" style={{ '--i': 1 }}>
              // Welcome to my portfolio
            </p>
            <h1 className="home__heading">
              <span className="home__heading-inner">
                Hi, I'm <span className="home__heading-name">JP</span>
              </span>
            </h1>
            <p className="home__role home__rise" style={{ '--i': 3 }}>
              I'm a <TypingRole roles={ROLES} active={introDone} />
            </p>
            <p className="home__paragraph home__rise" style={{ '--i': 4 }}>
              I'm John Patrick, a Web Developer with a passion for creating
              interactive, user-focused digital experiences. I specialize in
              UI/UX design, web technologies, and building immersive front-end
              solutions.
            </p>

            <div className="home__cta home__rise" style={{ '--i': 5 }}>
              <a className="home__btn home__btn--primary" href="#projects">
                View my projects
              </a>
              {/* Put your resume at public/resume.pdf and this link works. */}
              <a className="home__btn" href="/resume.pdf" download="John-Patrick-Resume.pdf">
                Download resume
              </a>
            </div>

            <div className="home__social home__rise" style={{ '--i': 6 }}>
              <span>Find me online</span>
              {SOCIALS.map(({ name, href }) => {
                const external = href.startsWith('http')
                return (
                  <a
                    key={name}
                    href={href}
                    aria-label={name}
                    title={name}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {ICONS[name] ? <svg viewBox="0 0 24 24">{ICONS[name]}</svg> : name[0]}
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        <div ref={stripRef} className={`home__strip${stripIn ? ' is-in' : ''}`}>
          <blockquote className="home__motto">
            “Design it. Build it. Make it feel alive.”
            <cite>My motto</cite>
          </blockquote>

          {/* Update these numbers by hand when your project / skill counts change. */}
          <div className="home__stats">
            <div><b><CountUp to={5} active={stripIn} /></b><span>Projects</span></div>
            <div><b><CountUp to={6} active={stripIn} /></b><span>Core tools</span></div>
            <div><b>BSIT</b><span>Graduate</span></div>
          </div>

          <div className="home__sign">
            <span className="home__sig">John Patrick</span>
            <GlitchRole roles={SIGN_ROLES} active={introDone} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Home