import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
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
import { CreateAwardDto } from './dto/create-award.dto';
import { UpdateAwardDto } from './dto/update-award.dto';
import { Award } from './entities/award.entity';

export type AwardFiles = {
  awardImage?: CdnFile;
};

export type AwardUploadedFiles = {
  awardImage?: CdnFile[];
};

@Injectable()
export class AwardsService {
  constructor(
    @InjectRepository(Award)
    private readonly repo: Repository<Award>,
    private readonly cdn: CdnService,
  ) {}

  async create(dto: CreateAwardDto, files?: AwardFiles): Promise<Award> {
    const awardImageUrl = files?.awardImage
      ? await this.cdn.upload(files.awardImage, 'awards')
      : dto.awardImageUrl ?? null;

    if (!awardImageUrl) {
      throw new BadRequestException(
        'Award image file or awardImageUrl is required to create an award.',
      );
    }

    try {
      const entity = this.repo.create({
        ...dto,
        awardImageUrl,
        status: dto.status ?? ContentStatus.DRAFT,
      });
      return await this.saveOrThrow(entity);
    } catch (err) {
      if (files?.awardImage) {
        await this.cdn.delete(awardImageUrl);
      }
      throw err;
    }
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<Award>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.repo
      .createQueryBuilder('entity')
      .orderBy('entity.displayOrder', 'ASC')
      .addOrderBy('entity.createdAt', 'DESC');
    applyDeletedFilter(qb, query.includeDeleted);

    if (query.status) {
      qb.andWhere('entity.status = :status', { status: query.status });
    }

    if (query.search) {
      qb.andWhere(
        '(entity.title ILIKE :search OR entity.description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return buildPaginatedResult(data, total, page, limit);
  }

  async findPublished(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Award>> {
    return this.findAll({
      ...query,
      status: ContentStatus.PUBLISHED,
      includeDeleted: false,
    });
  }

  async findOne(id: string): Promise<Award> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(
        `Award not found for id "${id}". Check the id and try again.`,
      );
    }
    return entity;
  }

  async update(
    id: string,
    dto: UpdateAwardDto,
    files?: AwardFiles,
  ): Promise<Award> {
    const entity = await this.findOne(id);
    const { awardImageUrl: _ignored, ...rest } = dto;
    Object.assign(entity, rest);
    entity.awardImageUrl =
      (await this.cdn.replace(entity.awardImageUrl, files?.awardImage, 'awards')) ??
      entity.awardImageUrl;
    return this.saveOrThrow(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.softRemove(entity);
  }

  async restore(id: string): Promise<Award> {
    return restoreSoftDeleted(this.repo, id, 'Award');
  }

  private async saveOrThrow(entity: Award): Promise<Award> {
    try {
      return await this.repo.save(entity);
    } catch (err) {
      if (this.isUniqueViolation(err)) {
        throw new ConflictException(
          'An award with this title already exists. Choose a different title.',
        );
      }
      throw err;
    }
  }

  private isUniqueViolation(err: unknown): boolean {
    return (
      err instanceof QueryFailedError &&
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code?: string }).code === '23505'
    );
  }
}
