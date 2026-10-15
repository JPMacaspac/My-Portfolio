import { useEffect, useRef, useState } from 'react'

// Returns [ref, inView]. Attach `ref` to an element and `inView` flips to
// true when it scrolls into view, then back to false when it leaves, in
// either scroll direction. Because it flips both ways, CSS transitions
// play an "in" animation AND an "out" animation every single time.
//
// rootMargin shrinks the "visible area" used for the check: 80px at the top
// (the navbar) and 120px at the bottom. That makes animations start a little
// later, when the block is clearly on screen, and finish their "out"
// animation while you can still see it.
export default function useInView({ threshold = 0.2, rootMargin = '-80px 0px -120px 0px' } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold, rootMargin }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return [ref, inView]
}