import { ImageResponse } from 'next/og'

interface OgConfig {
  badge: string
  title: string
  description: string
  path: string
}

const BASE_URL = 'https://merx.com'

export function buildOgImage({ badge, title, description, path }: OgConfig) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#09090b',
          padding: '64px 72px',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: 16, height: 16, background: '#fff', borderRadius: 3 }} />
          </div>
          <span style={{ color: '#ffffff', fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px' }}>
            Merx
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              backgroundColor: '#6366f120',
              border: '1px solid #6366f140',
              borderRadius: 6,
              padding: '4px 12px',
              color: '#818cf8',
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              width: 'fit-content',
            }}
          >
            {badge}
          </div>
          <div
            style={{
              color: '#ffffff',
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: '-2px',
              lineHeight: 1.1,
            }}
          >
            {title}
          </div>
          <div
            style={{
              color: '#a1a1aa',
              fontSize: 24,
              fontWeight: 400,
              lineHeight: 1.5,
              maxWidth: 700,
            }}
          >
            {description}
          </div>
        </div>

        <div style={{ color: '#52525b', fontSize: 16, fontWeight: 500 }}>
          {BASE_URL}{path}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
