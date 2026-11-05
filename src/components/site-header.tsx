"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui-extras"
import { cn } from "@/lib/utils"

export const NAV = [
  { href: "/vehicles", label: "Vehicles" },
  { href: "/rental-options", label: "Rental options" },
  { href: "/business", label: "Business & long-term" },
  { href: "/manage-booking", label: "Manage booking" },
  { href: "/help", label: "Help" },
]

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex shrink-0 items-center", className)}>
      <Image src="/brand/ridereserve-logo.webp" alt="RideReserve home" width={150} height={52} priority className="h-10 w-auto" />
    </Link>
  )
}

export function SiteHeader() {
  return <SiteHeaderView pathname={usePathname()} />
}

/** Rendered without a pathname as the Suspense fallback on dynamic routes. */
export function SiteHeaderView({ pathname }: { pathname: string }) {
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="container-page flex h-16 items-center gap-4">
        <Logo />
        <nav aria-label="Main" className="ml-2 hidden xl:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap text-ink/80 transition-colors hover:bg-muted hover:text-ink",
                    isActive(item.href) && "text-ink underline decoration-brand decoration-2 underline-offset-[10px]",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ButtonLink href="/sign-in" variant="ghost" className="hidden sm:inline-flex">
            Sign in
          </ButtonLink>
          <ButtonLink href="/rent" variant="outline" className="hidden sm:inline-flex">
            Find a vehicle
          </ButtonLink>
          <Sheet>
            <SheetTrigger render={<Button variant="outline" size="icon" className="xl:hidden" aria-label="Open menu" />}>
              <Menu aria-hidden />
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm p-0">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="border-b p-4">
                <Logo />
              </div>
              <nav aria-label="Mobile" className="px-2">
                <ul className="flex flex-col">
                  {NAV.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={isActive(item.href) ? "page" : undefined}
                        className="flex min-h-12 items-center rounded-lg px-3 text-base font-medium text-ink hover:bg-muted aria-[current=page]:bg-brand-soft aria-[current=page]:text-brand"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="mt-auto flex flex-col gap-2 border-t p-4">
                <ButtonLink href="/rent" size="lg">
                  Find a vehicle
                </ButtonLink>
                <ButtonLink href="/sign-in" variant="outline" size="lg">
                  Sign in
                </ButtonLink>
                <p className="text-center text-sm text-muted-foreground">No account needed to book.</p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
