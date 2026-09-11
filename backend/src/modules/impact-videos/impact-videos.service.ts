import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ContentStatus } from '../../common/enums/content-status.enum';
import {
  buildPaginatedResult,
  PaginatedResult,
} from '../../common/interfaces/paginated.interface';
import { CdnFile, CdnService } from '../../common/storage/cdn.service';
import {
  applyDeletedFilter,
  restoreSoftDeleted,
} from '../../common/utils/soft-delete';
import { CreateImpactVideoDto } from './dto/create-impact-video.dto';
import { UpdateImpactVideoDto } from './dto/update-impact-video.dto';
import { ImpactVideo } from './entities/impact-video.entity';

const ALLOWED_VIDEO_TYPES = new Set(['video/mp4', 'video/webm']);
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB

export type ImpactVideoFiles = {
  videoFile?: CdnFile;
};

export type ImpactVideoUploadedFiles = {
  videoFile?: CdnFile[];
};

@Injectable()
export class ImpactVideosService {
  constructor(
    @InjectRepository(ImpactVideo)
    private readonly repo: Repository<ImpactVideo>,
    private readonly cdn: CdnService,
  ) {}

  async create(
    dto: CreateImpactVideoDto,
    file?: CdnFile,
  ): Promise<ImpactVideo> {
    let videoUrl = dto.videoUrl;

    if (file) {
      this.validateVideoFile(file);
      videoUrl = await this.cdn.upload(file, 'impact-videos');
    }

    if (!videoUrl) {
      throw new BadRequestException(
        'Video file or videoUrl is required to create an impact video.',
      );
    }

    try {
      const entity = this.repo.create({
        videoUrl,
        displayOrder: dto.displayOrder ?? 1,
        status: dto.status ?? ContentStatus.DRAFT,
      });
      return await this.repo.save(entity);
    } catch (err) {
      if (file && videoUrl) {
        await this.cdn.delete(videoUrl);
      }
      throw err;
    }
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<ImpactVideo>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.repo
      .createQueryBuilder('entity')
      .orderBy('entity.displayOrder', 'ASC')
      .addOrderBy('entity.createdAt', 'DESC');
    applyDeletedFilter(qb, query);

    if (query.status) {
      qb.andWhere('entity.status = :status', { status: query.status });
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return buildPaginatedResult(data, total, page, limit);
  }

  async findDeleted(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<ImpactVideo>> {
    return this.findAll({ ...query, includeDeleted: true, onlyDeleted: true });
  }

  async findPublished(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<ImpactVideo>> {
    return this.findAll({
      ...query,
      status: ContentStatus.PUBLISHED,
      includeDeleted: false,
    });
  }

  async findOne(id: string): Promise<ImpactVideo> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(
        `Impact video not found for id "${id}". Check the id and try again.`,
      );
    }
    return entity;
  }

  async update(
    id: string,
    dto: UpdateImpactVideoDto,
    file?: CdnFile,
  ): Promise<ImpactVideo> {
    const entity = await this.findOne(id);

    if (file) {
      this.validateVideoFile(file);
      const replacedUrl = await this.cdn.replace(
        entity.videoUrl,
        file,
        'impact-videos',
      );
      if (replacedUrl) {
        entity.videoUrl = replacedUrl;
      }
    } else if (dto.videoUrl && dto.videoUrl !== entity.videoUrl) {
      await this.cdn.delete(entity.videoUrl);
      entity.videoUrl = dto.videoUrl;
    }

    if (dto.displayOrder !== undefined) {
      entity.displayOrder = dto.displayOrder;
    }

    if (dto.status !== undefined) {
      entity.status = dto.status;
    }

    return await this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.softRemove(entity);
  }

  async restore(id: string): Promise<ImpactVideo> {
    return restoreSoftDeleted(this.repo, id, 'Impact video');
  }

  private validateVideoFile(file: CdnFile): void {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Uploaded video file is empty.');
    }
    if (!ALLOWED_VIDEO_TYPES.has(file.mimetype)) {
      throw new BadRequestException(
        'Only MP4 and WebM video formats are allowed.',
      );
    }
    if (file.size > MAX_VIDEO_BYTES) {
      throw new BadRequestException(
        `Video file exceeds maximum allowed size of 50MB (received ${(file.size / (1024 * 1024)).toFixed(2)}MB).`,
      );
    }
  }
}
