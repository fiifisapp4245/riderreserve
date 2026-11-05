import type { Metadata } from "next"
import { ButtonLink, Notice, PageHeader } from "@/components/ui-extras"

export const metadata: Metadata = { title: "Sign in" }

/**
 * Optional accounts aren't connected yet (no auth provider chosen — see
 * docs/DECISIONS.md). This page says so truthfully instead of faking sign-in.
 */
export default function SignInPage() {
  return (
    <>
      <PageHeader title="Sign in">An account is optional. You can book and manage bookings as a guest.</PageHeader>
      <div className="container-page flex max-w-2xl flex-col gap-6 py-10">
        <Notice tone="info" title="Accounts are coming soon">
          Customer accounts aren&apos;t available yet. Everything you need works without one.
        </Notice>
        <div className="grid gap-3 sm:grid-cols-2">
          <ButtonLink href="/manage-booking" size="lg">
            Manage a booking
          </ButtonLink>
          <ButtonLink href="/rent" size="lg" variant="outline">
            Find a vehicle
          </ButtonLink>
        </div>
      </div>
    </>
  )
}
