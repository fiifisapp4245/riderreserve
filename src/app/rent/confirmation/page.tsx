import type { Metadata } from "next"
import { Suspense } from "react"
import { BookingStatusView } from "@/components/rental/booking-status"

export const metadata: Metadata = { title: "Booking status", robots: { index: false } }

export default function ConfirmationPage() {
  return (
    <div className="container-page max-w-3xl py-10 sm:py-14">
      <Suspense>
        <BookingStatusView />
      </Suspense>
    </div>
  )
}
