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
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';

export type ProjectFiles = {
  projectBanner?: CdnFile;
  projectMobileBanner?: CdnFile;
};

export type ProjectUploadedFiles = {
  projectBanner?: CdnFile[];
  projectMobileBanner?: CdnFile[];
};

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly repo: Repository<Project>,
    private readonly cdn: CdnService,
  ) {}

  async create(dto: CreateProjectDto, files?: ProjectFiles): Promise<Project> {
    const projectBanner = files?.projectBanner
      ? await this.cdn.upload(files.projectBanner, 'projects')
      : null;
    const projectMobileBanner = files?.projectMobileBanner
      ? await this.cdn.upload(files.projectMobileBanner, 'projects')
      : null;

    try {
      const entity = this.repo.create({
        ...dto,
        projectBanner,
        projectMobileBanner,
        status: dto.status ?? ContentStatus.DRAFT,
      });
      return await this.saveOrThrow(entity, dto.slug);
    } catch (err) {
      await this.cdn.delete(projectBanner);
      await this.cdn.delete(projectMobileBanner);
      throw err;
    }
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<Project>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.repo
      .createQueryBuilder('entity')
      .orderBy('entity.projectDate', 'DESC', 'NULLS LAST')
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
  ): Promise<PaginatedResult<Project>> {
    return this.findAll({ ...query, status: ContentStatus.PUBLISHED });
  }

  async findOne(id: string): Promise<Project> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(
        `Project not found for id "${id}". Check the id and try again.`,
      );
    }
    return entity;
  }

  async findPublishedBySlug(slug: string): Promise<Project> {
    const entity = await this.repo.findOne({
      where: { slug, status: ContentStatus.PUBLISHED },
    });
    if (!entity) {
      throw new NotFoundException(
        `Published project not found for slug "${slug}".`,
      );
    }
    return entity;
  }

  async update(
    id: string,
    dto: UpdateProjectDto,
    files?: ProjectFiles,
  ): Promise<Project> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    entity.projectBanner = await this.cdn.replace(
      entity.projectBanner,
      files?.projectBanner,
      'projects',
    );
    entity.projectMobileBanner = await this.cdn.replace(
      entity.projectMobileBanner,
      files?.projectMobileBanner,
      'projects',
    );
    return this.saveOrThrow(entity, dto.slug ?? entity.slug);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.cdn.delete(entity.projectBanner);
    await this.cdn.delete(entity.projectMobileBanner);
    await this.repo.remove(entity);
  }

  private async saveOrThrow(
    entity: Project,
    slug?: string,
  ): Promise<Project> {
    try {
      return await this.repo.save(entity);
    } catch (err) {
      if (this.isUniqueViolation(err)) {
        throw new ConflictException(
          slug
            ? `A project with slug ${slug} already exists. Choose a different slug.`
            : 'A project with this slug already exists. Choose a different slug.',
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
