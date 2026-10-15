import SkillsCarousel from '../../components/SkillsCarousel/SkillsCarousel'
import useInView from '../../hooks/useInView'
import './Skills.css'

// Tools you work with that aren't in the carousel.
const ALSO_WORK_WITH = ['TypeScript', 'Tailwind CSS', 'PHP', 'MySQL', 'NestJS', 'Canva', 'Arduino']

function Skills() {
  const [headRef, headIn] = useInView()
  const [alsoRef, alsoIn] = useInView()

  return (
    <section id="skills" className="skills">
      <div ref={headRef} className={`skills__header${headIn ? ' is-in' : ''}`}>
        <p className="skills__eyebrow skills__rise" style={{ '--i': 0 }}>// My toolkit</p>
        <h2 className="skills__heading">
          <span className="skills__heading-inner">Skills</span>
        </h2>
      </div>

      <SkillsCarousel />

      <div ref={alsoRef} className={`skills__also${alsoIn ? ' is-in' : ''}`}>
        <p className="skills__also-label skills__rise" style={{ '--i': 0 }}>// Also work with</p>
        <div className="skills__also-chips">
          {ALSO_WORK_WITH.map((name, i) => (
            <span key={name} className="skills__chip skills__rise" style={{ '--i': i + 1 }}>
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Skills