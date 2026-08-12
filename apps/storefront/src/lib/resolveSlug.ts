// Extracts the store slug from the current hostname.
//
// Subdomain mode (primary):
//   alcrro.localhost:3002  → "alcrro"
//   alcrro.merx.ro         → "alcrro"
//
// Custom domain (future — option 2):
//   alcrro.ro              → null (no recognisable subdomain)
//   The caller should then hit GET /api/v1/storefront/by-domain?host=alcrro.ro
//   and resolve the store that way. Add the domain column to the Store model
//   and a new API route when you're ready to support it.
//
// Returns null when no slug can be determined from the hostname alone.
export function resolveStoreSlug(): string | null {
  const hostname = window.location.hostname

  // Bare IP or localhost with no subdomain
  if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return null
  }

  const parts = hostname.split('.')

  // Need at least two segments for a subdomain to exist
  if (parts.length < 2) return null

  // alcrro.localhost → ["alcrro", "localhost"]
  // alcrro.merx.ro  → ["alcrro", "merx", "ro"]
  return parts[0]
}
