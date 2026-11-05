import "server-only"
import { createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto"
import { normalizePhone } from "@/lib/domain/contact"
import { rateLimit, type Store } from "./store"

/**
 * Guest booking access (RR-12). A booking code + phone/email only *starts*
 * verification; access requires a short-lived single-use code delivered to a
 * contact already on the booking. Responses are identical whether or not a
 * booking matches, so the endpoint cannot be used to discover bookings.
 */

export const OTP_TTL_MS = 10 * 60_000
export const OTP_MAX_ATTEMPTS = 5
export const OTP_RESEND_COOLDOWN_MS = 60_000
export const OTP_MAX_SENDS = 3
export const START_LIMIT = { limit: 5, windowMs: 15 * 60_000 }
export const SESSION_TTL_MS = 30 * 60_000

const hash = (code: string) => createHash("sha256").update(code).digest()

function contactMatches(contact: string, phone: string, email: string) {
  const trimmed = contact.trim().toLowerCase()
  if (trimmed.includes("@")) return trimmed === email.toLowerCase()
  const p = normalizePhone(contact)
  return p.ok && p.e164 === phone
}

export type StartResult =
  | { ok: true; challengeId: string; /** Only populated in demo mode. */ demoCode?: string }
  | { ok: false; error: "rate_limited" | "invalid_input" }

/**
 * Start verification. `reference` is optional: without it, this is the
 * lost-code recovery path and unlocks every booking held by that contact.
 */
export function startVerification(
  store: Store,
  input: { reference?: string; contact: string },
  opts: { now?: number; demo: boolean; send: (to: string, code: string) => void },
): StartResult {
  const now = opts.now ?? Date.now()
  const contact = input.contact.trim()
  const reference = input.reference?.trim().toUpperCase()
  if (!contact) return { ok: false, error: "invalid_input" }

  const rlKey = `start:${reference ?? "*"}:${contact.toLowerCase()}`
  if (!rateLimit(store, rlKey, START_LIMIT.limit, START_LIMIT.windowMs, now)) return { ok: false, error: "rate_limited" }

  const matches = [...store.bookings.values()].filter(
    (b) => (!reference || b.reference === reference) && contactMatches(contact, b.renter.phone, b.renter.email),
  )

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0")
  const challengeId = randomBytes(16).toString("hex")
  store.challenges.set(challengeId, {
    id: challengeId,
    codeHash: hash(code).toString("hex"),
    references: matches.map((b) => b.reference),
    expiresAt: now + OTP_TTL_MS,
    attempts: 0,
    sends: 1,
    lastSentAt: now,
    used: false,
  })

  // Deliver only to the contact already on file; never to an arbitrary address.
  if (matches.length) opts.send(contact, code)
  return { ok: true, challengeId, demoCode: opts.demo && matches.length ? code : undefined }
}

export type ResendResult =
  | { ok: true; demoCode?: string }
  | { ok: false; error: "cooldown" | "too_many_sends" | "expired"; retryInMs?: number }

export function resendCode(
  store: Store,
  challengeId: string,
  contact: string,
  opts: { now?: number; demo: boolean; send: (to: string, code: string) => void },
): ResendResult {
  const now = opts.now ?? Date.now()
  const c = store.challenges.get(challengeId)
  if (!c || c.used || c.expiresAt < now) return { ok: false, error: "expired" }
  if (c.sends >= OTP_MAX_SENDS) return { ok: false, error: "too_many_sends" }
  const wait = c.lastSentAt + OTP_RESEND_COOLDOWN_MS - now
  if (wait > 0) return { ok: false, error: "cooldown", retryInMs: wait }
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0")
  c.codeHash = hash(code).toString("hex")
  c.sends += 1
  c.lastSentAt = now
  c.expiresAt = now + OTP_TTL_MS
  c.attempts = 0
  if (c.references.length) opts.send(contact, code)
  return { ok: true, demoCode: opts.demo && c.references.length ? code : undefined }
}

export type VerifyResult =
  | { ok: true; references: string[] }
  | { ok: false; error: "incorrect" | "expired" | "locked"; attemptsLeft?: number }

export function verifyCode(store: Store, challengeId: string, code: string, now = Date.now()): VerifyResult {
  const c = store.challenges.get(challengeId)
  if (!c || c.used || c.expiresAt < now) return { ok: false, error: "expired" }
  if (c.attempts >= OTP_MAX_ATTEMPTS) return { ok: false, error: "locked" }
  c.attempts += 1
  const given = hash(code.trim())
  const expected = Buffer.from(c.codeHash, "hex")
  const correct = timingSafeEqual(given, expected) && c.references.length > 0
  if (!correct) {
    const attemptsLeft = OTP_MAX_ATTEMPTS - c.attempts
    return attemptsLeft <= 0 ? { ok: false, error: "locked" } : { ok: false, error: "incorrect", attemptsLeft }
  }
  c.used = true
  return { ok: true, references: c.references }
}

export function createSession(store: Store, references: string[], now = Date.now()) {
  const token = randomBytes(32).toString("base64url")
  store.sessions.set(token, { references: new Set(references), expiresAt: now + SESSION_TTL_MS })
  return token
}

/** Object-level authorisation: every read and mutation goes through this. */
export function canAccess(store: Store, token: string | undefined, reference: string, now = Date.now()) {
  if (!token) return false
  const s = store.sessions.get(token)
  if (!s || s.expiresAt < now) return false
  return s.references.has(reference)
}

export function sessionReferences(store: Store, token: string | undefined, now = Date.now()) {
  if (!token) return []
  const s = store.sessions.get(token)
  if (!s || s.expiresAt < now) return []
  return [...s.references]
}
