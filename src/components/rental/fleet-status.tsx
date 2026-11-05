"use client"

import { useEffect, useState } from "react"
import { CalendarX2, Check } from "lucide-react"
import { categoryStatusNow } from "@/app/actions"
import type { CategoryId } from "@/lib/domain/categories"
import { formatUntil } from "./category-card"

type Status = Awaited<ReturnType<typeof categoryStatusNow>>

/** Where this category is out right now (e.g. on an airport transfer). Fetched live; never cached. */
export function FleetStatus({ categoryId }: { categoryId: CategoryId }) {
  const [status, setStatus] = useState<Status | undefined>()
  useEffect(() => {
    categoryStatusNow(categoryId).then(setStatus)
  }, [categoryId])

  if (status === undefined) return <p className="h-5 text-sm text-muted-foreground" aria-hidden />
  if (status === null) return <p className="text-sm text-muted-foreground">Availability depends on your dates and location.</p>
  if (status.length === 0) {
    return (
      <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-success">
        <Check aria-hidden className="size-4" /> Available at all pick-up points today
      </p>
    )
  }
  return (
    <ul className="space-y-1.5 text-sm">
      {status.map((s) => (
        <li key={s.location} className="flex items-start gap-1.5">
          <CalendarX2 aria-hidden className="mt-0.5 size-4 shrink-0 text-warning" />
          <span>
            <span className="font-semibold text-warning">Taken at {s.location}</span>
            <span className="block text-ink/80">
              {s.reason}. Back from {formatUntil(new Date(s.until))}.
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}
