import type { Metadata } from "next"
import Link from "next/link"
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ButtonLink, PageHeader } from "@/components/ui-extras"
import { BOOKING_RULES, CONTACT, LOCATIONS, SERVICE_HOURS } from "@/lib/domain/business"
import { SELF_DRIVE_POLICY } from "@/lib/domain/policy"

export const metadata: Metadata = { title: "Help & contact", description: "Contact RideReserve by phone, WhatsApp or email." }

const FAQ = [
  {
    q: "Do I need an account to book?",
    a: "No. You can book as a guest. You'll get a booking reference and can manage your booking by verifying your phone number or email.",
  },
  {
    q: "Does a chauffeur passenger need a driving licence?",
    a: "No. A driving licence is only required for self-drive rentals. Chauffeur customers need valid ID.",
  },
  {
    q: "Can I return the car to a different location?",
    a: "Rentals return to the same location where you collected the vehicle.",
  },
  {
    q: "How far ahead can I book?",
    a: `Online, at least ${BOOKING_RULES.minLeadHours} hours and up to ${BOOKING_RULES.maxAdvanceDays} days before pickup. For other dates, contact us.`,
  },
  {
    q: "Can I change my booking?",
    a: SELF_DRIVE_POLICY.amendment + " Chauffeur bookings: contact us.",
  },
  {
    q: "I lost my booking reference.",
    a: "Go to Manage booking and choose \"I don't have my booking reference\". We'll send a code to the phone or email you booked with.",
  },
]

export default function HelpPage() {
  return (
    <>
      <PageHeader eyebrow="Help" title="How can we help?">
        Reach us by phone, WhatsApp or email. Check the hours below — they differ by service.
      </PageHeader>
      <div className="container-page grid gap-10 py-10 sm:py-14 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-10">
          <section id="contact" aria-labelledby="contact-h" className="scroll-mt-24">
            <h2 id="contact-h" className="text-2xl font-bold">
              Contact us
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <ButtonLink href={`tel:${CONTACT.phoneE164}`} size="lg" variant="outline" className="h-auto flex-col items-start gap-1 py-4 whitespace-normal">
                <Phone aria-hidden className="size-5 text-brand" />
                <span className="font-semibold">Call</span>
                <span className="text-sm text-muted-foreground">{CONTACT.phoneDisplay}</span>
              </ButtonLink>
              <ButtonLink href={CONTACT.whatsappUrl} size="lg" variant="outline" className="h-auto flex-col items-start gap-1 py-4 whitespace-normal">
                <MessageCircle aria-hidden className="size-5 text-brand" />
                <span className="font-semibold">WhatsApp</span>
                <span className="text-sm text-muted-foreground">{CONTACT.phoneDisplay}</span>
              </ButtonLink>
              <ButtonLink href={`mailto:${CONTACT.email}`} size="lg" variant="outline" className="h-auto flex-col items-start gap-1 py-4 whitespace-normal">
                <Mail aria-hidden className="size-5 text-brand" />
                <span className="font-semibold">Email</span>
                <span className="text-sm break-all text-muted-foreground">{CONTACT.email}</span>
              </ButtonLink>
            </div>
            <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
              <li>
                <strong className="text-ink">About a booking?</strong> Have your booking reference ready, or{" "}
                <Link href="/manage-booking" className="underline">
                  manage it online
                </Link>
                .
              </li>
              <li>
                <strong className="text-ink">Fleet or long-term rental?</strong>{" "}
                <Link href="/business" className="underline">
                  Send a quote request
                </Link>
                .
              </li>
            </ul>
          </section>

          <section aria-labelledby="faq-h">
            <h2 id="faq-h" className="text-2xl font-bold">
              Common questions
            </h2>
            <Accordion className="mt-4">
              {FAQ.map((f) => (
                <AccordionItem key={f.q} value={f.q}>
                  <AccordionTrigger className="text-base">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border p-5">
            <h2 className="text-lg font-bold">Hours</h2>
            <dl className="mt-3 space-y-4">
              {SERVICE_HOURS.map((h) => (
                <div key={h.id}>
                  <dt className="font-semibold">{h.label}</dt>
                  <dd className="text-sm">
                    {h.hours}
                    <span className="block text-muted-foreground">{h.detail}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-2xl border p-5">
            <h2 className="text-lg font-bold">Pickup locations</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {LOCATIONS.map((l) => (
                <li key={l.id} className="flex gap-2">
                  <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-brand" />
                  <span>
                    {l.name}
                    <span className="block text-muted-foreground">
                      {l.city}, {l.region} Region
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-muted-foreground">Office: {CONTACT.officeAddress}</p>
          </div>
        </aside>
      </div>
    </>
  )
}
