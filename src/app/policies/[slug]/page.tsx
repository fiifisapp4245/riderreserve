import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { ExternalLink } from "lucide-react"
import { Notice, PageHeader } from "@/components/ui-extras"
import { CHAUFFEUR_POLICY, journeyExclusions, SELF_DRIVE_POLICY } from "@/lib/domain/policy"

/**
 * Policy hub. Plain-language summaries are generated from the same policy
 * config used at checkout. Full legal texts are not rewritten here: until
 * RideReserve approves migrated copy, we link to the currently published texts.
 */
const POLICIES = {
  cancellation: { title: "Cancellation & refunds", source: null },
  terms: { title: "Terms & conditions", source: "https://ridereservegh.com/terms-and-conditions/" },
  "self-drive-agreement": { title: "Self-drive rental agreement", source: "https://ridereservegh.com/self-drive-rental-agreement/" },
  "chauffeur-agreement": {
    title: "Chauffeur-driven rental agreement",
    source: "https://ridereservegh.com/ridereserve-chauffeur-driven-rental-agreement/",
  },
  privacy: { title: "Privacy policy", source: "https://ridereservegh.com/privacy-policy/" },
} as const

type Slug = keyof typeof POLICIES

export function generateStaticParams() {
  return Object.keys(POLICIES).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = POLICIES[(await params).slug as Slug]
  return p ? { title: p.title } : {}
}

/** Streams the slug-dependent content so navigation stays instant. */
export default function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="container-page py-14" role="status" aria-label="Loading policy">
          <div className="h-10 w-72 animate-pulse rounded-lg bg-sand" />
          <div className="mt-8 h-64 animate-pulse rounded-2xl bg-sand" />
        </div>
      }
    >
      <PolicyContent params={params} />
    </Suspense>
  )
}

async function PolicyContent({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug as Slug
  const policy = POLICIES[slug]
  if (!policy) notFound()

  return (
    <>
      <PageHeader eyebrow="Policies" title={policy.title} />
      <div className="container-page grid gap-10 py-10 sm:py-14 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Policies" className="text-sm">
          <ul className="flex flex-wrap gap-2 lg:flex-col">
            {(Object.keys(POLICIES) as Slug[]).map((s) => (
              <li key={s}>
                <Link
                  href={`/policies/${s}`}
                  aria-current={s === slug ? "page" : undefined}
                  className="block rounded-lg px-3 py-2 hover:bg-muted aria-[current=page]:bg-brand-soft aria-[current=page]:font-semibold aria-[current=page]:text-brand"
                >
                  {POLICIES[s].title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <article className="flex max-w-3xl flex-col gap-8">
          {slug === "cancellation" ? <CancellationContent /> : <SummaryContent slug={slug} />}
          {policy.source && (
            <section className="rounded-2xl border p-5">
              <h2 className="text-lg font-bold">Full text</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                The complete, currently published version applies. It will move here once RideReserve approves the migrated copy.
              </p>
              <a href={policy.source} className="mt-3 inline-flex items-center gap-1 font-semibold underline">
                Read the full {policy.title.toLowerCase()} <ExternalLink aria-hidden className="size-4" />
              </a>
            </section>
          )}
        </article>
      </div>
    </>
  )
}

function CancellationContent() {
  return (
    <>
      <p className="text-lg text-muted-foreground">
        This is the single source for cancellation and amendment rules. Both rental agreements and checkout refer here.
      </p>
      <section>
        <h2 className="text-2xl font-bold">Self-drive bookings</h2>
        <table className="mt-4 w-full text-left text-sm">
          <caption className="sr-only">Self-drive refund by time before pickup</caption>
          <thead>
            <tr className="border-b">
              <th scope="col" className="py-2 font-semibold">
                When you cancel
              </th>
              <th scope="col" className="py-2 text-right font-semibold">
                Refund of amount paid
              </th>
            </tr>
          </thead>
          <tbody>
            {SELF_DRIVE_POLICY.tiers.map((t) => (
              <tr key={t.label} className="border-b">
                <td className="py-2">{t.label}</td>
                <td className="py-2 text-right font-medium">{t.percent}%</td>
              </tr>
            ))}
            <tr>
              <td className="py-2">At or after the pickup time, or no-show</td>
              <td className="py-2 text-right font-medium">0%</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3 text-sm text-muted-foreground">Times are measured against your pickup time in Ghana time (GMT).</p>
        <h3 className="mt-6 text-lg font-bold">Changing your booking</h3>
        <p className="mt-1 text-muted-foreground">{SELF_DRIVE_POLICY.amendment}</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Chauffeur bookings</h2>
        <Notice tone="warning" title="Being confirmed" className="mt-3">
          {CHAUFFEUR_POLICY.summary.join(" ")}
        </Notice>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Collection deposit (self-drive)</h2>
        <p className="mt-1 text-muted-foreground">
          The refundable deposit is paid at collection, separately from your online payment. It&apos;s returned after the vehicle and
          tracker are inspected. The return timeframe is being confirmed by RideReserve.
        </p>
      </section>
    </>
  )
}

function SummaryContent({ slug }: { slug: Exclude<Slug, "cancellation"> }) {
  const points: Record<typeof slug, string[]> = {
    terms: [
      "Applies to all RideReserve rentals and the use of this website.",
      "Cancellation and refunds: see the cancellation policy.",
    ],
    "self-drive-agreement": [
      "You must declare your destinations and routes. Material deviations may incur penalties.",
      "A refundable deposit is paid at collection and returned after inspection.",
      ...journeyExclusions("self-drive"),
      "Cancellation and refunds: see the cancellation policy.",
    ],
    "chauffeur-agreement": [...journeyExclusions("chauffeur"), "Cancellation and refunds: see the cancellation policy."],
    privacy: ["We use your contact details to manage your rental and contact you about it."],
  }
  return (
    <section>
      <h2 className="text-2xl font-bold">In short</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
        {points[slug].map((p) => (
          <li key={p}>{p.includes("cancellation policy") ? <CancelLink text={p} /> : p}</li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-muted-foreground">
        This summary doesn&apos;t replace the full text. Summary wording awaits RideReserve review.
      </p>
    </section>
  )
}

function CancelLink({ text }: { text: string }) {
  const [before] = text.split("the cancellation policy")
  return (
    <>
      {before}
      <Link href="/policies/cancellation" className="font-medium text-ink underline">
        the cancellation policy
      </Link>
      .
    </>
  )
}
