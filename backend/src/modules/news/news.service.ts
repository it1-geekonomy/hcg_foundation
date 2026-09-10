import {
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
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { News } from './entities/news.entity';

export type NewsFiles = {
  newsBanner?: CdnFile;
  newsMobileBanner?: CdnFile;
};

export type NewsUploadedFiles = {
  newsBanner?: CdnFile[];
  newsMobileBanner?: CdnFile[];
};

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private readonly repo: Repository<News>,
    private readonly cdn: CdnService,
  ) {}

  async create(dto: CreateNewsDto, files?: NewsFiles): Promise<News> {
    const newsBanner = files?.newsBanner
      ? await this.cdn.upload(files.newsBanner, 'news')
      : null;
    const newsMobileBanner = files?.newsMobileBanner
      ? await this.cdn.upload(files.newsMobileBanner, 'news')
      : null;

    try {
      const entity = this.repo.create({
        ...dto,
        newsBanner,
        newsMobileBanner,
        status: dto.status ?? ContentStatus.DRAFT,
      });
      return await this.saveOrThrow(entity, dto.slug);
    } catch (err) {
      await this.cdn.delete(newsBanner);
      await this.cdn.delete(newsMobileBanner);
      throw err;
    }
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<News>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.repo
      .createQueryBuilder('entity')
      .orderBy('entity.newsDate', 'DESC', 'NULLS LAST')
      .addOrderBy('entity.createdAt', 'DESC');

    if (query.status) {
      qb.andWhere('entity.status = :status', { status: query.status });
    }

    if (query.search) {
      qb.andWhere(
        '(entity.title ILIKE :search OR entity.slug ILIKE :search OR entity.shortDescription ILIKE :search)',
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
  ): Promise<PaginatedResult<News>> {
    return this.findAll({ ...query, status: ContentStatus.PUBLISHED });
  }

  async findOne(id: string): Promise<News> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(
        `News not found for id "${id}". Check the id and try again.`,
      );
    }
    return entity;
  }

  async findPublishedBySlug(slug: string): Promise<News> {
    const entity = await this.repo.findOne({
      where: { slug, status: ContentStatus.PUBLISHED },
    });
    if (!entity) {
      throw new NotFoundException(
        `Published news not found for slug "${slug}".`,
      );
    }
    return entity;
  }

  async update(
    id: string,
    dto: UpdateNewsDto,
    files?: NewsFiles,
  ): Promise<News> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    entity.newsBanner = await this.cdn.replace(
      entity.newsBanner,
      files?.newsBanner,
      'news',
    );
    entity.newsMobileBanner = await this.cdn.replace(
      entity.newsMobileBanner,
      files?.newsMobileBanner,
      'news',
    );
    return this.saveOrThrow(entity, dto.slug ?? entity.slug);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.cdn.delete(entity.newsBanner);
    await this.cdn.delete(entity.newsMobileBanner);
    await this.repo.remove(entity);
  }

  private async saveOrThrow(entity: News, slug?: string): Promise<News> {
    try {
      return await this.repo.save(entity);
    } catch (err) {
      if (this.isUniqueViolation(err)) {
        throw new ConflictException(
          slug
            ? `A news with slug ${slug} already exists. Choose a different slug.`
            : 'A news with this slug already exists. Choose a different slug.',
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
