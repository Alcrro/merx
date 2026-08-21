import { config } from '../config'

export interface FetchedImage {
  buffer: Buffer
  mimeType: string
  ext: string
}

async function downloadBuffer(url: string): Promise<FetchedImage> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download image: ${res.status}`)
  const arrayBuffer = await res.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const contentType = res.headers.get('content-type') ?? 'image/jpeg'
  const mimeType = contentType.split(';')[0].trim()
  const ext = mimeType === 'image/png' ? '.png' : mimeType === 'image/webp' ? '.webp' : '.jpg'
  return { buffer, mimeType, ext }
}

async function searchPexels(query: string, count: number): Promise<FetchedImage[]> {
  if (!config.pexels.apiKey) return []

  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=square`
  const res = await fetch(url, {
    headers: { Authorization: config.pexels.apiKey },
  })

  if (!res.ok) {
    console.warn(`[image-fetch] Pexels returned ${res.status}`)
    return []
  }

  const data = await res.json() as { photos: { src: { large: string } }[] }
  const results: FetchedImage[] = []

  for (const photo of data.photos.slice(0, count)) {
    try {
      const img = await downloadBuffer(photo.src.large)
      results.push(img)
    } catch (err) {
      console.warn('[image-fetch] Failed to download Pexels photo:', err)
    }
  }

  return results
}

async function generateDalle(prompt: string): Promise<FetchedImage | null> {
  if (!config.openai.apiKey) return null

  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.openai.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-2',
        prompt,
        size: '512x512',
        response_format: 'url',
        n: 1,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.warn(`[image-fetch] DALL-E returned ${res.status}: ${err}`)
      return null
    }

    const data = await res.json() as { data: { url: string }[] }
    const imageUrl = data.data[0]?.url
    if (!imageUrl) return null

    return downloadBuffer(imageUrl)
  } catch (err) {
    console.warn('[image-fetch] DALL-E failed:', err)
    return null
  }
}

export async function fetchProductImages(title: string, targetCount = 4): Promise<FetchedImage[]> {
  const results: FetchedImage[] = []

  // 1. Try Pexels first
  try {
    const pexelsResults = await searchPexels(title, targetCount)
    results.push(...pexelsResults)
  } catch (err) {
    console.warn('[image-fetch] Pexels search failed:', err)
  }

  // 2. Fill remaining slots with DALL-E
  const needed = targetCount - results.length
  if (needed > 0 && config.openai.apiKey) {
    const prompt = `Professional product photo of ${title}, clean white background, high quality ecommerce photography`
    const dalleCount = Math.min(needed, 2)
    for (let i = 0; i < dalleCount; i++) {
      const img = await generateDalle(prompt)
      if (img) results.push(img)
    }
  }

  return results
}
