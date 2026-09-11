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
import { CreatePatientStoryDto } from './dto/create-patient-story.dto';
import { UpdatePatientStoryDto } from './dto/update-patient-story.dto';
import { PatientStory } from './entities/patient-story.entity';

export type PatientStoryFiles = {
  patientImage?: CdnFile;
};

export type PatientStoryUploadedFiles = {
  patientImage?: CdnFile[];
};

@Injectable()
export class PatientStoriesService {
  constructor(
    @InjectRepository(PatientStory)
    private readonly repo: Repository<PatientStory>,
    private readonly cdn: CdnService,
  ) {}

  async create(
    dto: CreatePatientStoryDto,
    files?: PatientStoryFiles,
  ): Promise<PatientStory> {
    const patientImage = files?.patientImage
      ? await this.cdn.upload(files.patientImage, 'patient-stories')
      : null;

    try {
      const entity = this.repo.create({
        ...dto,
        patientImage,
        status: dto.status ?? ContentStatus.DRAFT,
      });
      return await this.saveOrThrow(entity, dto.slug);
    } catch (err) {
      await this.cdn.delete(patientImage);
      throw err;
    }
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<PatientStory>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.repo
      .createQueryBuilder('entity')
      .orderBy('entity.storyDate', 'DESC', 'NULLS LAST')
      .addOrderBy('entity.createdAt', 'DESC');
    applyDeletedFilter(qb, query.includeDeleted);

    if (query.status) {
      qb.andWhere('entity.status = :status', { status: query.status });
    }

    if (query.search) {
      qb.andWhere(
        '(entity.title ILIKE :search OR entity.slug ILIKE :search OR entity.donationState ILIKE :search OR entity.shortDescription ILIKE :search)',
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
  ): Promise<PaginatedResult<PatientStory>> {
    return this.findAll({
      ...query,
      status: ContentStatus.PUBLISHED,
      includeDeleted: false,
    });
  }

  async findOne(id: string): Promise<PatientStory> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(
        `Patient story not found for id "${id}". Check the id and try again.`,
      );
    }
    return entity;
  }

  async findPublishedBySlug(slug: string): Promise<PatientStory> {
    const entity = await this.repo.findOne({
      where: { slug, status: ContentStatus.PUBLISHED },
    });
    if (!entity) {
      throw new NotFoundException(
        `Published patient story not found for slug "${slug}".`,
      );
    }
    return entity;
  }

  async update(
    id: string,
    dto: UpdatePatientStoryDto,
    files?: PatientStoryFiles,
  ): Promise<PatientStory> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    entity.patientImage = await this.cdn.replace(
      entity.patientImage,
      files?.patientImage,
      'patient-stories',
    );
    return this.saveOrThrow(entity, dto.slug ?? entity.slug);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.softRemove(entity);
  }

  async restore(id: string): Promise<PatientStory> {
    return restoreSoftDeleted(this.repo, id, 'Patient story');
  }

  private async saveOrThrow(
    entity: PatientStory,
    slug?: string,
  ): Promise<PatientStory> {
    try {
      return await this.repo.save(entity);
    } catch (err) {
      if (this.isUniqueViolation(err)) {
        throw new ConflictException(
          slug
            ? `A patient story with slug ${slug} already exists. Choose a different slug.`
            : 'A patient story with this slug already exists. Choose a different slug.',
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
