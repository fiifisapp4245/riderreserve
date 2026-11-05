import type { Metadata } from "next"
import { Suspense } from "react"
import { RentFlow } from "@/components/rental/rent-flow"

export const metadata: Metadata = {
  title: "Find a vehicle",
  description: "Choose your pickup location, dates and drive option to compare vehicle categories and prices.",
}

export default function RentPage() {
  return (
    <div className="container-page py-8 sm:py-12">
      <Suspense>
        <RentFlow />
      </Suspense>
    </div>
  )
}
