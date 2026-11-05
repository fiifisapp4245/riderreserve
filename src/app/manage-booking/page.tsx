import type { Metadata } from "next"
import { ManageBooking } from "@/components/manage-booking"
import { PageHeader } from "@/components/ui-extras"

export const metadata: Metadata = {
  title: "Manage booking",
  description: "View, change or cancel your RideReserve booking. No account needed.",
}

export default function ManageBookingPage() {
  return (
    <>
      <PageHeader eyebrow="Manage booking" title="View or manage your booking">
        No account needed. We verify it&apos;s you with a one-time code.
      </PageHeader>
      <div className="container-page py-10 sm:py-14">
        <ManageBooking />
      </div>
    </>
  )
}
