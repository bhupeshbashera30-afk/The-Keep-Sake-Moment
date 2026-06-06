import { useEffect, useState } from 'react'

export function PageLoader() {
  const [hide, setHide] = useState(false)
  const [unmounted, setUnmounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setHide(true), 2200)
    const timer2 = setTimeout(() => setUnmounted(true), 3000)
    return () => { clearTimeout(timer); clearTimeout(timer2) }
  }, [])

  if (unmounted) return null

  return (
    <div className={`page-loader ${hide ? 'hide' : ''}`} aria-hidden="true">
      <img
        src="/images/logo-transparent-new.png"
        alt="The Keepsake Moment"
        className="loader-wordmark"
      />
      <div className="loader-bar-track">
        <div className="loader-bar-fill" />
      </div>
    </div>
  )
}

