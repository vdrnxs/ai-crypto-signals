"use client"

import { useEffect, useRef, useState } from "react"

const DURATION_MS = 900

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

/**
 * Animates a number from its previous value to a new target whenever the
 * target changes. Used for the ticker-style reveal on newly generated signals.
 * The very first value is shown immediately (no animation on mount).
 */
export function useCountUp(target: number): number {
  const [value, setValue] = useState(target)
  const valueRef = useRef(target)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    if (valueRef.current === target) return

    const from = valueRef.current
    const startTime = performance.now()

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / DURATION_MS)
      const eased = easeOutExpo(progress)
      const next = from + (target - from) * eased
      valueRef.current = next
      setValue(next)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [target])

  return value
}
