"use client"

import { useCallback, useEffect, useState } from "react"
import { IndicatorKey, DEFAULT_VISIBLE_INDICATORS } from "@/lib/indicators-metadata"

const STORAGE_KEY = "aurum:signal-preferences"

export type SignalInterval = "1h" | "4h" | "1d"

interface SignalPreferences {
  defaultInterval: SignalInterval
  visibleIndicators: IndicatorKey[]
}

const DEFAULT_PREFERENCES: SignalPreferences = {
  defaultInterval: "4h",
  visibleIndicators: DEFAULT_VISIBLE_INDICATORS,
}

function readPreferences(): SignalPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PREFERENCES
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_PREFERENCES, ...parsed }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

function writePreferences(prefs: SignalPreferences) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  window.dispatchEvent(new Event("aurum:signal-preferences-changed"))
}

export function useSignalPreferences() {
  const [preferences, setPreferences] = useState<SignalPreferences>(readPreferences)

  useEffect(() => {
    function handleChange() {
      setPreferences(readPreferences())
    }

    window.addEventListener("aurum:signal-preferences-changed", handleChange)
    window.addEventListener("storage", handleChange)
    return () => {
      window.removeEventListener("aurum:signal-preferences-changed", handleChange)
      window.removeEventListener("storage", handleChange)
    }
  }, [])

  const setDefaultInterval = useCallback((interval: SignalInterval) => {
    const next = { ...readPreferences(), defaultInterval: interval }
    writePreferences(next)
    setPreferences(next)
  }, [])

  const toggleIndicator = useCallback((key: IndicatorKey) => {
    const current = readPreferences()
    const isVisible = current.visibleIndicators.includes(key)
    const next = {
      ...current,
      visibleIndicators: isVisible
        ? current.visibleIndicators.filter((k) => k !== key)
        : [...current.visibleIndicators, key],
    }
    writePreferences(next)
    setPreferences(next)
  }, [])

  return { preferences, setDefaultInterval, toggleIndicator }
}
