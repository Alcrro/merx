import type { FooterSocial } from '@/config/footer'

interface SocialIconProps {
  social: FooterSocial
}

export function SocialIcon({ social }: SocialIconProps) {
  return (
    <a
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={social.label}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-fg-subtle hover:text-fg hover:bg-surface-elevated border border-line transition-colors"
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill={social.fill ? 'currentColor' : 'none'}
        stroke={social.fill ? 'none' : 'currentColor'}
        strokeWidth={social.fill ? undefined : '2'}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={social.path} />
      </svg>
    </a>
  )
}
