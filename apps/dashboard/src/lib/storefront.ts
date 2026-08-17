export function storefrontUrl(slug: string): string {
  return import.meta.env.DEV
    ? `http://${slug}.localhost:3002`
    : `https://${slug}.merx.com`
}
