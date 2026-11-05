"use client"

import { useSyncExternalStore } from "react"

const subscribe = (cb: () => void) => {
  const id = setInterval(cb, 60_000)
  return () => clearInterval(id)
}

let cached = 0
const getSnapshot = () => {
  // Refresh at most once a minute so the snapshot is stable between renders.
  const now = Date.now()
  if (now - cached >= 60_000) cached = now
  return cached
}

/**
 * Current time on the client, null during server rendering. Booking rules
 * depend on "now", so they're only evaluated in the browser (and again on the
 * server inside actions, which is the authority).
 */
export function useNow(): Date | null {
  const t = useSyncExternalStore(subscribe, getSnapshot, () => 0)
  return t ? new Date(t) : null
}
