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
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';

export type EventFiles = {
  eventBanner?: CdnFile;
  eventMobileBanner?: CdnFile;
};

export type EventUploadedFiles = {
  eventBanner?: CdnFile[];
  eventMobileBanner?: CdnFile[];
};

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly repo: Repository<Event>,
    private readonly cdn: CdnService,
  ) {}

  async create(dto: CreateEventDto, files?: EventFiles): Promise<Event> {
    const eventBanner = files?.eventBanner
      ? await this.cdn.upload(files.eventBanner, 'events')
      : null;
    const eventMobileBanner = files?.eventMobileBanner
      ? await this.cdn.upload(files.eventMobileBanner, 'events')
      : null;

    try {
      const entity = this.repo.create({
        ...dto,
        eventBanner,
        eventMobileBanner,
        status: dto.status ?? ContentStatus.DRAFT,
      });
      return await this.saveOrThrow(entity, dto.slug);
    } catch (err) {
      await this.cdn.delete(eventBanner);
      await this.cdn.delete(eventMobileBanner);
      throw err;
    }
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<Event>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.repo
      .createQueryBuilder('entity')
      .orderBy('entity.eventDate', 'DESC', 'NULLS LAST')
      .addOrderBy('entity.createdAt', 'DESC');
    applyDeletedFilter(qb, query.includeDeleted);

    if (query.status) {
      qb.andWhere('entity.status = :status', { status: query.status });
    }

    if (query.search) {
      qb.andWhere(
        '(entity.title ILIKE :search OR entity.slug ILIKE :search OR entity.eventLocation ILIKE :search OR entity.shortDescription ILIKE :search)',
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
  ): Promise<PaginatedResult<Event>> {
    return this.findAll({
      ...query,
      status: ContentStatus.PUBLISHED,
      includeDeleted: false,
    });
  }

  async findOne(id: string): Promise<Event> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(
        `Event not found for id "${id}". Check the id and try again.`,
      );
    }
    return entity;
  }

  async findPublishedBySlug(slug: string): Promise<Event> {
    const entity = await this.repo.findOne({
      where: { slug, status: ContentStatus.PUBLISHED },
    });
    if (!entity) {
      throw new NotFoundException(
        `Published event not found for slug "${slug}".`,
      );
    }
    return entity;
  }

  async update(
    id: string,
    dto: UpdateEventDto,
    files?: EventFiles,
  ): Promise<Event> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    entity.eventBanner = await this.cdn.replace(
      entity.eventBanner,
      files?.eventBanner,
      'events',
    );
    entity.eventMobileBanner = await this.cdn.replace(
      entity.eventMobileBanner,
      files?.eventMobileBanner,
      'events',
    );
    return this.saveOrThrow(entity, dto.slug ?? entity.slug);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.softRemove(entity);
  }

  async restore(id: string): Promise<Event> {
    return restoreSoftDeleted(this.repo, id, 'Event');
  }

  private async saveOrThrow(entity: Event, slug?: string): Promise<Event> {
    try {
      return await this.repo.save(entity);
    } catch (err) {
      if (this.isUniqueViolation(err)) {
        throw new ConflictException(
          slug
            ? `An event with slug ${slug} already exists. Choose a different slug.`
            : 'An event with this slug already exists. Choose a different slug.',
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
