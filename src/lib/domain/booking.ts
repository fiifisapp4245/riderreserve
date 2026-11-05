import type { CategoryId, DriveOption } from "./categories"
import type { Quote } from "./pricing"
import type { Trip } from "./trip"
import type { Renter } from "./contact"

/** Booking, payment and refund status are tracked separately and never conflated. */
export type BookingStatus = "pending_payment" | "confirmed" | "cancelled" | "expired"
export type PaymentStatus = "not_started" | "pending" | "succeeded" | "failed" | "cancelled" | "expired"
export type RefundStatus = "none" | "requested" | "approved" | "processing" | "completed" | "failed"

export interface Booking {
  reference: string
  createdAt: string
  trip: Trip
  categoryId: CategoryId
  drive: DriveOption
  renter: Renter
  quote: Extract<Quote, { kind: "priced" }>
  policyVersion: string
  status: BookingStatus
  payment: { id: string; status: PaymentStatus; amount: number; updatedAt: string }
  refund: { status: RefundStatus; amount?: number }
  amendmentsUsed: number
}

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending_payment: "Awaiting payment",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  expired: "Expired",
}

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  not_started: "Not started",
  pending: "Pending",
  succeeded: "Paid",
  failed: "Failed",
  cancelled: "Cancelled",
  expired: "Expired",
}

export const REFUND_STATUS_LABEL: Record<RefundStatus, string> = {
  none: "No refund",
  requested: "Refund requested",
  approved: "Refund approved",
  processing: "Refund processing",
  completed: "Refund completed",
  failed: "Refund failed",
}

/** What the customer-facing booking view may show (no internal fields). */
export type BookingView = Omit<Booking, "renter"> & {
  renter: { fullName: string; phoneMasked: string; emailMasked: string }
}

export function maskEmail(email: string) {
  const [user, domain] = email.split("@")
  return `${user.slice(0, 1)}${"•".repeat(Math.max(1, user.length - 1))}@${domain}`
}

export function maskPhone(e164: string) {
  return `${e164.slice(0, 4)} ••• ${e164.slice(-3)}`
}

export function toView(b: Booking): BookingView {
  return {
    ...b,
    renter: { fullName: b.renter.fullName, phoneMasked: maskPhone(b.renter.phone), emailMasked: maskEmail(b.renter.email) },
  }
}
