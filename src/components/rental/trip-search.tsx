"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { ErrorSummary } from "@/components/form"
import { Button } from "@/components/ui/button"
import { validateTrip } from "@/lib/domain/trip"
import { DriveSwitch, TRIP_FIELD_LABELS, TripFields, tripToParams, type TripDraft } from "./trip-fields"

/** Home-page trip search. No personal details needed to see categories and prices. */
export function TripSearch() {
  const router = useRouter()
  const [trip, setTrip] = useState<TripDraft>({ drive: "self-drive" })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const next = validateTrip(trip) as Record<string, string>
    setErrors(next)
    if (Object.keys(next).length) return
    router.push(`/rent?${tripToParams(trip, { step: "category" })}`)
  }

  return (
    <form onSubmit={submit} noValidate aria-label="Find a vehicle" className="flex flex-col gap-4">
      <DriveSwitch value={trip.drive} onChange={(drive) => setTrip({ ...trip, drive })} error={errors.drive} hint={false} />
      <div className="flex flex-col gap-4 rounded-2xl border border-stone bg-white p-4 sm:gap-5 sm:p-6">
        <p className="-mb-1 text-sm text-muted-foreground">
          {trip.drive === "chauffeur"
            ? "A RideReserve driver drives you. No licence needed."
            : "You drive. Bring your driving licence to collection."}
        </p>
        <ErrorSummary errors={errors} labels={TRIP_FIELD_LABELS} />
        <TripFields value={trip} onChange={setTrip} errors={errors} showDrive={false} showRules={false} />
        <Button type="submit" size="lg" className="w-full">
          Search vehicles <ArrowRight aria-hidden data-icon="inline-end" />
        </Button>
      </div>
    </form>
  )
}
