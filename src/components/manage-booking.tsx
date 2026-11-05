"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { KeyRound, Loader2, LogOut, MessageCircle, Phone } from "lucide-react"
import {
  cancelBooking,
  cancellationPreview,
  endAccess,
  myBookings,
  resendAccess,
  startAccess,
  verifyAccess,
} from "@/app/actions"
import { Field } from "@/components/form"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Notice, StatusBadge } from "@/components/ui-extras"
import { CONTACT, getLocation } from "@/lib/domain/business"
import {
  BOOKING_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  REFUND_STATUS_LABEL,
  type BookingView,
} from "@/lib/domain/booking"
import { getCategory } from "@/lib/domain/categories"
import { documentRequirements, policyFor, type RefundEstimate } from "@/lib/domain/policy"
import { formatGHS } from "@/lib/domain/pricing"
import { formatLocalDateTime } from "@/lib/domain/time"
import { tripInstants } from "@/lib/domain/trip"

type Phase =
  | { name: "loading" }
  | { name: "lookup" }
  | { name: "code"; challengeId: string; contact: string; demoCode?: string }
  | { name: "bookings"; bookings: BookingView[] }

export function ManageBooking() {
  const [phase, setPhase] = useState<Phase>({ name: "loading" })

  const refresh = async () => {
    const list = await myBookings()
    setPhase(list.length ? { name: "bookings", bookings: list } : { name: "lookup" })
  }

  useEffect(() => {
    myBookings().then((list) => setPhase(list.length ? { name: "bookings", bookings: list } : { name: "lookup" }))
  }, [])

  if (phase.name === "loading") {
    return (
      <p role="status" className="flex items-center gap-2 text-muted-foreground">
        <Loader2 aria-hidden className="size-5 animate-spin" /> Loading…
      </p>
    )
  }
  if (phase.name === "lookup") return <Lookup onSent={(p) => setPhase({ name: "code", ...p })} />
  if (phase.name === "code")
    return <CodeEntry {...phase} onBack={() => setPhase({ name: "lookup" })} onVerified={refresh} />
  return (
    <BookingList
      bookings={phase.bookings}
      onChange={refresh}
      onSignOut={async () => {
        await endAccess()
        setPhase({ name: "lookup" })
      }}
    />
  )
}

function Lookup({ onSent }: { onSent: (p: { challengeId: string; contact: string; demoCode?: string }) => void }) {
  const [lost, setLost] = useState(false)
  const [reference, setReference] = useState("")
  const [contact, setContact] = useState("")
  const [errors, setErrors] = useState<{ reference?: string; contact?: string; form?: string }>({})
  const [pending, start] = useTransition()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const next: typeof errors = {}
    if (!lost && !reference.trim()) next.reference = "Enter your booking reference, for example RR-AB12CD."
    if (!contact.trim()) next.contact = "Enter the phone number or email you booked with."
    setErrors(next)
    if (Object.keys(next).length) return
    start(async () => {
      const res = await startAccess({ reference: lost ? undefined : reference, contact })
      if (!res.ok) return setErrors({ form: res.message })
      onSent({ challengeId: res.challengeId, contact, demoCode: res.demoCode })
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
      <form onSubmit={submit} noValidate className="flex flex-col gap-5 rounded-2xl border border-stone bg-white p-5 sm:p-6">
        <h2 className="text-2xl font-bold">{lost ? "Find bookings by phone or email" : "Find your booking"}</h2>
        <p className="text-muted-foreground">
          {lost
            ? "We'll send a code to the phone or email you booked with, then show your bookings."
            : "Enter your booking reference and the phone number or email you booked with. We'll send you a one-time code."}
        </p>
        {errors.form && (
          <Notice tone="error" role="alert">
            {errors.form}
          </Notice>
        )}
        {!lost && (
          <Field id="reference" label="Booking reference" hint="Starts with RR-, in your confirmation." error={errors.reference}>
            {(p) => (
              <Input
                {...p}
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="font-mono uppercase"
              />
            )}
          </Field>
        )}
        <Field id="contact" label="Phone number or email" error={errors.contact}>
          {(p) => <Input {...p} autoComplete="email" value={contact} onChange={(e) => setContact(e.target.value)} />}
        </Field>
        <div className="flex flex-col gap-3">
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? <Loader2 aria-hidden className="animate-spin" /> : <KeyRound aria-hidden data-icon="inline-start" />} Send code
          </Button>
          <button
            type="button"
            className="text-sm font-medium underline underline-offset-2"
            onClick={() => {
              setLost(!lost)
              setErrors({})
            }}
          >
            {lost ? "I have my booking reference" : "I don't have my booking reference"}
          </button>
        </div>
      </form>
      <aside className="rounded-2xl bg-sand p-5 text-sm">
        <h2 className="text-base font-bold">Can&apos;t access your phone or email?</h2>
        <p className="mt-1 text-muted-foreground">
          For your security we can only show bookings after verifying a contact already on the booking. Our team can help.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <a href={`tel:${CONTACT.phoneE164}`} className="inline-flex items-center gap-2 font-medium underline">
            <Phone aria-hidden className="size-4" /> Call {CONTACT.phoneDisplay}
          </a>
          <a href={CONTACT.whatsappUrl} className="inline-flex items-center gap-2 font-medium underline">
            <MessageCircle aria-hidden className="size-4" /> WhatsApp us
          </a>
        </div>
      </aside>
    </div>
  )
}

function CodeEntry({
  challengeId,
  contact,
  demoCode: initialDemo,
  onBack,
  onVerified,
}: {
  challengeId: string
  contact: string
  demoCode?: string
  onBack: () => void
  onVerified: () => void
}) {
  const [code, setCode] = useState("")
  const [error, setError] = useState<string>()
  const [info, setInfo] = useState<string>("If the details match a booking, we've sent a 6-digit code. It expires in 10 minutes.")
  const [demoCode, setDemoCode] = useState(initialDemo)
  const [pending, start] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => inputRef.current?.focus(), [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    start(async () => {
      const res = await verifyAccess(challengeId, code)
      if (res.ok) return onVerified()
      setError(res.message)
    })
  }

  const resend = () =>
    start(async () => {
      const res = await resendAccess(challengeId, contact)
      setError(res.ok ? undefined : res.message)
      if (res.ok) {
        setInfo(res.message)
        setDemoCode(res.demoCode)
      }
    })

  return (
    <form onSubmit={submit} noValidate className="mx-auto flex w-full max-w-xl flex-col gap-5 rounded-2xl border border-stone bg-white p-5 sm:p-6">
      <h2 className="text-2xl font-bold">Enter your code</h2>
      <p role="status" className="text-muted-foreground">
        {info}
      </p>
      {demoCode && (
        <Notice tone="warning" title="Demo mode">
          No message is sent in demo mode. Your code is <strong className="font-mono">{demoCode}</strong>.
        </Notice>
      )}
      <Field id="otp" label="6-digit code" error={error}>
        {(p) => (
          <Input
            {...p}
            ref={inputRef}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="max-w-48 font-mono text-xl tracking-[0.4em]"
          />
        )}
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending && <Loader2 aria-hidden className="animate-spin" data-icon="inline-start" />} Verify
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={resend} disabled={pending}>
          Send a new code
        </Button>
        <button type="button" onClick={onBack} className="text-sm font-medium underline">
          Use different details
        </button>
      </div>
    </form>
  )
}

function BookingList({ bookings, onChange, onSignOut }: { bookings: BookingView[]; onChange: () => void; onSignOut: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Your bookings</h2>
        <Button variant="ghost" onClick={onSignOut}>
          <LogOut aria-hidden data-icon="inline-start" /> Done — hide my bookings
        </Button>
      </div>
      {bookings.map((b) => (
        <BookingDetail key={b.reference} booking={b} onChange={onChange} />
      ))}
    </div>
  )
}

const bookingTone = { confirmed: "success", pending_payment: "warning", cancelled: "neutral", expired: "neutral" } as const
const paymentTone = { succeeded: "success", pending: "warning", failed: "error", cancelled: "neutral", expired: "neutral", not_started: "neutral" } as const

function BookingDetail({ booking, onChange }: { booking: BookingView; onChange: () => void }) {
  const category = getCategory(booking.categoryId)!
  const loc = getLocation(booking.trip.location)!
  const { pickup, ret } = tripInstants(booking.trip)
  const policy = policyFor(booking.drive)
  const [preview, setPreview] = useState<RefundEstimate | null>(null)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string>()
  const [pending, start] = useTransition()

  const openCancel = () =>
    start(async () => {
      setError(undefined)
      setPreview(await cancellationPreview(booking.reference))
      setOpen(true)
    })

  const confirmCancel = () =>
    start(async () => {
      const percent = preview?.kind === "tier" ? preview.percent : 0
      const res = await cancelBooking(booking.reference, percent)
      if (!res.ok) {
        setError(res.message)
        setPreview(await cancellationPreview(booking.reference))
        return
      }
      setOpen(false)
      onChange()
    })

  return (
    <article className="rounded-2xl border" aria-labelledby={`b-${booking.reference}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
        <div>
          <p className="text-sm text-muted-foreground">Booking reference</p>
          <h3 id={`b-${booking.reference}`} className="font-mono text-xl font-bold tracking-wider">
            {booking.reference}
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone={bookingTone[booking.status]}>Booking: {BOOKING_STATUS_LABEL[booking.status]}</StatusBadge>
          <StatusBadge tone={paymentTone[booking.payment.status]}>Payment: {PAYMENT_STATUS_LABEL[booking.payment.status]}</StatusBadge>
          {booking.refund.status !== "none" && <StatusBadge tone="info">{REFUND_STATUS_LABEL[booking.refund.status]}</StatusBadge>}
        </div>
      </div>
      <div className="grid gap-6 p-5 md:grid-cols-2">
        <dl className="grid gap-3 text-sm">
          <Row label="Name">{booking.renter.fullName}</Row>
          <Row label="Vehicle">
            {category.name}, {booking.drive === "self-drive" ? "self-drive" : "with chauffeur"}
          </Row>
          <Row label="Pickup & return">{loc.name}</Row>
          <Row label="Pickup">{formatLocalDateTime(pickup)}</Row>
          <Row label="Return">{formatLocalDateTime(ret)}</Row>
          <Row label="Paid online">{formatGHS(booking.payment.amount)}</Row>
          {booking.quote.collectionDeposit.amount !== null && (
            <Row label="Due at collection">{formatGHS(booking.quote.collectionDeposit.amount)} refundable deposit</Row>
          )}
          {booking.refund.amount !== undefined && <Row label="Refund amount">{formatGHS(booking.refund.amount)}</Row>}
          <Row label="Contact on file">
            {booking.renter.phoneMasked} · {booking.renter.emailMasked}
          </Row>
        </dl>
        <div className="flex flex-col gap-4 text-sm">
          {booking.status === "confirmed" && (
            <div>
              <h4 className="font-semibold">Bring to collection</h4>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                {documentRequirements(booking.drive).map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>
          )}
          {booking.status === "confirmed" && (
            <div>
              <h4 className="font-semibold">Change your booking</h4>
              <p className="mt-1 text-muted-foreground">
                {policy.amendment} Changes used: {booking.amendmentsUsed}.
              </p>
              <p className="mt-1 text-muted-foreground">
                Online changes are coming soon. To request one, call or WhatsApp {CONTACT.phoneDisplay} with your reference.
              </p>
            </div>
          )}
          {booking.refund.status === "requested" && (
            <Notice title="Refund requested">
              We&apos;ve recorded your cancellation. Refunds are processed back to your original payment method; we&apos;ll update the status
              here.
            </Notice>
          )}
          {booking.status === "confirmed" && (
            <Button variant="destructive" size="lg" className="self-start" onClick={openCancel} disabled={pending}>
              Cancel booking…
            </Button>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel booking {booking.reference}?</DialogTitle>
            <DialogDescription>Check the refund below before you confirm. This can&apos;t be undone.</DialogDescription>
          </DialogHeader>
          {error && (
            <Notice tone="error" role="alert">
              {error}
            </Notice>
          )}
          {!preview ? (
            <p>We couldn&apos;t calculate the refund. Please contact us.</p>
          ) : preview.kind === "unresolved" ? (
            <Notice tone="warning" title="Contact us to cancel">
              {preview.reason}
            </Notice>
          ) : preview.kind === "none" ? (
            <Notice tone="warning" title="No refund">
              {preview.reason}
            </Notice>
          ) : (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Cancelling now ({preview.label.toLowerCase()}): </span>
                <strong>
                  {preview.percent}% refund — {formatGHS(preview.refundable)}
                </strong>{" "}
                of {formatGHS(booking.payment.amount)} paid.
              </p>
              {preview.cutoffs.length > 0 && (
                <ul className="list-disc pl-5 text-muted-foreground">
                  {preview.cutoffs.map((c) => (
                    <li key={c.at.toString()}>
                      After {formatLocalDateTime(new Date(c.at))} (Ghana time) the refund drops to {c.percentAfter}%.
                    </li>
                  ))}
                </ul>
              )}
              {booking.quote.collectionDeposit.amount !== null && (
                <p className="text-muted-foreground">The collection deposit hasn&apos;t been paid yet, so there&apos;s nothing to refund for it.</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Keep booking
            </Button>
            {preview && preview.kind !== "unresolved" && (
              <Button variant="default" onClick={confirmCancel} disabled={pending}>
                {pending && <Loader2 aria-hidden className="animate-spin" data-icon="inline-start" />} Confirm cancellation
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[8.5rem_1fr] gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-ink">{children}</dd>
    </div>
  )
}
