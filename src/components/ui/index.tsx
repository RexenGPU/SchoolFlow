import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

/* ------------------------------------------------------------------ */
/*  Glass card                                                          */
/* ------------------------------------------------------------------ */
export function GlassCard({
  children,
  className,
  as: Tag = 'div',
  interactive = false,
  reflection = false,
  ...rest
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'article' | 'section' | 'li'
  interactive?: boolean
  reflection?: boolean
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag
      className={cn(
        'glass rounded-3xl',
        interactive &&
          'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-line active:translate-y-0',
        reflection && 'glass-reflection',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}

/* ------------------------------------------------------------------ */
/*  Button                                                              */
/* ------------------------------------------------------------------ */
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle'
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-accent-contrast shadow-[0_8px_24px_-8px_var(--accent)] hover:brightness-110 border border-transparent',
  secondary: 'glass text-ink hover:bg-surface-hover border border-line',
  ghost: 'text-ink-2 hover:text-ink hover:bg-surface-hover border border-transparent',
  subtle: 'bg-surface-strong text-ink border border-line-soft hover:bg-surface-hover',
  danger: 'bg-danger/12 text-danger border border-danger/25 hover:bg-danger/18',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-sm rounded-xl gap-1.5',
  md: 'h-11 px-5 text-sm rounded-2xl gap-2',
  lg: 'h-13 px-7 text-base rounded-2xl gap-2.5',
  icon: 'size-11 rounded-2xl p-0 justify-center',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex select-none items-center justify-center font-medium transition-all duration-200',
        'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Inputs                                                              */
/* ------------------------------------------------------------------ */
export function Input({
  className,
  label,
  hint,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string }) {
  const id = rest.id ?? rest.name
  return (
    <label className="block gap-1.5" htmlFor={id}>
      {label && <span className="text-[13px] font-medium text-ink-2">{label}</span>}
      <input
        className={cn(
          'h-12 w-full rounded-2xl border border-line-soft bg-surface-strong px-4 text-[15px] text-ink',
          'placeholder:text-ink-3 transition focus:border-accent/50 focus:bg-surface-solid focus:outline-none',
          'focus:shadow-[0_0_0_4px_var(--accent-soft)]',
          className,
        )}
        {...rest}
      />
      {hint && <span className="text-xs text-ink-3">{hint}</span>}
    </label>
  )
}

export function Textarea({
  className,
  label,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  const id = rest.id ?? rest.name
  return (
    <label className="block gap-1.5" htmlFor={id}>
      {label && <span className="text-[13px] font-medium text-ink-2">{label}</span>}
      <textarea
        className={cn(
          'min-h-28 w-full resize-y rounded-2xl border border-line-soft bg-surface-strong px-4 py-3 text-[15px] text-ink',
          'placeholder:text-ink-3 transition focus:border-accent/50 focus:bg-surface-solid focus:outline-none',
          'focus:shadow-[0_0_0_4px_var(--accent-soft)]',
          className,
        )}
        {...rest}
      />
    </label>
  )
}

export function Select({
  className,
  label,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  const id = rest.id ?? rest.name
  return (
    <label className="block gap-1.5" htmlFor={id}>
      {label && <span className="text-[13px] font-medium text-ink-2">{label}</span>}
      <select
        className={cn(
          'h-12 w-full appearance-none rounded-2xl border border-line-soft bg-surface-strong px-4 text-[15px] text-ink',
          'transition focus:border-accent/50 focus:bg-surface-solid focus:outline-none',
          'focus:shadow-[0_0_0_4px_var(--accent-soft)]',
          className,
        )}
        {...rest}
      >
        {children}
      </select>
    </label>
  )
}

/* ------------------------------------------------------------------ */
/*  Badge / Chip                                                        */
/* ------------------------------------------------------------------ */
export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}) {
  const tones = {
    neutral: 'bg-surface-strong text-ink-2 border-line-soft',
    accent: 'bg-accent-softer text-accent border-accent/25',
    success: 'bg-success/12 text-success border-success/25',
    warning: 'bg-warning/12 text-warning border-warning/25',
    danger: 'bg-danger/12 text-danger border-danger/25',
    info: 'bg-info/12 text-info border-info/25',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Switch                                                              */
/* ------------------------------------------------------------------ */
export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
  disabled?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{label}</p>
        {description && <p className="mt-0.5 text-xs leading-relaxed text-ink-3">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-7 w-12 shrink-0 rounded-full border transition-colors duration-200',
          checked ? 'bg-accent border-accent' : 'bg-surface-strong border-line-soft',
          disabled && 'opacity-50',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200',
            checked && 'translate-x-5',
          )}
        />
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Progress                                                            */
/* ------------------------------------------------------------------ */
export function Progress({ value, className, tone = 'accent' }: { value: number; className?: string; tone?: 'accent' | 'success' | 'danger' }) {
  const colors = { accent: 'bg-accent', success: 'bg-success', danger: 'bg-danger' }
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-strong border border-line-soft', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-500', colors[tone])}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Modal                                                               */
/* ------------------------------------------------------------------ */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Fermer"
        className="absolute inset-0 bg-black/35 backdrop-blur-sm fade-in"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'glass-strong relative z-10 w-full max-h-[90dvh] overflow-y-auto rounded-t-3xl p-6 scale-in sm:rounded-3xl',
          wide ? 'sm:max-w-2xl' : 'sm:max-w-lg',
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-2 py-1 text-sm text-ink-3 transition hover:bg-surface-hover hover:text-ink"
          >
            Fermer
          </button>
        </div>
        <div className="text-sm text-ink-2">{children}</div>
        {footer && <div className="mt-6 flex flex-wrap justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Empty state                                                         */
/* ------------------------------------------------------------------ */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="glass flex flex-col items-center justify-center gap-3 rounded-3xl px-6 py-14 text-center">
      {icon && <div className="text-ink-3">{icon}</div>}
      <p className="text-base font-semibold text-ink">{title}</p>
      {description && <p className="max-w-md text-sm leading-relaxed text-ink-3">{description}</p>}
      {action}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page header                                                         */
/* ------------------------------------------------------------------ */
export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
  eyebrow?: string
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-xs font-semibold tracking-widest text-accent uppercase">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-2">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Segmented control                                                   */
/* ------------------------------------------------------------------ */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
  ariaLabel: string
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="glass-subtle inline-flex rounded-2xl p-1"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'relative rounded-xl px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200 sm:px-4',
            value === o.value ? 'text-accent-contrast' : 'text-ink-2 hover:text-ink',
          )}
        >
          {value === o.value && (
            <span className="absolute inset-0 rounded-xl bg-accent shadow" aria-hidden />
          )}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Avatar                                                              */
/* ------------------------------------------------------------------ */
export function Avatar({ name, hue, size = 40 }: { name: string; hue?: number; size?: number }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
  const h = hue ?? 245
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-sm"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `linear-gradient(135deg, hsl(${h} 75% 58%), hsl(${(h + 40) % 360} 70% 48%))`,
      }}
      aria-hidden
    >
      {initials}
    </span>
  )
}
