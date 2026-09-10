import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { R2StorageService } from './r2-storage.service';

const IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const DOCUMENT_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;

export type CdnFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
};

/**
 * Shared CDN helpers — any module can upload / delete / replace files.
 * Stores objects on Cloudflare R2 and returns the public URL.
 */
@Injectable()
export class CdnService {
  private readonly logger = new Logger(CdnService.name);

  constructor(private readonly r2: R2StorageService) {}

  async upload(file: CdnFile, folder: string): Promise<string> {
    this.assertValidFile(file);
    const uploaded = await this.r2.upload({
      folder,
      fileName: file.originalname,
      buffer: file.buffer,
      contentType: file.mimetype,
    });
    return uploaded.url;
  }

  async delete(url?: string | null): Promise<void> {
    const deleted = await this.r2.deleteByPublicUrl(url);
    if (deleted && url) {
      this.logger.log(`Old file deleted from CDN: ${url}`);
    }
  }

  /**
   * Upload a new file, then remove the previous CDN object (if any).
   * If `file` is missing, the old URL is kept.
   */
  async replace(
    oldUrl: string | null | undefined,
    file: CdnFile | undefined,
    folder: string,
  ): Promise<string | null | undefined> {
    if (!file) return oldUrl;
    const nextUrl = await this.upload(file, folder);
    await this.delete(oldUrl);
    return nextUrl;
  }

  private assertValidFile(file: CdnFile) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Uploaded file is empty.');
    }
    const isImage = IMAGE_TYPES.has(file.mimetype);
    const isDocument = DOCUMENT_TYPES.has(file.mimetype);

    if (!isImage && !isDocument) {
      throw new BadRequestException(
        'Only JPEG, PNG, WebP, GIF images or PDF documents are allowed.',
      );
    }
    if (isImage && file.size > MAX_IMAGE_BYTES) {
      throw new BadRequestException('Image must be 5MB or smaller.');
    }
    if (isDocument && file.size > MAX_DOCUMENT_BYTES) {
      throw new BadRequestException('Document must be 25MB or smaller.');
    }
  }
}
