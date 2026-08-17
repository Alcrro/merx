import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import sharp from 'sharp'
import { createHash, randomUUID } from 'crypto'
import { Readable } from 'stream'
import { config } from '../../../config'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
const MAX_BYTES = 5 * 1024 * 1024 // 5MB
const MIN_WIDTH_HERO = 800
const SIGNED_URL_TTL_SECONDS = 300 // 5 min

// Breakpoints for responsive image generation
const BREAKPOINTS = [320, 640, 960, 1280, 1920] as const

// Extension inferred from content-type for raw upload slot
const EXT_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}

function buildS3Client(): S3Client {
  return new S3Client({
    region: config.storage.region,
    endpoint: config.storage.endpoint || undefined,
    credentials: {
      accessKeyId: config.storage.accessKeyId,
      secretAccessKey: config.storage.secretAccessKey,
    },
    // R2 requires path-style addressing
    forcePathStyle: !!config.storage.endpoint,
  })
}

function rawKey(storeId: string, assetId: string, contentType: string): string {
  const ext = EXT_MAP[contentType] ?? 'bin'
  return `stores/${storeId}/raw/${assetId}.${ext}`
}

function processedKey(storeId: string, assetId: string, width: number): string {
  return `stores/${storeId}/processed/${assetId}-${width}.avif`
}

export interface UploadSlot {
  uploadUrl: string
  assetId: string
  key: string
  expiresAt: Date
}

export interface ProcessedAsset {
  assetId: string
  sources: Array<{ width: number; url: string; key: string }>
}

class AssetsRepository {
  private get s3() {
    return buildS3Client()
  }

  private get bucket() {
    return config.storage.bucket
  }

  async getSignedUploadUrl(storeId: string, filename: string, contentType: string): Promise<UploadSlot> {
    if (!ALLOWED_TYPES.has(contentType)) {
      throw new AssetError(`Content type not allowed: ${contentType}. Allowed: ${[...ALLOWED_TYPES].join(', ')}`, 'INVALID_TYPE')
    }

    const assetId = createHash('sha1').update(`${storeId}-${filename}-${randomUUID()}`).digest('hex').slice(0, 16)
    const key = rawKey(storeId, assetId, contentType)

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
      // ContentLength enforcement is done at processUpload time (presigned PUT can't enforce server-side)
      Metadata: { storeId, originalFilename: encodeURIComponent(filename) },
    })

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: SIGNED_URL_TTL_SECONDS })
    const expiresAt = new Date(Date.now() + SIGNED_URL_TTL_SECONDS * 1000)

    return { uploadUrl, assetId, key, expiresAt }
  }

  async processUpload(storeId: string, assetId: string, contentType: string): Promise<ProcessedAsset> {
    const key = rawKey(storeId, assetId, contentType)
    const buffer = await this.download(key)

    // Weight validation
    if (buffer.byteLength > MAX_BYTES) {
      throw new AssetError(`File exceeds max size of ${MAX_BYTES / 1024 / 1024}MB`, 'FILE_TOO_LARGE')
    }

    // Strip EXIF (GPS, camera model, etc.) + validate dimensions
    const image = sharp(buffer).rotate() // .rotate() applies EXIF orientation then strips it

    const metadata = await image.metadata()
    const width = metadata.width ?? 0

    if (width < MIN_WIDTH_HERO) {
      throw new AssetError(`Image width ${width}px is below minimum ${MIN_WIDTH_HERO}px`, 'IMAGE_TOO_SMALL')
    }

    // Generate responsive breakpoints as AVIF
    const sources: ProcessedAsset['sources'] = []

    await Promise.all(
      BREAKPOINTS.filter((bp) => bp <= width).map(async (bp) => {
        const outKey = processedKey(storeId, assetId, bp)

        const avifBuffer = await sharp(buffer)
          .rotate() // re-apply orientation before resize (sharp clones don't share state)
          .resize(bp, null, { withoutEnlargement: true })
          .avif({ quality: 80 })
          .toBuffer()

        await this.s3.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: outKey,
            Body: avifBuffer,
            ContentType: 'image/avif',
            CacheControl: 'public, max-age=31536000, immutable',
          }),
        )

        const url = config.storage.publicUrl ? `${config.storage.publicUrl}/${outKey}` : outKey
        sources.push({ width: bp, url, key: outKey })
      }),
    )

    sources.sort((a, b) => a.width - b.width)

    return { assetId, sources }
  }

  private async download(key: string): Promise<Buffer> {
    const response = await this.s3.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    )

    if (!response.Body) throw new AssetError('Empty response from storage', 'DOWNLOAD_FAILED')

    const stream = response.Body as Readable
    const chunks: Buffer[] = []

    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array))
    }

    return Buffer.concat(chunks)
  }
}

export const assetsRepository = new AssetsRepository()

export class AssetError extends Error {
  constructor(
    message: string,
    public readonly code: 'INVALID_TYPE' | 'FILE_TOO_LARGE' | 'IMAGE_TOO_SMALL' | 'DOWNLOAD_FAILED',
  ) {
    super(message)
    this.name = 'AssetError'
  }
}
