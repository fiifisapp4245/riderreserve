import type { Metadata } from "next"
import { Bricolage_Grotesque, Inter } from "next/font/google"
import { SiteFooter } from "@/components/site-footer"
import { Suspense } from "react"
import { SiteHeader, SiteHeaderView } from "@/components/site-header"
import { isDemoMode } from "@/lib/domain/pricing"
import "./globals.css"

// Same type pairing as CashPath: Inter for UI/body, Bricolage Grotesque for headings.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" })

export const metadata: Metadata = {
  title: { default: "RideReserve | Car rental in Ghana", template: "%s | RideReserve" },
  description:
    "Rent a car in Accra, Kumasi or Takoradi. Self-drive or with a chauffeur. Compare categories and see what you pay before you book.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GH" className={`${inter.variable} ${bricolage.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white">
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          Skip to content
        </a>
        {isDemoMode() && (
          <div className="bg-warning-soft text-center text-sm text-warning">
            <p className="container-page py-2">
              <strong>Demo mode.</strong> Prices, payments and booking codes are simulated. Nothing is booked or charged.
            </p>
          </div>
        )}
        <Suspense fallback={<SiteHeaderView pathname="" />}>
          <SiteHeader />
        </Suspense>
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  )
}
