"use client"

import * as React from "react"
import { CalendarDays, type LucideIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

/** Shared field chrome: 56px tall, 1px stone border, leading icon. */
export const fieldBox =
  "flex h-14 w-full items-center gap-2 rounded-xl border border-stone bg-white px-3 text-left sm:gap-3 sm:px-4 text-base text-ink transition-colors outline-none hover:border-ink/40 focus-visible:border-ink focus-visible:ring-3 focus-visible:ring-ink/15 aria-invalid:border-destructive aria-invalid:ring-destructive/15 data-[popup-open]:border-ink"

type A11y = { id: string; "aria-describedby"?: string; "aria-invalid"?: boolean; "aria-label"?: string }

export function PickerSelect({
  value,
  onChange,
  options,
  placeholder,
  icon: Icon,
  className,
  "aria-label": ariaLabel,
  ...a11y
}: A11y & {
  value: string | undefined
  onChange: (value: string) => void
  options: { value: string; label: string; detail?: string }[]
  placeholder: string
  icon?: LucideIcon
  className?: string
}) {
  return (
    <Select
      value={value ?? null}
      onValueChange={(v) => v && onChange(v as string)}
      items={options.map((o) => ({ value: o.value, label: o.label }))}
    >
      <SelectTrigger
        {...a11y}
        // Keep the chosen value in the accessible name when a visible label is absent.
        aria-label={ariaLabel && `${ariaLabel}: ${options.find((o) => o.value === value)?.label ?? "not selected"}`}
        className={cn(fieldBox, "data-[size=default]:h-14", className)}
      >
        {Icon && <Icon aria-hidden className="size-5 shrink-0 text-ink/60" />}
        <SelectValue placeholder={placeholder} className="data-placeholder:text-muted-foreground" />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} className="rounded-xl p-1">
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="min-h-12 rounded-lg px-3 py-2.5 text-base">
            <span className="flex flex-col">
              <span>{o.label}</span>
              {o.detail && <span className="text-sm text-muted-foreground">{o.detail}</span>}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const toDate = (s: string) => {
  const [y, m, d] = s.split("-").map(Number)
  return new Date(y, m - 1, d)
}
const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

const display = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" })

/** Date picker: shadcn Popover + Calendar. Values are YYYY-MM-DD (Ghana local date). */
export function DatePicker({
  value,
  onChange,
  min,
  max,
  placeholder = "Select date",
  "aria-label": ariaLabel,
  ...a11y
}: A11y & {
  value: string | undefined
  onChange: (value: string) => void
  min?: string
  max?: string
  placeholder?: string
}) {
  const [open, setOpen] = React.useState(false)
  const selected = value ? toDate(value) : undefined
  const disabled = [...(min ? [{ before: toDate(min) }] : []), ...(max ? [{ after: toDate(max) }] : [])]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        {...a11y}
        aria-label={ariaLabel && `${ariaLabel}: ${selected ? display.format(selected) : "not selected"}`}
        className={fieldBox}
      >
        <CalendarDays aria-hidden className="size-5 shrink-0 text-ink/60" />
        <span className={cn("truncate", !selected && "text-muted-foreground")}>
          {selected ? display.format(selected) : placeholder}
        </span>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        // Stay above or below the field; never jump sideways on narrow or short screens.
        collisionAvoidance={{ side: "flip", align: "shift", fallbackAxisSide: "none" }}
        className="w-auto rounded-2xl p-2"
      >
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected ?? (min ? toDate(min) : undefined)}
          startMonth={min ? toDate(min) : undefined}
          endMonth={max ? toDate(max) : undefined}
          disabled={disabled}
          weekStartsOn={1}
          onSelect={(d) => {
            if (!d) return
            onChange(toISO(d))
            setOpen(false)
          }}
          className="[--cell-size:--spacing(11)]"
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
