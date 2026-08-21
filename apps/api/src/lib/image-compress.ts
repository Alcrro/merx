import sharp from 'sharp'

const MAX_DIMENSION = 1200
const WEBP_QUALITY = 82

export interface CompressedImage {
  buffer: Buffer
  mimeType: 'image/webp'
  ext: '.webp'
}

export async function compressImage(buffer: Buffer): Promise<CompressedImage> {
  const compressed = await sharp(buffer)
    .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer()

  return { buffer: compressed, mimeType: 'image/webp', ext: '.webp' }
}
