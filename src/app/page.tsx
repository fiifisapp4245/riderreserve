import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Info } from "lucide-react"
import { BookingRules } from "@/components/rental/trip-fields"
import { TripSearch } from "@/components/rental/trip-search"
import { ButtonLink } from "@/components/ui-extras"
import { CONTACT } from "@/lib/domain/business"
import { CATEGORIES } from "@/lib/domain/categories"
import { SELF_DRIVE_POLICY } from "@/lib/domain/policy"

export default function Home() {
  return (
    <>
      <section aria-labelledby="hero" className="bg-sand">
        <div className="mx-auto flex w-full max-w-[40rem] flex-col gap-4 px-4 pt-6 pb-12 sm:gap-6 sm:pt-16 sm:pb-16">
          <div className="text-center">
            <h1 id="hero" className="text-[1.75rem] leading-tight font-bold sm:text-5xl">
              Where are you headed?
            </h1>
            <p className="mx-auto mt-3 hidden max-w-md text-lg text-ink/70 sm:block">
              Rent a car in Accra, Kumasi or Takoradi. Drive yourself or ride with a RideReserve chauffeur.
            </p>
          </div>
          <TripSearch />
          <div className="flex items-start gap-2.5 rounded-xl border border-info/15 bg-info-soft px-4 py-3 text-sm text-ink">
            <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-info" />
            <div>
              <p>No account needed. You&apos;ll see prices and what&apos;s due at collection before you share any personal details.</p>
              <BookingRules className="mt-1 text-ink/70" />
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="categories" className="mx-auto w-full max-w-3xl px-4 py-14 sm:py-20">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="categories" className="text-2xl font-bold sm:text-3xl">
            Vehicle categories
          </h2>
          <Link href="/vehicles" className="inline-flex min-h-11 items-center gap-1 font-semibold text-ink underline decoration-brand decoration-2 underline-offset-4">
            Compare in detail <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
        <p className="mt-2 text-muted-foreground">You book a category. The make, model and colour you get may differ from the photo.</p>

        <ul className="mt-6 divide-y divide-stone border-y border-stone">
          {CATEGORIES.map((c) => (
            <li key={c.id}>
              <Link
                href={`/rent?step=trip&drive=${c.drive[0]}&category=${c.id}`}
                className="group grid grid-cols-[6.5rem_1fr] items-center gap-4 py-4 sm:grid-cols-[10rem_1fr_auto] sm:gap-6"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-sand">
                  <Image src={c.photos[0].src} alt="" fill sizes="10rem" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold">
                    {c.name} <span className="font-sans text-sm font-normal text-muted-foreground">or similar</span>
                  </h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{c.summary}</p>
                  <p className="mt-2 text-sm font-medium text-ink/80">
                    {c.drive.includes("self-drive") ? "Self-drive or with chauffeur" : "With chauffeur only"}
                  </p>
                  <span className="mt-2 inline-flex min-h-11 items-center gap-1 font-semibold text-ink underline decoration-brand decoration-2 underline-offset-4 sm:hidden">
                    Check prices <ArrowRight aria-hidden className="size-4" />
                  </span>
                </div>
                <span className="hidden min-h-11 items-center gap-1 font-semibold text-ink underline decoration-stone decoration-2 underline-offset-4 group-hover:decoration-brand sm:inline-flex">
                  Check prices <ArrowRight aria-hidden className="size-4" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Before you book" className="border-t border-stone bg-sand">
        <div className="mx-auto grid w-full max-w-3xl gap-10 px-4 py-14 sm:grid-cols-2 sm:py-16">
          <div>
            <h2 className="text-xl font-bold">What to bring</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="font-semibold">Self-drive</dt>
                <dd className="mt-0.5 text-muted-foreground">
                  Original Ghana Card or passport, your driving licence, and a refundable deposit paid at collection.
                </dd>
              </div>
              <div>
                <dt className="font-semibold">With chauffeur</dt>
                <dd className="mt-0.5 text-muted-foreground">Original Ghana Card or passport. No driving licence needed.</dd>
              </div>
            </dl>
          </div>
          <div>
            <h2 className="text-xl font-bold">If plans change</h2>
            <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
              {SELF_DRIVE_POLICY.summary.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <Link href="/policies/cancellation" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4">
              Self-drive and chauffeur cancellation terms
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="business" className="mx-auto w-full max-w-3xl px-4 py-14 sm:py-16">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="business" className="text-xl font-bold sm:text-2xl">
              Several vehicles, or renting for months?
            </h2>
            <p className="mt-1 text-muted-foreground">
              Companies and individuals can request a quote. Or call or WhatsApp {CONTACT.phoneDisplay}.
            </p>
          </div>
          <ButtonLink href="/business" variant="outline" size="lg" className="shrink-0">
            Request a quote
          </ButtonLink>
        </div>
      </section>
    </>
  )
}
