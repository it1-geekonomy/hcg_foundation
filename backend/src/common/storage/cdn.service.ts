import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { R2StorageService } from './r2-storage.service';

const IMAGE_TYPES = new Set(['image/webp', 'image/avif']);
const DOCUMENT_TYPES = new Set(['application/pdf']);
const VIDEO_TYPES = new Set(['video/mp4', 'video/webm']);

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;

export type CdnFileKind = 'image' | 'document' | 'video';

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

  async upload(
    file: CdnFile,
    folder: string,
    kind: CdnFileKind = 'image',
  ): Promise<string> {
    this.assertValidFile(file, kind);
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
    kind: CdnFileKind = 'image',
  ): Promise<string | null | undefined> {
    if (!file) return oldUrl;
    const nextUrl = await this.upload(file, folder, kind);
    await this.delete(oldUrl);
    return nextUrl;
  }

  private assertValidFile(file: CdnFile, kind: CdnFileKind) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Uploaded file is empty.');
    }

    if (kind === 'image') {
      if (!IMAGE_TYPES.has(file.mimetype)) {
        throw new BadRequestException(
          'Only WebP or AVIF images are allowed (max 5MB).',
        );
      }
      if (file.size > MAX_IMAGE_BYTES) {
        throw new BadRequestException('Image must be 5MB or smaller.');
      }
      return;
    }

    if (kind === 'document') {
      if (!DOCUMENT_TYPES.has(file.mimetype)) {
        throw new BadRequestException('Only PDF documents are allowed (max 25MB).');
      }
      if (file.size > MAX_DOCUMENT_BYTES) {
        throw new BadRequestException('Document must be 25MB or smaller.');
      }
      return;
    }

    if (!VIDEO_TYPES.has(file.mimetype)) {
      throw new BadRequestException('Only MP4 or WebM videos are allowed.');
    }
  }
}
