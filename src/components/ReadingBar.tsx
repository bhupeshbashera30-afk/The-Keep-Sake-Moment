import { useEffect, useState } from 'react'

export function ReadingBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const scrolled = window.scrollY
      const total = document.documentElement.scrollHeight - window.innerHeight
      setProgress(total > 0 ? scrolled / total : 0)
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <div
      className="reading-bar"
      style={{ transform: `scaleX(${progress})`, width: '100%' }}
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  )
}
