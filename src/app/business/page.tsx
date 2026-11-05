import type { Metadata } from "next"
import { BusinessEnquiry } from "@/components/business-enquiry"
import { PageHeader } from "@/components/ui-extras"
import { CONTACT } from "@/lib/domain/business"

export const metadata: Metadata = {
  title: "Business & long-term rentals",
  description: "Request a quote for fleet, project or long-term vehicle rentals — for companies and individuals.",
}

const STAGES = [
  { title: "Send your request", text: "Tell us the vehicles, duration and location you need." },
  { title: "We prepare a quote", text: "Our team checks availability and prices your request." },
  { title: "Confirm", text: "Vehicles are reserved once you accept the quote." },
]

export default function BusinessPage() {
  return (
    <>
      <PageHeader eyebrow="Business & long-term" title="Fleet, project and long-term rentals">
        For companies <em>and</em> individuals who need vehicles for weeks or months, or several vehicles at once. This is a quote
        request, not an instant booking.
      </PageHeader>
      <div className="container-page grid gap-10 py-10 sm:py-14 lg:grid-cols-[1fr_320px]">
        <BusinessEnquiry />
        <aside className="flex flex-col gap-4 lg:order-last">
          <div className="rounded-2xl border p-5">
            <h2 className="text-lg font-bold">How it works</h2>
            <ol className="mt-3 space-y-4">
              {STAGES.map((s, i) => (
                <li key={s.title} className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <span>
                    <span className="block font-semibold">{s.title}</span>
                    <span className="text-sm text-muted-foreground">{s.text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <p className="text-sm text-muted-foreground">
            Prefer to talk? Call or WhatsApp {CONTACT.phoneDisplay}, or email {CONTACT.email}.
          </p>
        </aside>
      </div>
    </>
  )
}
