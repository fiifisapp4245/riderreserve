import type { Metadata } from "next"
import { CategoryCard } from "@/components/rental/category-card"
import { FleetStatus } from "@/components/rental/fleet-status"
import { ButtonLink, Notice, PageHeader } from "@/components/ui-extras"
import { CATEGORIES } from "@/lib/domain/categories"

export const metadata: Metadata = {
  title: "Vehicles",
  description: "Compare RideReserve vehicle categories: Saloon, Mid-Sedan, SUV, Pick-Up Truck and Premium SUV.",
}

export default function VehiclesPage() {
  return (
    <>
      <PageHeader eyebrow="Vehicles" title="Compare vehicle categories">
        Choose the category that fits your trip. Enter your dates to see prices for your rental.
      </PageHeader>
      <div className="container-page flex flex-col gap-8 py-10 sm:py-14">
        <Notice title="You book a category, not a specific car">
          Photos show the standard you can expect. The make, model and colour you receive may differ from the pictures.
        </Notice>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <li key={c.id}>
              <CategoryCard
                category={c}
                headingLevel="h2"
                status={
                  <div className="border-t border-stone pt-3">
                    <FleetStatus categoryId={c.id} />
                  </div>
                }
                action={
                  <ButtonLink href={`/rent?step=trip&drive=${c.drive[0]}&category=${c.id}`} size="lg">
                    Check prices for {c.name}
                  </ButtonLink>
                }
              />
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
