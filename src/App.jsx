import { useEffect, useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import Home from './sections/Home/Home'
import About from './sections/About/About'
import Skills from './sections/Skills/Skills'
import Projects from './sections/Projects/Projects'
import './App.css'

const SECTION_IDS = ['home', 'about', 'skills', 'projects']

function App() {
  // Flips to true the instant the intro logo finishes flying into the
  // navbar's logo slot -- that's when the real navbar should appear.
  const [logoLanded, setLogoLanded] = useState(false)

  // Tracks which section is currently in view, so the navbar can
  // underline the matching link.
  const [activeSection, setActiveSection] = useState('home')

  // Every fresh load/refresh should always start at Home, regardless of
  // which section's #hash is in the URL or what the browser remembers
  // from before. Two things cause the "goes back to last section" bug:
  // (1) the browser auto-restoring your previous scroll position, and
  // (2) the browser auto-jumping to whatever #section is in the URL.
  // This disables both, every time the app first mounts.
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const sections = SECTION_IDS
      .map((id) => document.getElementById(id))
      .filter(Boolean)

    const observer = new IntersectionObserver(
      (entries) => {
        // Of all the sections currently crossing the "watch line", pick
        // the one most visible right now and mark it active.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible.length > 0) {
          setActiveSection(visible[0].target.id)
        }
      },
      {
        // Treat the middle third of the viewport as the "watch line" --
        // a section counts as active once it reaches there, regardless
        // of how tall it is.
        rootMargin: '-33% 0px -33% 0px',
        threshold: 0,
      }
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <Navbar visible={logoLanded} activeSection={activeSection} />
      <Home onLogoLanded={() => setLogoLanded(true)} introDone={logoLanded} />
      <About />
      <Skills />
      <Projects />
    </>
  )
}

export default App