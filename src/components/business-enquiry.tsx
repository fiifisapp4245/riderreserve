"use client"

import { useState, useTransition } from "react"
import { CheckCircle2, Loader2, Minus, Plus, Trash2 } from "lucide-react"
import { submitEnquiry, type EnquiryInput } from "@/app/actions"
import { ErrorSummary, Field } from "@/components/form"
import { DatePicker, PickerSelect } from "@/components/pickers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Notice } from "@/components/ui-extras"
import { CATEGORIES, getCategory } from "@/lib/domain/categories"
import { cn } from "@/lib/utils"

type Draft = Omit<EnquiryInput, "durationValue"> & { durationValue: string }

const LABELS: Record<string, string> = {
  companyName: "Company name",
  contactName: "Contact name",
  email: "Email",
  phone: "Phone",
  vehicles: "Vehicles",
  durationValue: "Duration",
  startDate: "Preferred start date",
  location: "Location",
}

export function BusinessEnquiry() {
  const [d, setD] = useState<Draft>({
    audience: "company",
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    vehicles: [{ categoryId: "suv", quantity: 1 }],
    rentalType: "self-drive",
    durationValue: "",
    durationUnit: "months",
    startDate: "",
    location: "",
    requirements: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [failure, setFailure] = useState<string>()
  const [reference, setReference] = useState<string>()
  const [pending, start] = useTransition()
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD({ ...d, [k]: v })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setFailure(undefined)
    start(async () => {
      const res = await submitEnquiry({ ...d, durationValue: Number(d.durationValue) || 0 })
      if (res.ok) {
        setReference(res.reference)
        window.scrollTo({ top: 0 })
        return
      }
      setErrors(res.errors)
      if ("message" in res && res.message) setFailure(res.message)
    })
  }

  if (reference) {
    return (
      <div role="status" className="flex flex-col gap-4 rounded-2xl border-2 border-success p-6">
        <CheckCircle2 aria-hidden className="size-10 text-success" />
        <h2 className="text-2xl font-bold">Enquiry sent</h2>
        <p>
          Your reference is <strong className="font-mono">{reference}</strong>. Our team will review your request and contact{" "}
          {d.contactName} by phone or email with a quote.
        </p>
        <p className="text-sm text-muted-foreground">This is a quote request, not a reservation. Vehicles are confirmed once you accept a quote.</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6" aria-busy={pending}>
      <ErrorSummary errors={errors} labels={LABELS} />
      {failure && (
        <Notice tone="error" role="alert" title="Not sent">
          {failure}
        </Notice>
      )}

      <fieldset>
        <legend className="text-sm font-semibold text-ink">Who is this for?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {(["company", "individual"] as const).map((a) => (
            <label
              key={a}
              className={cn(
                "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 px-4 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/40",
                d.audience === a ? "border-brand bg-brand-soft/50" : "border-border",
              )}
            >
              <input
                type="radio"
                name="audience"
                checked={d.audience === a}
                onChange={() => set("audience", a)}
                className="size-4 accent-[var(--brand)]"
              />
              <span className="font-medium">{a === "company" ? "A company or organisation" : "Myself (individual)"}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        {d.audience === "company" && (
          <Field id="companyName" label="Company name" error={errors.companyName}>
            {(p) => <Input {...p} autoComplete="organization" value={d.companyName} onChange={(e) => set("companyName", e.target.value)} />}
          </Field>
        )}
        <Field id="contactName" label={d.audience === "company" ? "Contact person" : "Your full name"} error={errors.contactName}>
          {(p) => <Input {...p} autoComplete="name" value={d.contactName} onChange={(e) => set("contactName", e.target.value)} />}
        </Field>
        <Field id="email" label="Email" error={errors.email}>
          {(p) => (
            <Input {...p} type="email" inputMode="email" autoComplete="email" value={d.email} onChange={(e) => set("email", e.target.value)} />
          )}
        </Field>
        <Field id="phone" label="Phone or WhatsApp" hint="Include + country code if outside Ghana." error={errors.phone}>
          {(p) => <Input {...p} type="tel" inputMode="tel" autoComplete="tel" value={d.phone} onChange={(e) => set("phone", e.target.value)} />}
        </Field>
      </div>

      <fieldset id="vehicles" className="flex flex-col gap-3">
        <legend className="text-sm font-semibold text-ink">Vehicles needed</legend>
        {d.vehicles.map((v, i) => {
          const cat = getCategory(v.categoryId)
          const update = (next: Partial<typeof v>) => set("vehicles", d.vehicles.map((x, j) => (j === i ? { ...x, ...next } : x)))
          return (
            <div key={i} className="flex flex-wrap items-end gap-2 rounded-xl border border-stone p-3">
              <div className="min-w-48 flex-1">
                <label htmlFor={`cat-${i}`} className="text-sm font-medium">
                  Category
                </label>
                <PickerSelect
                  id={`cat-${i}`}
                  placeholder="Category"
                  value={v.categoryId}
                  options={CATEGORIES.map((c) => ({ value: c.id, label: c.name }))}
                  onChange={(categoryId) => update({ categoryId })}
                />
              </div>
              <div className="flex items-center gap-1" role="group" aria-label={`Quantity of ${cat?.name}`}>
                <Button type="button" variant="outline" size="icon" aria-label="Decrease" onClick={() => update({ quantity: Math.max(1, v.quantity - 1) })}>
                  <Minus aria-hidden />
                </Button>
                <span className="w-10 text-center font-semibold" aria-live="polite">
                  {v.quantity}
                </span>
                <Button type="button" variant="outline" size="icon" aria-label="Increase" onClick={() => update({ quantity: Math.min(200, v.quantity + 1) })}>
                  <Plus aria-hidden />
                </Button>
              </div>
              {d.vehicles.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${cat?.name}`}
                  onClick={() => set("vehicles", d.vehicles.filter((_, j) => j !== i))}
                >
                  <Trash2 aria-hidden />
                </Button>
              )}
            </div>
          )
        })}
        <Button
          type="button"
          variant="outline"
          className="self-start"
          onClick={() => set("vehicles", [...d.vehicles, { categoryId: "saloon", quantity: 1 }])}
        >
          <Plus aria-hidden data-icon="inline-start" /> Add another category
        </Button>
        {errors.vehicles && <p className="text-sm font-medium text-destructive">{errors.vehicles}</p>}
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="rentalType" label="Rental type">
          {(p) => (
            <PickerSelect
              {...p}
              placeholder="Rental type"
              value={d.rentalType}
              options={[
                { value: "self-drive", label: "Self-drive" },
                { value: "chauffeur", label: "With chauffeur" },
                { value: "unsure", label: "Not sure yet" },
              ]}
              onChange={(v) => set("rentalType", v as Draft["rentalType"])}
            />
          )}
        </Field>
        <div className="grid grid-cols-[1fr_8.5rem] gap-2">
          <Field id="durationValue" label="Duration" error={errors.durationValue}>
            {(p) => (
              <Input {...p} type="number" inputMode="numeric" min={1} value={d.durationValue} onChange={(e) => set("durationValue", e.target.value)} />
            )}
          </Field>
          <Field id="durationUnit" label="Unit">
            {(p) => (
              <PickerSelect
                {...p}
                placeholder="Unit"
                value={d.durationUnit}
                options={[
                  { value: "days", label: "Days" },
                  { value: "weeks", label: "Weeks" },
                  { value: "months", label: "Months" },
                ]}
                onChange={(v) => set("durationUnit", v as Draft["durationUnit"])}
              />
            )}
          </Field>
        </div>
        <Field id="startDate" label="Preferred start date" error={errors.startDate}>
          {(p) => <DatePicker {...p} value={d.startDate || undefined} onChange={(v) => set("startDate", v)} />}
        </Field>
        <Field id="location" label="Project or pickup location" hint="Town, city or site" error={errors.location}>
          {(p) => <Input {...p} value={d.location} onChange={(e) => set("location", e.target.value)} />}
        </Field>
      </div>
      <Field id="requirements" label="Anything else we should know?" optional hint={`${1000 - (d.requirements?.length ?? 0)} characters left`}>
        {(p) => <Textarea {...p} rows={4} maxLength={1000} value={d.requirements} onChange={(e) => set("requirements", e.target.value)} />}
      </Field>

      <Button type="submit" size="lg" disabled={pending} className="self-start">
        {pending ? (
          <>
            <Loader2 aria-hidden className="animate-spin" data-icon="inline-start" /> Sending…
          </>
        ) : (
          "Send quote request"
        )}
      </Button>
    </form>
  )
}
