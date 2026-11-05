"use client"

import { Car, Clock, MapPin, UserRound } from "lucide-react"
import { Field } from "@/components/form"
import { DatePicker, PickerSelect } from "@/components/pickers"
import { Textarea } from "@/components/ui/textarea"
import { useNow } from "@/hooks/use-now"
import { BOOKING_RULES, LOCATIONS } from "@/lib/domain/business"
import { DRIVE_OPTIONS, type DriveOption } from "@/lib/domain/categories"
import { earliestPickup, latestPickupDate, timeSlots, type Trip, type TripErrors } from "@/lib/domain/trip"
import { formatShortDate, formatTimeLabel } from "@/lib/domain/time"
import { cn } from "@/lib/utils"

const SLOTS = timeSlots()
const LOCATION_OPTIONS = LOCATIONS.map((l) => ({ value: l.id, label: l.name, detail: `${l.city}, ${l.region}` }))

export type TripDraft = Partial<Trip>

/** Segmented pill: the one place the brand red fills a control. */
export function DriveSwitch({
  value,
  onChange,
  error,
  className,
  hint = true,
}: {
  value: DriveOption | undefined
  onChange: (v: DriveOption) => void
  error?: string
  className?: string
  hint?: boolean
}) {
  return (
    <div className={className}>
      <div
        role="radiogroup"
        aria-label="How do you want to travel?"
        aria-invalid={error ? true : undefined}
        className="grid grid-cols-2 gap-1 rounded-full border border-stone bg-white p-1"
      >
        {DRIVE_OPTIONS.map((opt) => {
          const checked = value === opt.id
          const Icon = opt.id === "self-drive" ? Car : UserRound
          return (
            <label
              key={opt.id}
              className={cn(
                "flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full px-3 text-base font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink",
                checked ? "bg-brand text-white" : "text-ink/70 hover:bg-sand hover:text-ink",
              )}
            >
              <input
                type="radio"
                name="drive"
                id={opt.id === "self-drive" ? "drive" : undefined}
                value={opt.id}
                checked={checked}
                onChange={() => onChange(opt.id)}
                className="sr-only"
              />
              <Icon aria-hidden className="size-5" />
              <span className="whitespace-nowrap">{opt.label}</span>
            </label>
          )
        })}
      </div>
      {hint && (
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {value === "chauffeur"
            ? "A RideReserve driver drives you. No licence needed."
            : "You drive. Bring your driving licence to collection."}
        </p>
      )}
      {error && <p className="mt-1 text-center text-sm font-medium text-destructive">{error}</p>}
    </div>
  )
}

export function TripFields({
  value,
  onChange,
  errors = {},
  showDrive = true,
  showRules = true,
}: {
  value: TripDraft
  onChange: (next: TripDraft) => void
  errors?: TripErrors
  showDrive?: boolean
  showRules?: boolean
}) {
  const set = <K extends keyof Trip>(key: K, v: Trip[K]) => onChange({ ...value, [key]: v })
  const now = useNow()
  const earliest = now ? earliestPickup(now) : null
  const maxDate = now ? latestPickupDate(now) : undefined

  const useEarliest = () => {
    if (!earliest) return
    onChange({
      ...value,
      pickupDate: earliest.date,
      pickupTime: earliest.time,
      returnDate: value.returnDate && value.returnDate > earliest.date ? value.returnDate : undefined,
    })
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {showDrive && <DriveSwitch value={value.drive} onChange={(d) => set("drive", d)} error={errors.drive} />}

      <Field id="location" label="Pick-up and return" hint="Return the vehicle to the same location." error={errors.location}>
        {(p) => (
          <PickerSelect
            {...p}
            icon={MapPin}
            placeholder="Choose a location"
            value={value.location}
            options={LOCATION_OPTIONS}
            onChange={(v) => set("location", v as Trip["location"])}
          />
        )}
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-sm font-semibold text-ink">Pick-up</legend>
        <div className="grid grid-cols-[minmax(0,1fr)_9.5rem] gap-2">
          <Field id="pickupDate" label={<span className="sr-only">Pick-up date</span>} error={errors.pickupDate}>
            {(p) => (
              <DatePicker {...p} min={earliest?.date} max={maxDate} aria-label="Pick-up date" value={value.pickupDate} onChange={(v) => set("pickupDate", v)} />
            )}
          </Field>
          <Field id="pickupTime" label={<span className="sr-only">Pick-up time</span>} error={errors.pickupTime}>
            {(p) => (
              <PickerSelect {...p} icon={Clock} placeholder="Time" aria-label="Pick-up time" value={value.pickupTime} options={SLOTS} onChange={(v) => set("pickupTime", v)} />
            )}
          </Field>
        </div>
        {earliest && (
          <button type="button" onClick={useEarliest} className="self-start py-1 text-sm font-medium text-ink underline decoration-brand decoration-2 underline-offset-4">
            Earliest available: {formatShortDate(earliest.date)}, {formatTimeLabel(earliest.time)}
          </button>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-sm font-semibold text-ink">Return</legend>
        <div className="grid grid-cols-[minmax(0,1fr)_9.5rem] gap-2">
          <Field id="returnDate" label={<span className="sr-only">Return date</span>} error={errors.returnDate}>
            {(p) => (
              <DatePicker {...p} min={value.pickupDate || earliest?.date} aria-label="Return date" value={value.returnDate} onChange={(v) => set("returnDate", v)} />
            )}
          </Field>
          <Field id="returnTime" label={<span className="sr-only">Return time</span>} error={errors.returnTime}>
            {(p) => (
              <PickerSelect {...p} icon={Clock} placeholder="Time" aria-label="Return time" value={value.returnTime} options={SLOTS} onChange={(v) => set("returnTime", v)} />
            )}
          </Field>
        </div>
      </fieldset>

      {showRules && <BookingRules />}
    </div>
  )
}

export function BookingRules({ className }: { className?: string }) {
  return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        Collection {formatTimeLabel("06:00")}–{formatTimeLabel("18:00")} Ghana time · book {BOOKING_RULES.minLeadHours} hours to{" "}
        {BOOKING_RULES.maxAdvanceDays} days ahead.
      </p>
  )
}

/** Self-drive route declaration (RR-05). */
export function ItineraryFields({
  value,
  onChange,
  errors = {},
}: {
  value: TripDraft
  onChange: (next: TripDraft) => void
  errors?: TripErrors
}) {
  const set = <K extends keyof Trip>(key: K, v: Trip[K]) => onChange({ ...value, [key]: v })
  return (
    <fieldset className="flex flex-col gap-5 border-t border-stone pt-6">
      <legend className="sr-only">Your route</legend>
      <div>
        <h2 className="text-xl font-bold">Your route</h2>
        <p className="mt-1 text-muted-foreground">
          The self-drive agreement asks you to declare where you&apos;ll drive. Travel outside these places may incur charges.
        </p>
      </div>
      <Field id="destinations" label="Where will you drive?" hint="Towns or cities, e.g. Accra, Cape Coast, Kumasi" error={errors.destinations}>
        {(p) => (
          <Textarea
            {...p}
            rows={2}
            maxLength={300}
            className="min-h-24 rounded-xl border-stone bg-white px-4 py-3 text-base"
            value={value.destinations ?? ""}
            onChange={(e) => set("destinations", e.target.value)}
          />
        )}
      </Field>
      <div>
        <p id="intercity-label" className="text-sm font-semibold text-ink">
          Will you travel between cities or regions?
        </p>
        <div role="radiogroup" aria-labelledby="intercity-label" className="mt-2 grid grid-cols-2 gap-2" id="intercity">
          {(["yes", "no"] as const).map((v) => (
            <label
              key={v}
              className={cn(
                "flex h-14 cursor-pointer items-center justify-center rounded-xl border text-base font-semibold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink",
                value.intercity === v ? "border-ink bg-ink text-white" : "border-stone bg-white hover:border-ink/40",
              )}
            >
              <input type="radio" name="intercity" value={v} checked={value.intercity === v} onChange={() => set("intercity", v)} className="sr-only" />
              {v === "yes" ? "Yes" : "No"}
            </label>
          ))}
        </div>
        {errors.intercity && <p className="mt-1.5 text-sm font-medium text-destructive">{errors.intercity}</p>}
      </div>
    </fieldset>
  )
}

export const TRIP_FIELD_LABELS: Record<string, string> = {
  drive: "Drive option",
  location: "Pickup location",
  pickupDate: "Pickup date",
  pickupTime: "Pickup time",
  returnDate: "Return date",
  returnTime: "Return time",
  destinations: "Destinations",
  intercity: "Intercity travel",
}

const TRIP_KEYS = ["location", "pickupDate", "pickupTime", "returnDate", "returnTime", "drive", "destinations", "intercity"] as const

export function tripToParams(trip: TripDraft, extra: Record<string, string | undefined> = {}) {
  const params = new URLSearchParams()
  for (const k of TRIP_KEYS) if (trip[k]) params.set(k, String(trip[k]))
  for (const [k, v] of Object.entries(extra)) if (v) params.set(k, v)
  return params
}

export function tripFromParams(params: URLSearchParams): TripDraft {
  const t: Record<string, string> = {}
  for (const k of TRIP_KEYS) {
    const v = params.get(k)
    if (v) t[k] = v
  }
  return t as TripDraft
}
