"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, ArrowRight, Check, Loader2, MapPin, Pencil } from "lucide-react"
import { quoteTrip, submitBooking, type CategoryQuote } from "@/app/actions"
import { ErrorSummary, Field } from "@/components/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ButtonLink, Notice } from "@/components/ui-extras"
import { useNow } from "@/hooks/use-now"
import { getLocation } from "@/lib/domain/business"
import { getCategory, type CategoryId } from "@/lib/domain/categories"
import { formatPhoneDisplay, validateRenter, type Renter } from "@/lib/domain/contact"
import { documentRequirements, journeyExclusions, policyFor } from "@/lib/domain/policy"
import { formatGHS, type Quote } from "@/lib/domain/pricing"
import { formatLocalDateTime } from "@/lib/domain/time"
import { categoryConflict, tripInstants, validateItinerary, validateTrip, type Trip } from "@/lib/domain/trip"
import { cn } from "@/lib/utils"
import { CategoryRow } from "./category-card"
import { ItineraryFields, TRIP_FIELD_LABELS, TripFields, tripFromParams, tripToParams, type TripDraft } from "./trip-fields"

const STEPS = [
  { id: "trip", label: "Plan trip" },
  { id: "category", label: "Choose vehicle" },
  { id: "details", label: "Your details" },
  { id: "review", label: "Review & pay" },
] as const
type StepId = (typeof STEPS)[number]["id"]

const DRAFT_KEY = "rr:renter-draft"

function Progress({ current }: { current: StepId }) {
  const index = STEPS.findIndex((s) => s.id === current)
  return (
    <nav aria-label="Booking progress" className="mx-auto w-full max-w-xl">
      <ol className="grid grid-cols-4 gap-2">
        {STEPS.map((s, i) => (
          <li
            key={s.id}
            aria-current={i === index ? "step" : undefined}
            className={cn(
              "relative flex flex-col items-center gap-2 text-center",
              // Connector to the next step, drawn behind the markers.
              i < STEPS.length - 1 && "after:absolute after:top-4 after:left-1/2 after:h-px after:w-full after:bg-stone",
              i < index && "after:bg-ink",
            )}
          >
            <span
              className={cn(
                "relative z-10 flex size-8 items-center justify-center rounded-full text-sm font-bold",
                i < index && "bg-ink text-white",
                i === index && "bg-brand text-white",
                i > index && "border border-stone bg-white text-muted-foreground",
              )}
            >
              {i < index ? <Check aria-hidden className="size-4" /> : i + 1}
            </span>
            <span className={cn("text-xs leading-tight sm:text-sm", i === index ? "font-semibold text-ink" : "text-muted-foreground")}>
              <span className="sr-only">
                Step {i + 1} of {STEPS.length}
                {i < index ? " (completed)" : ""}:{" "}
              </span>
              {s.label}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  )
}

function TripSummary({ trip, onEdit }: { trip: Trip; onEdit: () => void }) {
  const { pickup, ret } = tripInstants(trip)
  const loc = getLocation(trip.location)
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-stone bg-sand p-4 sm:flex-row sm:items-center sm:justify-between">
      <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-muted-foreground">Pickup & return</dt>
          <dd className="flex items-center gap-1 font-semibold text-ink">
            <MapPin aria-hidden className="size-4" /> {loc?.name}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">From</dt>
          <dd className="font-semibold text-ink">{formatLocalDateTime(pickup)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">To</dt>
          <dd className="font-semibold text-ink">{formatLocalDateTime(ret)}</dd>
        </div>
      </dl>
      <Button variant="outline" onClick={onEdit} className="bg-white">
        <Pencil aria-hidden data-icon="inline-start" /> Edit trip
      </Button>
    </div>
  )
}

function StepHeading({ children, id }: { children: React.ReactNode; id: string }) {
  const ref = useRef<HTMLHeadingElement>(null)
  // Move focus to the new step's heading so keyboard and screen-reader users land in context.
  useEffect(() => ref.current?.focus(), [])
  return (
    <h1 ref={ref} id={id} tabIndex={-1} className="text-center text-[1.75rem] leading-tight font-bold outline-none sm:text-4xl">
      {children}
    </h1>
  )
}

export function RentFlow() {
  const router = useRouter()
  const params = useSearchParams()
  const now = useNow()

  const urlTrip = useMemo(() => tripFromParams(new URLSearchParams(params.toString())), [params])
  const requestedStep = (params.get("step") as StepId) || "trip"
  const categoryId = (params.get("category") as CategoryId) || undefined

  const [trip, setTrip] = useState<TripDraft>(() => ({ drive: "self-drive", ...urlTrip }))
  const [syncedUrlTrip, setSyncedUrlTrip] = useState(urlTrip)
  const [tripErrors, setTripErrors] = useState<Record<string, string>>({})
  // Restore contact draft for Back/Edit. Only name/phone/email/requests — never documents or payment data.
  const [renter, setRenter] = useState<Partial<Renter>>(() => {
    try {
      return JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? "{}")
    } catch {
      return {}
    }
  })
  const [renterErrors, setRenterErrors] = useState<Record<string, string>>({})

  // URL is the source of truth for the trip (Back/Forward, deep links): adopt it when it changes.
  if (syncedUrlTrip !== urlTrip) {
    setSyncedUrlTrip(urlTrip)
    setTrip((t) => ({ ...t, ...urlTrip }))
  }

  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(renter))
    } catch {}
  }, [renter])

  const tripValid = now ? Object.keys(validateTrip(urlTrip, now)).length === 0 : false
  // Guard deep links: never show later steps for an invalid trip or missing category.
  const step: StepId =
    !now || requestedStep === "trip" || !tripValid
      ? "trip"
      : (requestedStep === "details" || requestedStep === "review") && (!categoryId || categoryConflict(categoryId, urlTrip.drive))
        ? "category"
        : requestedStep

  const go = (next: StepId, t: TripDraft = trip, extra: Record<string, string | undefined> = {}) => {
    router.push(`/rent?${tripToParams(t, { category: categoryId, ...extra, step: next })}`, { scroll: true })
  }

  if (!now) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground" role="status">
        <Loader2 aria-hidden className="size-5 animate-spin" /> Loading booking…
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10">
      <Progress current={step} />

      {step === "trip" && (
        <form
          noValidate
          aria-labelledby="step-trip"
          className="mx-auto flex w-full max-w-xl flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault()
            const errs = validateTrip(trip, now) as Record<string, string>
            setTripErrors(errs)
            if (!Object.keys(errs).length) go("category")
          }}
        >
          <StepHeading id="step-trip">Plan your trip</StepHeading>
          {requestedStep !== "trip" && !tripValid && Object.keys(urlTrip).length > 1 && (
            <Notice tone="warning" title="Please check your trip">
              Some details are missing or no longer available. Update them to see vehicles.
            </Notice>
          )}
          <ErrorSummary errors={tripErrors} labels={TRIP_FIELD_LABELS} />
          <div className="rounded-2xl border border-stone bg-white p-4 sm:p-6">
            <TripFields value={trip} onChange={setTrip} errors={tripErrors} />
          </div>
          <Button type="submit" size="lg" className="w-full">
            See vehicles and prices <ArrowRight aria-hidden data-icon="inline-end" />
          </Button>
        </form>
      )}

      {step === "category" && (
        <CategoryStep
          trip={urlTrip as Trip}
          selected={categoryId}
          onEdit={() => go("trip")}
          onSelect={(id) => go("details", trip, { category: id })}
        />
      )}

      {step === "details" && categoryId && (
        <form
          noValidate
          aria-labelledby="step-details"
          className="mx-auto flex w-full max-w-xl flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault()
            const { errors } = validateRenter(renter)
            const all = { ...errors, ...validateItinerary(trip) } as Record<string, string>
            setRenterErrors(all)
            if (!Object.keys(all).length) go("review")
          }}
        >
          <StepHeading id="step-details">Your details</StepHeading>
            <ErrorSummary
              errors={renterErrors}
              labels={{ fullName: "Full name", phone: "Phone", email: "Email", ...TRIP_FIELD_LABELS, requests: "Special requests" }}
            />
            <Field id="fullName" label="Full name" hint="Exactly as it appears on your ID." error={renterErrors.fullName}>
              {(p) => (
                <Input {...p} autoComplete="name" value={renter.fullName ?? ""} onChange={(e) => setRenter({ ...renter, fullName: e.target.value })} />
              )}
            </Field>
            <Field
              id="phone"
              label="Phone or WhatsApp number"
              hint="Ghana numbers can start with 0. For other countries, include the + country code."
              error={renterErrors.phone}
            >
              {(p) => (
                <Input
                  {...p}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={renter.phone ?? ""}
                  onChange={(e) => setRenter({ ...renter, phone: e.target.value })}
                />
              )}
            </Field>
            <Field id="email" label="Email" hint="We'll send your booking confirmation and receipt here." error={renterErrors.email}>
              {(p) => (
                <Input
                  {...p}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={renter.email ?? ""}
                  onChange={(e) => setRenter({ ...renter, email: e.target.value })}
                />
              )}
            </Field>
            {trip.drive === "self-drive" && <ItineraryFields value={trip} onChange={setTrip} errors={renterErrors} />}
            <Field
              id="requests"
              label="Special requests"
              optional
              hint={`${500 - (renter.requests?.length ?? 0)} characters left`}
              error={renterErrors.requests}
            >
              {(p) => (
                <Textarea
                  {...p}
                  rows={3}
                  maxLength={500}
                  className="min-h-28 rounded-xl border-stone bg-white px-4 py-3 text-base"
                  value={renter.requests ?? ""}
                  onChange={(e) => setRenter({ ...renter, requests: e.target.value })}
                />
              )}
            </Field>
          <RequirementsCard drive={urlTrip.drive!} />
          <p className="text-sm text-muted-foreground">
            We use these details only to manage your rental. See our{" "}
            <Link href="/policies/privacy" className="underline">
              privacy policy
            </Link>
            .
          </p>
          <StepActions onBack={() => go("category")} submitLabel="Review booking" />
        </form>
      )}

      {step === "review" && categoryId && (
        <ReviewStep
          trip={{ ...(urlTrip as Trip), destinations: trip.destinations ?? "", intercity: trip.intercity ?? "" }}
          categoryId={categoryId}
          renter={renter}
          onEdit={go}
        />
      )}
    </div>
  )
}

/** Back + primary action. Full-width 56px buttons stacked on phones, primary first. */
function StepActions({ onBack, submitLabel }: { onBack: () => void; submitLabel: string }) {
  return (
    <div className="flex flex-col gap-3 pt-2 sm:flex-row-reverse">
      <Button type="submit" size="lg" className="w-full sm:flex-1">
        {submitLabel} <ArrowRight aria-hidden data-icon="inline-end" />
      </Button>
      <Button type="button" variant="outline" size="lg" onClick={onBack} className="w-full sm:w-auto">
        <ArrowLeft aria-hidden data-icon="inline-start" /> Back
      </Button>
    </div>
  )
}

function RequirementsCard({ drive }: { drive: Trip["drive"] }) {
  return (
    <div className="rounded-2xl border border-stone bg-sand p-5">
      <h2 className="text-lg font-bold">Bring to collection</h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">
        {documentRequirements(drive).map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
      {drive === "chauffeur" && (
        <p className="mt-3 text-sm text-muted-foreground">You don&apos;t need a driving licence — our chauffeur drives.</p>
      )}
    </div>
  )
}

function CategoryStep({
  trip,
  selected,
  onEdit,
  onSelect,
}: {
  trip: Trip
  selected?: CategoryId
  onEdit: () => void
  onSelect: (id: CategoryId) => void
}) {
  const key = JSON.stringify(trip)
  const [result, setResult] = useState<{ key: string; quotes: CategoryQuote[] | null }>()
  const current = result?.key === key ? result : undefined
  const quotes = current?.quotes ?? null
  const failed = current !== undefined && current.quotes === null
  const conflict = categoryConflict(selected, trip.drive)

  useEffect(() => {
    let live = true
    quoteTrip(trip)
      .then((r) => live && setResult({ key, quotes: r.ok ? r.quotes : null }))
      .catch(() => live && setResult({ key, quotes: null }))
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return (
    <section aria-labelledby="step-category" className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <StepHeading id="step-category">Choose a vehicle category</StepHeading>
      <TripSummary trip={trip} onEdit={onEdit} />
      {conflict && (
        <Notice tone="warning" title="Your previous choice isn't available" role="alert">
          {conflict}
        </Notice>
      )}
      <p className="text-center text-muted-foreground">
        You book a category, not a specific car. The make, model and colour may differ from the photo.
      </p>
      <div aria-live="polite" aria-busy={!quotes && !failed}>
        {failed && (
          <Notice tone="error" title="We couldn't load prices">
            Check your connection and try again, or contact us for a quote.
          </Notice>
        )}
        {!quotes && !failed && (
          <p className="flex items-center gap-2 text-muted-foreground" role="status">
            <Loader2 aria-hidden className="size-5 animate-spin" /> Finding vehicles for your trip…
          </p>
        )}
        {quotes && quotes.length === 0 && (
          <Notice tone="info" title="No categories match this trip">
            Try another drive option or contact us — we may still be able to help.
          </Notice>
        )}
        {quotes && quotes.length > 0 && (
          <ul className="flex flex-col gap-3">
            {[...quotes]
              .sort((x, y) => Number(x.availability.status === "unavailable") - Number(y.availability.status === "unavailable"))
              .map(({ categoryId, quote, availability }) => {
              const category = getCategory(categoryId)!
              return (
                <li key={categoryId}>
                  <CategoryRow
                    category={category}
                    quote={quote}
                    availability={availability}
                    selected={selected === categoryId}
                    action={
                      availability.status === "unavailable" ? (
                        <Button size="lg" variant="outline" className="w-full bg-white" onClick={onEdit}>
                          Change dates
                        </Button>
                      ) : quote.kind === "priced" ? (
                        <Button size="lg" className="w-full" onClick={() => onSelect(categoryId)} aria-label={`Select ${category.name}`}>
                          Select
                        </Button>
                      ) : (
                        <ButtonLink href="/help#contact" size="lg" variant="outline" className="w-full">
                          Request a quote
                        </ButtonLink>
                      )
                    }
                  />
                </li>
              )
            })}
          </ul>
        )}
      </div>
      <IncludedPanel drive={trip.drive} />
    </section>
  )
}

function IncludedPanel({ drive }: { drive: Trip["drive"] }) {
  const policy = policyFor(drive)
  return (
    <div className="grid gap-8 border-t border-stone pt-6 md:grid-cols-2">
      <div>
        <h2 className="text-lg font-bold">Not included in the price</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">
          {journeyExclusions(drive).map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-lg font-bold">Cancellation</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">
          {policy.summary.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <Link href="/policies/cancellation" className="mt-3 inline-block text-sm font-medium underline">
          Full cancellation policy
        </Link>
      </div>
    </div>
  )
}

function ReviewStep({
  trip,
  categoryId,
  renter,
  onEdit,
}: {
  trip: Trip
  categoryId: CategoryId
  renter: Partial<Renter>
  onEdit: (step: StepId) => void
}) {
  const router = useRouter()
  const category = getCategory(categoryId)!
  const policy = policyFor(trip.drive)
  const [quote, setQuote] = useState<Quote | null>(null)
  const [accepted, setAccepted] = useState(false)
  const [acceptError, setAcceptError] = useState<string>()
  const [error, setError] = useState<string>()
  const [pending, startTransition] = useTransition()
  // One key per review session: a double click or retry can't create two bookings.
  const idempotencyKey = useRef<string>(crypto.randomUUID())
  const renterCheck = validateRenter(renter)

  useEffect(() => {
    quoteTrip(trip).then((r) => {
      if (r.ok) setQuote(r.quotes.find((q) => q.categoryId === categoryId)?.quote ?? null)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, JSON.stringify(trip)])

  const pay = () => {
    if (!accepted) {
      setAcceptError("Confirm that you've read and accept the rental terms.")
      document.getElementById("accept")?.focus()
      return
    }
    if (!quote || quote.kind !== "priced") return
    setError(undefined)
    startTransition(async () => {
      const res = await submitBooking({
        trip,
        categoryId,
        renter,
        acceptedPolicyVersion: policy.version,
        expectedPayNow: quote.payNow,
        idempotencyKey: idempotencyKey.current,
      })
      if (res.ok) {
        try {
          sessionStorage.removeItem(DRAFT_KEY)
        } catch {}
        router.push(res.redirectUrl)
        return
      }
      setError(res.error)
      if (res.code === "quote_changed") {
        const r = await quoteTrip(trip)
        if (r.ok) setQuote(r.quotes.find((q) => q.categoryId === categoryId)?.quote ?? null)
      }
    })
  }

  if (!renterCheck.value) {
    return (
      <Notice tone="warning" title="Some details are missing">
        <button className="underline" onClick={() => onEdit("details")}>
          Go back to your details
        </button>
      </Notice>
    )
  }

  const { pickup, ret } = tripInstants(trip)
  const loc = getLocation(trip.location)!

  return (
    <section aria-labelledby="step-review" className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <StepHeading id="step-review">Review and pay</StepHeading>

      <ReviewBlock title="Trip" onEdit={() => onEdit("trip")}>
        <p>{loc.name}, pick up and return at the same location</p>
        <p>
          {formatLocalDateTime(pickup)} → {formatLocalDateTime(ret)} <span className="text-muted-foreground">(Ghana time)</span>
        </p>
        <p>{trip.drive === "self-drive" ? "Self-drive" : "With chauffeur"}</p>
        {trip.drive === "self-drive" && (
          <p className="text-muted-foreground">
            Route: {trip.destinations} · Intercity: {trip.intercity === "yes" ? "Yes" : "No"}
          </p>
        )}
      </ReviewBlock>
      <ReviewBlock title="Vehicle" onEdit={() => onEdit("category")}>
        <p>
          {category.name} <span className="text-muted-foreground">or similar</span>
        </p>
      </ReviewBlock>
      <ReviewBlock title="Your details" onEdit={() => onEdit("details")}>
        <p>{renterCheck.value.fullName}</p>
        <p>{formatPhoneDisplay(renterCheck.value.phone)}</p>
        <p>{renterCheck.value.email}</p>
        {renterCheck.value.requests && <p className="text-muted-foreground">Requests: {renterCheck.value.requests}</p>}
      </ReviewBlock>

      <div className="mt-2 flex flex-col gap-5 rounded-2xl border border-ink p-5 sm:p-6">
        <h2 className="text-lg font-bold">Price</h2>
        {!quote ? (
          <p className="flex items-center gap-2 text-muted-foreground" role="status">
            <Loader2 aria-hidden className="size-4 animate-spin" /> Checking price…
          </p>
        ) : quote.kind !== "priced" ? (
          <Notice tone="info" title="Price on request">
            Online prices aren&apos;t available for this trip. <Link href="/help#contact">Contact us for a quote</Link>.
          </Notice>
        ) : (
          <>
            <dl className="divide-y divide-stone text-sm">
              {quote.lines.map((l) => (
                <div key={l.label} className="flex justify-between gap-4 pb-3">
                  <dt>
                    {l.label}
                    {l.detail && <span className="block text-muted-foreground">{l.detail}</span>}
                  </dt>
                  <dd className="font-medium tabular-nums">{formatGHS(l.amount)}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 py-3 text-base">
                <dt className="font-bold">Pay now</dt>
                <dd className="font-bold tabular-nums">{formatGHS(quote.payNow)}</dd>
              </div>
              <div className="flex justify-between gap-4 pt-3">
                <dt>
                  Due at pick-up
                  <span className="block text-muted-foreground">Refundable deposit, not charged now. Returned after inspection.</span>
                </dt>
                <dd className="font-medium whitespace-nowrap tabular-nums">
                  {quote.collectionDeposit.amount !== null ? formatGHS(quote.collectionDeposit.amount) : "TBC"}
                </dd>
              </div>
            </dl>
            <p className="text-xs text-muted-foreground">
              Charged per started 24-hour period from pick-up: {quote.rentalDays} day{quote.rentalDays === 1 ? "" : "s"} (
              {Math.round(quote.hours)} hours).
              {quote.source === "demo" && <span className="font-semibold text-warning"> Sample prices for demonstration. Not a live offer.</span>}
            </p>

            {policy.status === "unresolved" ? (
              <Notice tone="warning" title="Online payment unavailable for chauffeur bookings">
                Cancellation terms for chauffeur rentals are being confirmed. Please <Link href="/help#contact">contact us to book</Link>.
              </Notice>
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  <label className="flex cursor-pointer items-start gap-3 py-1 text-sm">
                    <input
                      id="accept"
                      type="checkbox"
                      checked={accepted}
                      onChange={(e) => {
                        setAccepted(e.target.checked)
                        setAcceptError(undefined)
                      }}
                      aria-invalid={acceptError ? true : undefined}
                      aria-describedby={acceptError ? "accept-error" : undefined}
                      className="mt-0.5 size-5 shrink-0 accent-[var(--ink)]"
                    />
                    <span>
                      I&apos;ve read and accept the{" "}
                      <Link href="/policies/self-drive-agreement" target="_blank" className="underline">
                        self-drive rental agreement
                      </Link>{" "}
                      and{" "}
                      <Link href="/policies/cancellation" target="_blank" className="underline">
                        cancellation policy
                      </Link>
                      .
                    </span>
                  </label>
                  {acceptError && (
                    <p id="accept-error" className="text-sm font-medium text-destructive">
                      {acceptError}
                    </p>
                  )}
                </div>
                {error && (
                  <Notice tone="error" role="alert" title="Payment not started">
                    {error}
                  </Notice>
                )}
                <Button size="lg" className="w-full" onClick={pay} disabled={pending} aria-disabled={pending}>
                  {pending ? (
                    <>
                      <Loader2 aria-hidden className="animate-spin" data-icon="inline-start" /> Starting payment…
                    </>
                  ) : (
                    <>Pay {formatGHS(quote.payNow)} securely</>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  You&apos;ll pay on our payment provider&apos;s secure page. We never see your card or mobile money PIN.
                </p>
              </>
            )}
          </>
        )}
      </div>

      <div className="mt-4 border-t border-stone pt-6 text-sm">
        <h2 className="text-base font-bold">At pick-up, bring the originals of</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
          {documentRequirements(trip.drive).map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        <p className="mt-3 text-muted-foreground">
          {journeyExclusions(trip.drive)[0]}{" "}
          <Link href="/policies/cancellation" className="font-medium text-ink underline underline-offset-4">
            Cancellation terms
          </Link>
        </p>
      </div>
    </section>
  )
}

function ReviewBlock({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-stone p-5">
      <div className="space-y-0.5 text-sm">
        <h2 className="mb-1 text-lg font-bold">{title}</h2>
        {children}
      </div>
      <Button variant="outline" size="sm" onClick={onEdit} aria-label={`Edit ${title.toLowerCase()}`}>
        <Pencil aria-hidden data-icon="inline-start" /> Edit
      </Button>
    </div>
  )
}
