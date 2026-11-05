import { TIMEZONE } from "./business"

/**
 * All rental maths happens in Africa/Accra wall-clock time. Ghana is UTC+0
 * with no DST today, but we resolve the offset through Intl rather than
 * hardcoding it so the rules stay correct if that ever changes.
 */

const partsFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
})

export interface LocalParts {
  date: string // YYYY-MM-DD
  time: string // HH:MM
  hour: number
  minute: number
}

export function toLocalParts(instant: Date): LocalParts {
  const p = Object.fromEntries(partsFormatter.formatToParts(instant).map((x) => [x.type, x.value]))
  return {
    date: `${p.year}-${p.month}-${p.day}`,
    time: `${p.hour}:${p.minute}`,
    hour: Number(p.hour),
    minute: Number(p.minute),
  }
}

/** Convert an Accra wall-clock date + time to a UTC instant. */
export function fromLocal(date: string, time: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null
  const guess = new Date(`${date}T${time}:00Z`)
  if (Number.isNaN(guess.getTime())) return null
  const local = toLocalParts(guess)
  const asIfUtc = new Date(`${local.date}T${local.time}:00Z`)
  const offsetMs = asIfUtc.getTime() - guess.getTime()
  const result = new Date(guess.getTime() - offsetMs)
  // Reject impossible dates such as 2026-02-31 that Date silently rolls over.
  return toLocalParts(result).date === date ? result : null
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function formatLocalDate(instant: Date, opts: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    ...opts,
  }).format(instant)
}

export function formatLocalTime(instant: Date) {
  // "9:00 AM": same casing as the time pickers.
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(instant)
    .replace(/\b(am|pm)\b/, (m) => m.toUpperCase())
}

/** "Thu 5 Nov": unambiguous for both day-first and month-first readers. */
export function formatShortDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(
    new Date(`${date}T12:00:00Z`),
  )
}

export function formatLocalDateTime(instant: Date) {
  return `${formatLocalDate(instant)}, ${formatLocalTime(instant)}`
}

export function formatTimeLabel(time: string) {
  const [h, m] = time.split(":").map(Number)
  const suffix = h >= 12 ? "PM" : "AM"
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`
}
