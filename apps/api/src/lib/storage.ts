import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { config } from '../config'

export interface IStorageProvider {
  upload(key: string, buffer: Buffer, mimeType: string): Promise<string>
  delete(key: string): Promise<void>
}

class CloudflareR2Provider implements IStorageProvider {
  private client: S3Client

  constructor() {
    this.client = new S3Client({
      region: config.storage.region,
      endpoint: config.storage.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.storage.accessKeyId,
        secretAccessKey: config.storage.secretAccessKey,
      },
    })
  }

  async upload(key: string, buffer: Buffer, mimeType: string): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: config.storage.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    )
    return `${config.storage.publicUrl}/${key}`
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: config.storage.bucket,
        Key: key,
      }),
    )
  }
}

export const storageProvider: IStorageProvider = new CloudflareR2Provider()
