import { cn } from '../utils/cn'

export function LogoMark({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      className={cn('shrink-0', className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="sf-g" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818cf8" />
          <stop offset="0.5" stopColor="var(--accent, #6366f1)" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="18" fill="url(#sf-g)" />
      <rect x="4.75" y="4.75" width="54.5" height="54.5" rx="17.25" stroke="white" strokeOpacity="0.45" strokeWidth="1.5" />
      <path
        d="M18 26.5C18 22.36 21.36 19 25.5 19H38.5C42.64 19 46 22.36 46 26.5V28C46 32.14 42.64 35.5 38.5 35.5H27.5L20.5 42V35.5H25.5"
        stroke="white"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.95"
      />
      <circle cx="41" cy="43" r="6.5" fill="white" fillOpacity="0.22" />
      <path d="M41 39.5V43L43.5 44.8" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Logo({ size = 'md', showText = true }: { size?: 'sm' | 'md' | 'lg'; showText?: boolean }) {
  const dims = { sm: 26, md: 32, lg: 44 }
  const text = { sm: 'text-base', md: 'text-lg', lg: 'text-2xl' }
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={dims[size]} />
      {showText && (
        <span className={cn('font-semibold tracking-tight text-ink', text[size])}>
          SCHOOL<span className="text-accent">FLOW</span>
        </span>
      )}
    </span>
  )
}
