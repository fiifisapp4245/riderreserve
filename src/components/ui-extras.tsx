import Link from "next/link"
import type { VariantProps } from "class-variance-authority"
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ButtonLink({
  href,
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>) {
  return (
    <Link href={href} className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children}
    </Link>
  )
}

const noticeStyles = {
  info: { box: "border-info/25 bg-info-soft text-info", Icon: Info },
  warning: { box: "border-warning/30 bg-warning-soft text-warning", Icon: AlertTriangle },
  success: { box: "border-success/30 bg-success-soft text-success", Icon: CheckCircle2 },
  error: { box: "border-destructive/30 bg-brand-soft text-destructive", Icon: XCircle },
}

/** Inline notice. Tone is conveyed by icon + title text, not colour alone. */
export function Notice({
  tone = "info",
  title,
  children,
  className,
  role,
}: {
  tone?: keyof typeof noticeStyles
  title?: React.ReactNode
  children?: React.ReactNode
  className?: string
  role?: "status" | "alert"
}) {
  const { box, Icon } = noticeStyles[tone]
  return (
    <div role={role} className={cn("flex gap-3 rounded-xl border p-4 text-sm", box, className)}>
      <Icon aria-hidden className="mt-0.5 size-5 shrink-0" />
      <div className="space-y-1 text-ink">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="text-ink/80 [&_a]:font-medium [&_a]:underline">{children}</div>}
      </div>
    </div>
  )
}

export function StatusBadge({ tone, children }: { tone: "success" | "warning" | "error" | "neutral" | "info"; children: React.ReactNode }) {
  const styles = {
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    error: "bg-brand-soft text-destructive",
    neutral: "bg-muted text-muted-foreground",
    info: "bg-info-soft text-info",
  }
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", styles[tone])}>{children}</span>
  )
}

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="border-b bg-muted/60">
      <div className="container-page py-10 sm:py-14">
        {eyebrow && <p className="mb-2 text-sm font-semibold tracking-wide text-brand uppercase">{eyebrow}</p>}
        <h1 className="max-w-3xl text-3xl font-bold sm:text-4xl">{title}</h1>
        {children && <div className="mt-3 max-w-2xl text-lg text-muted-foreground">{children}</div>}
      </div>
    </div>
  )
}

export function Unverified({ children = "To be confirmed" }: { children?: React.ReactNode }) {
  return <span className="text-muted-foreground italic">{children}</span>
}
