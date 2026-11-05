import { parsePhoneNumberFromString } from "libphonenumber-js/min"
import { z } from "zod"

/** Normalise to E.164. Ghana is the default country when no + prefix is given. */
export function normalizePhone(raw: string): { ok: true; e164: string } | { ok: false; error: string } {
  const value = raw.trim()
  if (!value) return { ok: false, error: "Enter a phone number." }
  const parsed = parsePhoneNumberFromString(value, "GH")
  if (!parsed || !parsed.isValid()) {
    return { ok: false, error: "Enter a valid phone number, for example 024 123 4567 or +44 7700 900123." }
  }
  return { ok: true, e164: parsed.number }
}

/** "+233 24 555 0101": readable international format for display. */
export function formatPhoneDisplay(e164: string) {
  return parsePhoneNumberFromString(e164)?.formatInternational() ?? e164
}

export const renterSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your full name as it appears on your ID.").max(120),
  phone: z.string(),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .pipe(z.email("Enter an email address in the format name@example.com.")),
  requests: z.string().max(500, "Special requests must be 500 characters or fewer.").optional().default(""),
})

export type Renter = z.infer<typeof renterSchema>
export type RenterErrors = Partial<Record<keyof Renter, string>>

export function validateRenter(input: Partial<Renter>): { errors: RenterErrors; value?: Renter } {
  const errors: RenterErrors = {}
  // Treat absent fields as empty so customers get "missing" messages, not type errors.
  const parsed = renterSchema.safeParse({ fullName: "", email: "", phone: "", ...input })
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof Renter
      errors[key] ??= issue.message
    }
  }
  const phone = normalizePhone(input.phone ?? "")
  if (!phone.ok) errors.phone = phone.error
  if (Object.keys(errors).length || !parsed.success || !phone.ok) return { errors }
  return { errors, value: { ...parsed.data, phone: phone.e164 } }
}
