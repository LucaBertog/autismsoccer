import { useEffect, useRef } from 'react'

type ParallaxOptions = {
  enabled?: boolean
}

export function useParallax(
  targetRef: { current: HTMLElement | null },
  options: ParallaxOptions = {},
) {
  const { enabled = true } = options
  const frameRef = useRef(0)

  useEffect(() => {
    const el = targetRef.current
    if (!el || !enabled) return

    const scene = el.closest('.iceberg-parallax-scene') as HTMLElement | null
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const narrowQuery = window.matchMedia('(max-width: 768px)')

    const apply = () => {
      frameRef.current = 0
      if (motionQuery.matches || !scene) {
        el.style.transform = 'translate3d(0, 0, 0)'
        return
      }

      const rect = scene.getBoundingClientRect()
      const travel = Math.max(1, scene.offsetHeight - window.innerHeight)
      const scrolled = Math.min(Math.max(-rect.top, 0), travel)
      const progress = scrolled / travel
      const intensity = narrowQuery.matches ? 18 : 36
      el.style.transform = `translate3d(0, ${progress * intensity}px, 0)`
    }

    const onScroll = () => {
      if (frameRef.current) return
      frameRef.current = window.requestAnimationFrame(apply)
    }

    apply()
    window.addEventListener('scroll', onScroll, { passive: true })
    motionQuery.addEventListener('change', apply)
    narrowQuery.addEventListener('change', apply)

    return () => {
      window.removeEventListener('scroll', onScroll)
      motionQuery.removeEventListener('change', apply)
      narrowQuery.removeEventListener('change', apply)
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current)
    }
  }, [enabled, targetRef])
}
