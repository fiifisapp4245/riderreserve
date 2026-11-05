import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Check, ChevronLeft } from "lucide-react"
import { DriveBadges } from "@/components/rental/category-card"
import { FleetStatus } from "@/components/rental/fleet-status"
import { PhotoGallery } from "@/components/rental/photo-gallery"
import { ButtonLink, Notice, Unverified } from "@/components/ui-extras"
import { CATEGORIES, getCategory } from "@/lib/domain/categories"
import { documentRequirements, journeyExclusions } from "@/lib/domain/policy"
import { formatGHS } from "@/lib/domain/pricing"

type Params = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.id }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const c = getCategory((await params).slug)
  return c ? { title: `${c.name} rental`, description: c.summary } : {}
}

/** The shell renders instantly; the slug-dependent body streams in behind a skeleton. */
export default function CategoryPage({ params }: Params) {
  return (
    <div className="container-page py-8 sm:py-12">
      <Link href="/vehicles" className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-muted-foreground hover:text-ink">
        <ChevronLeft aria-hidden className="size-4" /> All vehicles
      </Link>
      <Suspense fallback={<DetailSkeleton />}>
        <CategoryDetail params={params} />
      </Suspense>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="mt-4 grid gap-10 lg:grid-cols-[1fr_380px]" role="status" aria-label="Loading vehicle">
      <div className="flex flex-col gap-6">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-sand" />
        <div className="aspect-[16/9] animate-pulse rounded-2xl bg-sand" />
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-sand" />
    </div>
  )
}

async function CategoryDetail({ params }: Params) {
  const category = getCategory((await params).slug)
  if (!category) notFound()
  const selfDrive = category.drive.includes("self-drive")

  return (
    <div className="mt-4 grid gap-10 lg:grid-cols-[1fr_380px]">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-4xl font-bold">{category.name}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{category.summary}</p>
          <div className="mt-3">
            <DriveBadges category={category} />
          </div>
        </div>
        <PhotoGallery photos={category.photos} name={category.name} />
        <section>
          <h2 className="text-2xl font-bold">Good for</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-3">
            {category.suitedFor.map((s) => (
              <li key={s} className="flex items-center gap-2 rounded-xl border border-stone p-3 text-sm">
                <Check aria-hidden className="size-4 shrink-0 text-success" /> {s}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-ink p-5">
          <h2 className="text-lg font-bold">Price</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Charged per day (each started 24 hours). Enter your trip to see the total and what&apos;s due at pick-up.
          </p>
          {selfDrive && (
            <p className="mt-3 text-sm">
              <span className="font-semibold">Self-drive deposit at pick-up: </span>
              {category.selfDriveDeposit.amount !== null ? `${formatGHS(category.selfDriveDeposit.amount)}, refundable` : <Unverified />}
            </p>
          )}
          <div className="mt-4 border-t border-stone pt-4">
            <h3 className="mb-2 text-sm font-semibold">Right now</h3>
            <FleetStatus categoryId={category.id} />
          </div>
          <ButtonLink href={`/rent?step=trip&drive=${category.drive[0]}&category=${category.id}`} size="lg" className="mt-4 w-full">
            Check prices and book
          </ButtonLink>
        </div>
        {!selfDrive && <Notice title="Chauffeur only">This category is only available with a RideReserve chauffeur.</Notice>}
        {category.drive.map((d) => (
          <div key={d} className="rounded-2xl border border-stone p-5 text-sm">
            <h2 className="text-base font-bold">{d === "self-drive" ? "Self-drive" : "With chauffeur"}: what you need</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {documentRequirements(d).map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <h3 className="mt-3 font-semibold">Not included</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
              {journeyExclusions(d).map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        ))}
      </aside>
    </div>
  )
}
