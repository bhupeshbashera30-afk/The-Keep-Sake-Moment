import { useEffect, useRef, cloneElement, Children, isValidElement } from 'react'
import type { ReactNode, ReactElement, HTMLAttributes, ElementType } from 'react'

type Direction = 'up' | 'left' | 'right' | 'scale' | 'blur'

interface Props {
  children: ReactNode
  direction?: Direction
  delay?: number
  stagger?: boolean
  className?: string
  as?: ElementType
}

export function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  stagger = false,
  className = '',
  as: Tag = 'div',
}: Props) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('visible'), delay)
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  const revealClasses = stagger
    ? `stagger-children ${className}`
    : `reveal from-${direction} ${className}`

  const style = !stagger && delay ? { transitionDelay: `${delay}ms` } : undefined

  return (
    <Tag
      // @ts-ignore
      ref={ref}
      className={revealClasses}
      style={style}
    >
      {children}
    </Tag>
  )
}
