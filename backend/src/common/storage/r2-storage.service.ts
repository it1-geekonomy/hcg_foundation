import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { extname } from 'path';

export type UploadedObject = {
  key: string;
  url: string;
  contentType: string;
  size: number;
};

@Injectable()
export class R2StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly config: ConfigService) {
    const endpoint = this.config.get<string>('r2.endpoint');
    const accessKeyId = this.config.get<string>('r2.accessKeyId');
    const secretAccessKey = this.config.get<string>('r2.secretAccessKey');
    this.bucket = this.config.get<string>('r2.bucketName') ?? '';
    this.publicUrl = (this.config.get<string>('r2.publicUrl') ?? '').replace(
      /\/$/,
      '',
    );

    this.client = new S3Client({
      region: this.config.get<string>('r2.region') ?? 'auto',
      endpoint,
      credentials: {
        accessKeyId: accessKeyId ?? '',
        secretAccessKey: secretAccessKey ?? '',
      },
      forcePathStyle: false,
    });
  }

  assertConfigured() {
    if (
      !this.bucket ||
      !this.publicUrl ||
      !this.config.get('r2.accessKeyId') ||
      !this.config.get('r2.secretAccessKey') ||
      !this.config.get('r2.endpoint')
    ) {
      throw new Error(
        'R2 is not configured. Set R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_ENDPOINT, R2_PUBLIC_URL.',
      );
    }
  }

  /**
   * Upload a buffer to R2 under `folder/` and return the public CDN URL.
   */
  async upload(params: {
    folder: string;
    fileName: string;
    buffer: Buffer;
    contentType: string;
  }): Promise<UploadedObject> {
    this.assertConfigured();

    const safeName = params.fileName
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, '-')
      .replace(/-+/g, '-');
    const key = `${params.folder.replace(/\/$/, '')}/${randomUUID()}-${safeName || `file${extname(params.fileName) || ''}`}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: params.buffer,
        ContentType: params.contentType,
      }),
    );

    return {
      key,
      url: `${this.publicUrl}/${key}`,
      contentType: params.contentType,
      size: params.buffer.length,
    };
  }

  async deleteByPublicUrl(url?: string | null): Promise<void> {
    if (!url || !this.publicUrl || !url.startsWith(this.publicUrl)) return;
    this.assertConfigured();
    const key = url.slice(this.publicUrl.length + 1);
    if (!key) return;
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }
}
