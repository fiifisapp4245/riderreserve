import type { Metadata } from "next"
import { Suspense } from "react"
import { DemoCheckout } from "@/components/rental/demo-checkout"

export const metadata: Metadata = { title: "Demo payment", robots: { index: false } }

export default function DemoPaymentPage({ params }: { params: Promise<{ paymentId: string }> }) {
  return (
    <div className="container-page max-w-lg py-12">
      <Suspense>
        <DemoCheckout params={params} />
      </Suspense>
    </div>
  )
}
