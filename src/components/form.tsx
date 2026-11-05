"use client"

import * as React from "react"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Field wrapper: associates label, hint and error with the control through
 * ids so screen readers announce instructions and errors (WCAG 1.3.1, 3.3.1).
 */
export function Field({
  id,
  label,
  hint,
  error,
  optional,
  className,
  children,
}: {
  id: string
  label: React.ReactNode
  hint?: React.ReactNode
  error?: string
  optional?: boolean
  className?: string
  children: (props: { id: string; "aria-describedby"?: string; "aria-invalid"?: boolean }) => React.ReactNode
}) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
        {optional && <span className="ml-1 font-normal text-muted-foreground">(optional)</span>}
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-sm font-medium text-destructive">
          <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span>
            <span className="sr-only">Error: </span>
            {error}
          </span>
        </p>
      )}
    </div>
  )
}

/** Linked error summary for long forms; receives focus when shown. */
export function ErrorSummary({ errors, labels }: { errors: Record<string, string | undefined>; labels: Record<string, string> }) {
  const ref = React.useRef<HTMLDivElement>(null)
  // List problems in form order (the order of `labels`), not validation order.
  const order = Object.keys(labels)
  const rank = (k: string) => (order.includes(k) ? order.indexOf(k) : order.length)
  const entries = Object.entries(errors)
    .filter((e): e is [string, string] => Boolean(e[1]))
    .sort(([a], [b]) => rank(a) - rank(b))
  const key = entries.map(([k]) => k).join(",")
  React.useEffect(() => {
    if (entries.length) ref.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  if (!entries.length) return null
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      aria-labelledby="error-summary-title"
      className="rounded-xl border-2 border-destructive bg-white p-4 outline-none"
    >
      <h2 id="error-summary-title" className="text-base font-semibold text-destructive">
        There {entries.length === 1 ? "is a problem" : `are ${entries.length} problems`} to fix
      </h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
        {entries.map(([field, message]) => (
          <li key={field}>
            <a href={`#${field}`} className="font-medium text-destructive underline underline-offset-2">
              {labels[field] ? `${labels[field]}: ` : ""}
              {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
