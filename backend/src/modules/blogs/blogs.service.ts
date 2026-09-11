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
import {
  applyDeletedFilter,
  restoreSoftDeleted,
} from '../../common/utils/soft-delete';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Blog } from './entities/blog.entity';

export type BlogFiles = {
  blogBanner?: CdnFile;
  blogMobileBanner?: CdnFile;
};

export type BlogUploadedFiles = {
  blogBanner?: CdnFile[];
  blogMobileBanner?: CdnFile[];
};

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private readonly repo: Repository<Blog>,
    private readonly cdn: CdnService,
  ) {}

  async create(dto: CreateBlogDto, files?: BlogFiles): Promise<Blog> {
    const blogBanner = files?.blogBanner
      ? await this.cdn.upload(files.blogBanner, 'blogs')
      : (dto.blogBanner ?? null);

    const blogMobileBanner = files?.blogMobileBanner
      ? await this.cdn.upload(files.blogMobileBanner, 'blogs')
      : (dto.blogMobileBanner ?? null);

    try {
      const entity = this.repo.create({
        ...dto,
        blogBanner,
        blogMobileBanner,
        status: dto.status ?? ContentStatus.DRAFT,
      });
      return await this.saveOrThrow(entity, dto.slug);
    } catch (err) {
      if (files?.blogBanner) await this.cdn.delete(blogBanner);
      if (files?.blogMobileBanner) await this.cdn.delete(blogMobileBanner);
      throw err;
    }
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<Blog>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.repo
      .createQueryBuilder('entity')
      .orderBy('entity.blogDate', 'DESC', 'NULLS LAST')
      .addOrderBy('entity.createdAt', 'DESC');
    applyDeletedFilter(qb, query);

    if (query.status) {
      qb.andWhere('entity.status = :status', { status: query.status });
    }

    if (query.search) {
      qb.andWhere(
        '(entity.title ILIKE :search OR entity.slug ILIKE :search OR entity.authorName ILIKE :search OR entity.shortDescription ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return buildPaginatedResult(data, total, page, limit);
  }

  async findDeleted(query: PaginationQueryDto): Promise<PaginatedResult<Blog>> {
    return this.findAll({ ...query, includeDeleted: true, onlyDeleted: true });
  }

  async findPublished(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Blog>> {
    return this.findAll({
      ...query,
      status: ContentStatus.PUBLISHED,
      includeDeleted: false,
    });
  }

  async findOne(id: string): Promise<Blog> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(
        `Blog not found for id "${id}". Check the id and try again.`,
      );
    }
    return entity;
  }

  async findPublishedBySlug(slug: string): Promise<Blog> {
    const entity = await this.repo.findOne({
      where: { slug, status: ContentStatus.PUBLISHED },
    });
    if (!entity) {
      throw new NotFoundException(
        `Published blog not found for slug "${slug}".`,
      );
    }
    return entity;
  }

  async update(
    id: string,
    dto: UpdateBlogDto,
    files?: BlogFiles,
  ): Promise<Blog> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);

    if (files?.blogBanner) {
      entity.blogBanner = await this.cdn.replace(
        entity.blogBanner,
        files.blogBanner,
        'blogs',
      );
    } else if (dto.blogBanner !== undefined) {
      entity.blogBanner = dto.blogBanner;
    }

    if (files?.blogMobileBanner) {
      entity.blogMobileBanner = await this.cdn.replace(
        entity.blogMobileBanner,
        files.blogMobileBanner,
        'blogs',
      );
    } else if (dto.blogMobileBanner !== undefined) {
      entity.blogMobileBanner = dto.blogMobileBanner;
    }

    return this.saveOrThrow(entity, dto.slug ?? entity.slug);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.softRemove(entity);
  }

  async restore(id: string): Promise<Blog> {
    return restoreSoftDeleted(this.repo, id, 'Blog');
  }

  private async saveOrThrow(entity: Blog, slug?: string): Promise<Blog> {
    try {
      return await this.repo.save(entity);
    } catch (err) {
      if (this.isUniqueViolation(err)) {
        throw new ConflictException(
          slug
            ? `A blog with slug "${slug}" already exists. Choose a different slug.`
            : 'A blog with this slug already exists. Choose a different slug.',
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
