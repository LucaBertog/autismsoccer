import type { CSSProperties, ReactNode } from 'react'
import { useInViewOnce } from '../hooks/useInViewOnce'

type RevealProps = {
  children: ReactNode
  className?: string
  delayMs?: number
}

export function Reveal({ children, className = '', delayMs = 0 }: RevealProps) {
  const { ref, visible } = useInViewOnce()

  return (
    <div
      ref={ref}
      className={`anim-reveal ${visible ? 'is-visible' : ''} ${className}`.trim()}
      style={{ '--reveal-delay': `${delayMs}ms` } as CSSProperties}
    >
      {children}
    </div>
  )
}
