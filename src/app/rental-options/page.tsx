import type { Metadata } from "next"
import Link from "next/link"
import { Car, UserRound } from "lucide-react"
import { ButtonLink, PageHeader } from "@/components/ui-extras"
import { eligibleCategories } from "@/lib/domain/categories"
import { documentRequirements, journeyExclusions, policyFor } from "@/lib/domain/policy"

export const metadata: Metadata = {
  title: "Rental options",
  description: "Self-drive or with a chauffeur: what's included, what you need and how cancellation works.",
}

const OPTIONS = [
  {
    id: "self-drive" as const,
    icon: Car,
    title: "Self-drive",
    lead: "You drive the vehicle yourself, on the routes you declare when booking.",
  },
  {
    id: "chauffeur" as const,
    icon: UserRound,
    title: "With chauffeur",
    lead: "A RideReserve chauffeur drives you. Good for business travel, events and long journeys.",
  },
]

export default function RentalOptionsPage() {
  return (
    <>
      <PageHeader eyebrow="Rental options" title="Self-drive or with a chauffeur">
        Both options start from the same pickup locations. Here&apos;s how they differ.
      </PageHeader>
      <div className="container-page grid gap-6 py-10 sm:py-14 lg:grid-cols-2">
        {OPTIONS.map((o) => {
          const policy = policyFor(o.id)
          return (
            <section key={o.id} aria-labelledby={o.id} className="flex flex-col gap-5 rounded-2xl border p-6">
              <o.icon aria-hidden className="size-8 text-brand" />
              <div>
                <h2 id={o.id} className="text-2xl font-bold">
                  {o.title}
                </h2>
                <p className="mt-1 text-muted-foreground">{o.lead}</p>
              </div>
              <div>
                <h3 className="font-semibold">Categories</h3>
                <p className="text-sm text-muted-foreground">{eligibleCategories(o.id).map((c) => c.name).join(", ")}</p>
              </div>
              <div>
                <h3 className="font-semibold">Bring to collection</h3>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {documentRequirements(o.id).map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">Not included in the price</h3>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {journeyExclusions(o.id).map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">Cancellation</h3>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {policy.summary.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
                <p className="mt-2 text-sm text-muted-foreground">{policy.amendment}</p>
              </div>
              <ButtonLink href={`/rent?step=trip&drive=${o.id}`} size="lg" className="mt-auto">
                Find a {o.id === "self-drive" ? "self-drive" : "chauffeur"} vehicle
              </ButtonLink>
            </section>
          )
        })}
      </div>
      <div className="container-page pb-14">
        <p className="text-muted-foreground">
          Renting for weeks or months, or need several vehicles?{" "}
          <Link href="/business" className="font-semibold text-ink underline">
            Request a business or long-term quote
          </Link>
          .
        </p>
      </div>
    </>
  )
}
