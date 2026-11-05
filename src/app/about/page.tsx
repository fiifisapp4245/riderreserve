import type { Metadata } from "next"
import { ButtonLink, Notice, PageHeader } from "@/components/ui-extras"
import { CONTACT, LOCATIONS } from "@/lib/domain/business"
import { CATEGORIES } from "@/lib/domain/categories"

export const metadata: Metadata = { title: "About", description: "RideReserve car rental in Ghana." }

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="About" title="About RideReserve">
        Car rental in Ghana — self-drive or with a chauffeur.
      </PageHeader>
      <div className="container-page grid gap-10 py-10 sm:py-14 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6 text-lg">
          <Notice tone="warning" title="Content to be supplied by RideReserve">
            The company story, operator details and service evidence need approved copy. The previous About page repeated the same
            story twice; this page consolidates it into one section once supplied.
          </Notice>
          <section>
            <h2 className="text-2xl font-bold">What we offer</h2>
            <p className="mt-2 text-muted-foreground">
              Self-drive and chauffeur-driven rentals across {CATEGORIES.length} vehicle categories, plus business and long-term rentals
              for companies and individuals.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold">Where we operate</h2>
            <ul className="mt-2 list-disc pl-6 text-muted-foreground">
              {LOCATIONS.map((l) => (
                <li key={l.id}>
                  {l.name}, {l.city}
                </li>
              ))}
            </ul>
          </section>
        </div>
        <aside className="rounded-2xl border p-5">
          <h2 className="text-lg font-bold">Talk to us</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {CONTACT.phoneDisplay} · {CONTACT.email}
          </p>
          <ButtonLink href="/help#contact" className="mt-4 w-full" size="lg">
            Contact our team
          </ButtonLink>
        </aside>
      </div>
    </>
  )
}
