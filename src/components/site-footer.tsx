import Link from "next/link"
import { Mail, MessageCircle, Phone } from "lucide-react"
import { CONTACT, LOCATIONS, SERVICE_HOURS, SOCIAL_LINKS } from "@/lib/domain/business"

const POLICY_LINKS = [
  { href: "/policies/cancellation", label: "Cancellation & refunds" },
  { href: "/policies/terms", label: "Terms & conditions" },
  { href: "/policies/self-drive-agreement", label: "Self-drive agreement" },
  { href: "/policies/chauffeur-agreement", label: "Chauffeur agreement" },
  { href: "/policies/privacy", label: "Privacy policy" },
]

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-ink text-white/80">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 className="text-base font-semibold text-white">Contact us</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href={`tel:${CONTACT.phoneE164}`} className="inline-flex items-center gap-2 hover:text-white">
                <Phone aria-hidden className="size-4" /> Call {CONTACT.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={CONTACT.whatsappUrl} className="inline-flex items-center gap-2 hover:text-white">
                <MessageCircle aria-hidden className="size-4" /> WhatsApp {CONTACT.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACT.email}`} className="inline-flex items-center gap-2 hover:text-white">
                <Mail aria-hidden className="size-4" /> {CONTACT.email}
              </a>
            </li>
          </ul>
          {SOCIAL_LINKS.length > 0 && (
            <ul className="mt-4 flex gap-3 text-sm">
              {SOCIAL_LINKS.map((s) => (
                <li key={s.href}>
                  <a href={s.href} className="hover:text-white">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Hours</h2>
          <dl className="mt-4 space-y-3 text-sm">
            {SERVICE_HOURS.map((h) => (
              <div key={h.id}>
                <dt className="text-white/60">{h.label}</dt>
                <dd className="font-medium text-white">{h.hours}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Pickup locations</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {LOCATIONS.map((l) => (
              <li key={l.id}>
                {l.name} <span className="text-white/60">· {l.city}</span>
              </li>
            ))}
          </ul>
          <h2 className="mt-6 text-base font-semibold text-white">Company</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/about" className="hover:text-white">
                About RideReserve
              </Link>
            </li>
            <li>
              <Link href="/business" className="hover:text-white">
                Business & long-term rentals
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Policies</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {POLICY_LINKS.map((p) => (
              <li key={p.href}>
                <Link href={p.href} className="hover:text-white">
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page py-5 text-sm text-white/60">© 2026 RideReserve. Car rental in Ghana.</div>
      </div>
    </footer>
  )
}
