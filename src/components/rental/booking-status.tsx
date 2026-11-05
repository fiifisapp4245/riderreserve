"use client"

import { useCallback, useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, Clock, Loader2, RefreshCw, XCircle } from "lucide-react"
import { getBooking, retryBookingPayment } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { ButtonLink, Notice } from "@/components/ui-extras"
import { CONTACT, getLocation } from "@/lib/domain/business"
import type { BookingView } from "@/lib/domain/booking"
import { getCategory } from "@/lib/domain/categories"
import { documentRequirements } from "@/lib/domain/policy"
import { formatGHS } from "@/lib/domain/pricing"
import { formatLocalDateTime } from "@/lib/domain/time"
import { tripInstants } from "@/lib/domain/trip"

/**
 * Post-payment page. Status comes from the server, which checks the payment
 * provider — the redirect back here proves nothing on its own.
 */
export function BookingStatusView() {
  const ref = useSearchParams().get("ref") ?? ""
  const router = useRouter()
  const [booking, setBooking] = useState<BookingView | null | undefined>()
  const [checks, setChecks] = useState(0)
  const [pending, start] = useTransition()

  const load = useCallback(() => getBooking(ref).then(setBooking), [ref])

  useEffect(() => {
    load()
  }, [load])

  // Poll briefly while payment is pending (delayed provider callback).
  useEffect(() => {
    if (booking?.payment.status !== "pending" || checks >= 6) return
    const t = setTimeout(() => {
      setChecks((c) => c + 1)
      load()
    }, 5000)
    return () => clearTimeout(t)
  }, [booking, checks, load])

  if (booking === undefined) {
    return (
      <p role="status" className="flex items-center gap-2 text-muted-foreground">
        <Loader2 aria-hidden className="size-5 animate-spin" /> Checking your booking…
      </p>
    )
  }
  if (booking === null) {
    return (
      <Notice tone="warning" title="We can't show this booking here">
        For your security, booking details are only shown in the browser that made the booking, or after you verify your contact
        details. <Link href="/manage-booking">Find your booking</Link>.
      </Notice>
    )
  }

  const category = getCategory(booking.categoryId)!
  const loc = getLocation(booking.trip.location)!
  const { pickup, ret } = tripInstants(booking.trip)
  const p = booking.payment.status

  const retry = () =>
    start(async () => {
      const url = await retryBookingPayment(booking.reference)
      if (url) router.push(url)
    })

  return (
    <div className="flex flex-col gap-6" aria-live="polite">
      {booking.status === "confirmed" ? (
        <Header icon={<CheckCircle2 className="size-10 text-success" aria-hidden />} title="Booking confirmed">
          We&apos;ve received your payment of {formatGHS(booking.payment.amount)}. A confirmation will be sent to{" "}
          {booking.renter.emailMasked}.
        </Header>
      ) : p === "pending" ? (
        <Header icon={<Clock className="size-10 text-warning" aria-hidden />} title="Waiting for payment confirmation">
          Your payment provider hasn&apos;t confirmed the payment yet. This can take a few minutes. Don&apos;t pay again — we&apos;ll
          update this page.
        </Header>
      ) : p === "failed" || p === "cancelled" ? (
        <Header icon={<XCircle className="size-10 text-destructive" aria-hidden />} title={p === "failed" ? "Payment failed" : "Payment cancelled"}>
          Your booking isn&apos;t confirmed and you haven&apos;t been charged. You can try again — we&apos;ve held your details.
        </Header>
      ) : (
        <Header icon={<XCircle className="size-10 text-muted-foreground" aria-hidden />} title="Booking expired">
          The payment window closed before payment was confirmed. Please start a new booking.
        </Header>
      )}

      <div className="rounded-2xl border p-5">
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <Item label="Booking reference">
            <span className="font-mono text-lg font-bold tracking-wider">{booking.reference}</span>
          </Item>
          <Item label="Payment">{p === "succeeded" ? `Paid ${formatGHS(booking.payment.amount)}` : p[0].toUpperCase() + p.slice(1)}</Item>
          <Item label="Vehicle">
            {category.name}, {booking.drive === "self-drive" ? "self-drive" : "with chauffeur"}
          </Item>
          <Item label="Pickup & return">{loc.name}</Item>
          <Item label="Pickup">{formatLocalDateTime(pickup)}</Item>
          <Item label="Return">{formatLocalDateTime(ret)}</Item>
          {booking.quote.collectionDeposit.amount !== null && (
            <Item label="Due at collection">{formatGHS(booking.quote.collectionDeposit.amount)} refundable deposit</Item>
          )}
        </dl>
      </div>

      {booking.status === "confirmed" && (
        <div className="rounded-2xl border p-5">
          <h2 className="text-lg font-bold">At collection, bring the originals of</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {documentRequirements(booking.drive).map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            Arrive at {loc.name} at your pickup time. Questions? Call or WhatsApp {CONTACT.phoneDisplay}.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {p === "pending" && (
          <Button variant="outline" size="lg" onClick={() => load()}>
            <RefreshCw aria-hidden data-icon="inline-start" /> Check again
          </Button>
        )}
        {(p === "failed" || p === "cancelled") && booking.status === "pending_payment" && (
          <Button size="lg" onClick={retry} disabled={pending}>
            Try payment again
          </Button>
        )}
        <ButtonLink href="/manage-booking" variant={booking.status === "confirmed" ? "default" : "outline"} size="lg">
          Manage booking
        </ButtonLink>
      </div>
    </div>
  )
}

function Header({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      {icon}
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-lg text-muted-foreground">{children}</p>
    </div>
  )
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold text-ink">{children}</dd>
    </div>
  )
}
