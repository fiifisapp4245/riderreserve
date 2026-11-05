import Image from "next/image"
import Link from "next/link"
import { CalendarX2, Check, UserRound } from "lucide-react"
import { StatusBadge } from "@/components/ui-extras"
import type { Availability } from "@/lib/domain/availability"
import type { VehicleCategory } from "@/lib/domain/categories"
import { formatLocalDate, formatLocalTime } from "@/lib/domain/time"
import { formatGHS, type Quote } from "@/lib/domain/pricing"
import { cn } from "@/lib/utils"

export function DriveBadges({ category }: { category: VehicleCategory }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {category.drive.includes("self-drive") ? (
        <StatusBadge tone="neutral">Self-drive</StatusBadge>
      ) : null}
      <StatusBadge tone="neutral">
        <UserRound aria-hidden className="mr-1 size-3" />
        {category.drive.includes("self-drive") ? "Chauffeur" : "Chauffeur only"}
      </StatusBadge>
    </div>
  )
}

export function CategoryCard({
  category,
  quote,
  action,
  selected,
  status,
  headingLevel = "h3",
}: {
  category: VehicleCategory
  quote?: Quote
  action?: React.ReactNode
  selected?: boolean
  /** Live fleet status line, e.g. which locations have this category out. */
  status?: React.ReactNode
  headingLevel?: "h2" | "h3"
}) {
  const Heading = headingLevel
  const hero = category.photos[0]
  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border bg-white transition-colors",
        selected ? "border-ink" : "border-stone hover:border-ink/40",
      )}
    >
      <div className="relative aspect-[16/10] bg-sand">
        <Image src={hero.src} alt={hero.alt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <Heading className="text-xl font-bold">{category.name}</Heading>
          <DriveBadges category={category} />
        </div>
        <p className="text-muted-foreground">{category.summary}</p>
        <ul className="space-y-1 text-sm">
          {category.suitedFor.map((s) => (
            <li key={s} className="flex items-center gap-2">
              <Check aria-hidden className="size-4 text-success" /> {s}
            </li>
          ))}
        </ul>
        {status}
        {quote && <QuoteSummary quote={quote} />}
        <div className="mt-auto flex flex-col gap-2 pt-2">
          {action}
          <Link href={`/vehicles/${category.id}`} className="text-center text-sm font-medium text-ink underline underline-offset-2">
            {category.name} details and photos
          </Link>
        </div>
      </div>
    </article>
  )
}

export function QuoteSummary({ quote }: { quote: Quote }) {
  if (quote.kind === "on-request") {
    return (
      <div className="rounded-xl bg-muted p-3 text-sm">
        <p className="font-semibold text-ink">Price on request</p>
        <p className="text-muted-foreground">
          Online prices aren&apos;t available yet for {quote.rentalDays} day{quote.rentalDays === 1 ? "" : "s"}. Request a quote and we&apos;ll
          confirm.
        </p>
      </div>
    )
  }
  return (
    <div className="rounded-xl bg-muted p-3 text-sm">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-muted-foreground">
          {quote.rentalDays} day{quote.rentalDays === 1 ? "" : "s"} · pay online
        </span>
        <span className="text-lg font-bold text-ink">{formatGHS(quote.payNow)}</span>
      </div>
      <p className="text-muted-foreground">{formatGHS(quote.dailyRate)} per day</p>
      <p className="mt-1 text-muted-foreground">
        {quote.collectionDeposit.status === "observed" && quote.collectionDeposit.amount !== null ? (
          <>+ {formatGHS(quote.collectionDeposit.amount)} refundable deposit at collection</>
        ) : quote.collectionDeposit.status === "unresolved" ? (
          <>+ refundable deposit at collection (amount to be confirmed)</>
        ) : (
          <>Chauffeur rental deposit: to be confirmed</>
        )}
      </p>
      {quote.source === "demo" && <p className="mt-1 text-xs font-semibold text-warning">Sample price — demo only</p>}
    </div>
  )
}

/** Perk-style result row: photo, category, notes, price column with Select. */
export function CategoryRow({
  category,
  quote,
  action,
  selected,
  availability,
}: {
  category: VehicleCategory
  quote: Quote
  action: React.ReactNode
  selected?: boolean
  availability: Availability
}) {
  const hero = category.photos[0]
  const taken = availability.status === "unavailable"
  return (
    <article
      aria-labelledby={`cat-${category.id}`}
      aria-describedby={`avail-${category.id}`}
      className={cn(
        "grid gap-4 rounded-2xl border p-4 sm:grid-cols-[11rem_1fr_13rem] sm:items-center sm:gap-6 sm:p-5",
        taken ? "border-stone bg-sand/60" : "bg-white",
        !taken && (selected ? "border-ink" : "border-stone"),
      )}
    >
      <div className="grid grid-cols-[6.5rem_1fr] items-center gap-4 sm:contents">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-sand">
          <Image
            src={hero.src}
            alt={hero.alt}
            fill
            sizes="(min-width: 640px) 11rem, 6.5rem"
            className={cn("object-cover", taken && "opacity-60 grayscale")}
          />
        </div>
        <div className="min-w-0">
          <h2 id={`cat-${category.id}`} className="text-xl font-bold">
            {category.name} <span className="font-sans text-sm font-normal text-muted-foreground">or similar</span>
          </h2>
          <AvailabilityLine id={`avail-${category.id}`} availability={availability} />
          <p className="mt-2 hidden text-sm text-ink/80 sm:block">{category.summary}</p>
          <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
            {category.suitedFor.slice(0, 2).map((s) => (
              <span key={s} className="inline-flex items-center gap-1 text-ink/80">
                <Check aria-hidden className="size-3.5 text-success" /> {s}
              </span>
            ))}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3 border-t border-stone pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
        <div className={cn(taken && "opacity-60")}>
          <RowPrice quote={quote} />
        </div>
        {action}
      </div>
    </article>
  )
}

function RowPrice({ quote }: { quote: Quote }) {
  if (quote.kind === "on-request") {
    return (
      <div>
        <p className="text-lg font-bold">Price on request</p>
        <p className="text-sm text-muted-foreground">
          {quote.rentalDays} day{quote.rentalDays === 1 ? "" : "s"}
        </p>
      </div>
    )
  }
  const deposit = quote.collectionDeposit
  return (
    <div>
      <p className="flex items-baseline justify-between gap-3 sm:block">
        <span className="text-sm text-muted-foreground">
          {quote.rentalDays} day{quote.rentalDays === 1 ? "" : "s"} · pay online
        </span>
        <span className="block text-2xl font-bold tracking-tight whitespace-nowrap tabular-nums">{formatGHS(quote.payNow)}</span>
      </p>
      <div className="mt-1 text-sm text-muted-foreground">
        {deposit.amount !== null ? (
          <>+ {formatGHS(deposit.amount)} deposit at pick-up</>
        ) : deposit.status === "unresolved" ? (
          <>+ deposit at pick-up (TBC)</>
        ) : (
          <>Deposit: to be confirmed</>
        )}
        {quote.source === "demo" && <span className="block text-xs font-semibold text-warning">Sample price</span>}
      </div>
    </div>
  )
}

/** "Thu 8 Nov, 2:00 PM" in Ghana time. */
export function formatUntil(at: Date) {
  return `${formatLocalDate(at, { year: undefined })}, ${formatLocalTime(at)}`
}

/** Availability is stated in words and icon, never by colour alone. */
function AvailabilityLine({ id, availability }: { id: string; availability: Availability }) {
  if (availability.status === "available") {
    return (
      <p id={id} className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-semibold text-success">
        <Check aria-hidden className="size-4" /> Available for your dates
      </p>
    )
  }
  if (availability.status === "unavailable") {
    return (
      <div id={id} className="mt-1.5 flex flex-col gap-1">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-warning-soft px-2.5 py-1 text-sm font-semibold text-warning">
          <CalendarX2 aria-hidden className="size-4" /> Taken for your dates
        </span>
        <span className="text-sm text-ink/80">
          {availability.reason}. Back from {formatUntil(new Date(availability.availableFrom))}.
        </span>
      </div>
    )
  }
  return (
    <p id={id} className="mt-1.5 text-sm text-muted-foreground">
      Availability confirmed by our team after you book.
    </p>
  )
}
