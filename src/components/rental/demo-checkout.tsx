"use client"

import { use, useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { demoPaymentInfo, demoSetPaymentOutcome } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Notice } from "@/components/ui-extras"
import { formatGHS } from "@/lib/domain/pricing"

type Info = Awaited<ReturnType<typeof demoPaymentInfo>>

/**
 * DEMO ONLY. Stands in for the payment provider's hosted checkout so every
 * outcome can be tested. The real integration redirects to the provider and
 * confirms via server-side verification / webhook, never via this page.
 */
export function DemoCheckout({ params }: { params: Promise<{ paymentId: string }> }) {
  const { paymentId } = use(params)
  const router = useRouter()
  const [info, setInfo] = useState<Info | undefined>()
  const [pending, start] = useTransition()

  useEffect(() => {
    demoPaymentInfo(paymentId).then(setInfo)
  }, [paymentId])

  const choose = (outcome: "succeeded" | "failed" | "cancelled" | "pending") =>
    start(async () => {
      const ref = await demoSetPaymentOutcome(paymentId, outcome)
      if (ref) router.push(`/rent/confirmation?ref=${encodeURIComponent(ref)}`)
    })

  if (info === undefined) {
    return (
      <p role="status" className="flex items-center gap-2 text-muted-foreground">
        <Loader2 aria-hidden className="size-5 animate-spin" /> Loading payment…
      </p>
    )
  }
  if (info === null) {
    return <Notice tone="error" title="Payment not found">This payment link has expired or isn&apos;t yours.</Notice>
  }

  return (
    <div className="flex flex-col gap-6 rounded-2xl border-2 border-dashed border-warning p-6">
      <div>
        <p className="text-sm font-semibold tracking-wide text-warning uppercase">Simulated payment provider</p>
        <h1 className="mt-1 text-2xl font-bold">Pay {formatGHS(info.amount)}</h1>
        <p className="mt-1 text-muted-foreground">Booking {info.bookingRef}. No money moves in demo mode. Choose an outcome to test.</p>
      </div>
      <div className="grid gap-2">
        <Button size="lg" disabled={pending} onClick={() => choose("succeeded")}>
          Payment succeeds
        </Button>
        <Button size="lg" variant="outline" disabled={pending} onClick={() => choose("pending")}>
          Callback delayed (stays pending)
        </Button>
        <Button size="lg" variant="outline" disabled={pending} onClick={() => choose("failed")}>
          Payment fails
        </Button>
        <Button size="lg" variant="ghost" disabled={pending} onClick={() => choose("cancelled")}>
          Customer cancels
        </Button>
      </div>
    </div>
  )
}
