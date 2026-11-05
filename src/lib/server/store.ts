import "server-only"
import type { Booking } from "@/lib/domain/booking"
import type { PaymentStatus } from "@/lib/domain/booking"

/**
 * In-memory store for LOCAL DEMO MODE ONLY. Data disappears on restart and is
 * not shared between server instances. Replace with the real booking backend
 * (see docs/DECISIONS.md → "Persistence"). Contains synthetic data only.
 */

export interface Challenge {
  id: string
  codeHash: string
  /** References this challenge would unlock; empty for non-matching requests. */
  references: string[]
  expiresAt: number
  attempts: number
  sends: number
  lastSentAt: number
  used: boolean
}

export interface DemoPayment {
  id: string
  bookingRef: string
  amount: number
  status: PaymentStatus
  idempotencyKey: string
}

export interface Enquiry {
  reference: string
  createdAt: string
  data: Record<string, unknown>
}

export interface Store {
  bookings: Map<string, Booking>
  idempotency: Map<string, string>
  challenges: Map<string, Challenge>
  rate: Map<string, number[]>
  sessions: Map<string, { references: Set<string>; expiresAt: number }>
  payments: Map<string, DemoPayment>
  enquiries: Map<string, Enquiry>
}

export function createStore(): Store {
  return {
    bookings: new Map(),
    idempotency: new Map(),
    challenges: new Map(),
    rate: new Map(),
    sessions: new Map(),
    payments: new Map(),
    enquiries: new Map(),
  }
}

const g = globalThis as unknown as { __rideReserveStore?: Store }

export function getStore(): Store {
  g.__rideReserveStore ??= createStore()
  return g.__rideReserveStore
}

/** Sliding-window rate limit. Returns false when the limit is exceeded. */
export function rateLimit(store: Store, key: string, limit: number, windowMs: number, now = Date.now()) {
  const hits = (store.rate.get(key) ?? []).filter((t) => now - t < windowMs)
  if (hits.length >= limit) {
    store.rate.set(key, hits)
    return false
  }
  hits.push(now)
  store.rate.set(key, hits)
  return true
}
