import { useEffect, useRef, useState } from 'react'

export function useInViewOnce() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || visible) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setVisible(true)
        observer.disconnect()
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -6% 0px',
      },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [visible])

  return { ref, visible }
}
