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
import { CreatePatientTestimonialDto } from './dto/create-patient-testimonial.dto';
import { UpdatePatientTestimonialDto } from './dto/update-patient-testimonial.dto';
import { PatientTestimonial } from './entities/patient-testimonial.entity';

export type PatientTestimonialFiles = {
  patientTestimonialBanner?: CdnFile;
  patientTestimonialMobileBanner?: CdnFile;
  patientTestimonialFile?: CdnFile;
};

export type PatientTestimonialUploadedFiles = {
  patientTestimonialBanner?: CdnFile[];
  patientTestimonialMobileBanner?: CdnFile[];
  patientTestimonialFile?: CdnFile[];
};

@Injectable()
export class PatientTestimonialsService {
  constructor(
    @InjectRepository(PatientTestimonial)
    private readonly repo: Repository<PatientTestimonial>,
    private readonly cdn: CdnService,
  ) {}

  async create(
    dto: CreatePatientTestimonialDto,
    files?: PatientTestimonialFiles,
  ): Promise<PatientTestimonial> {
    const patientTestimonialBanner = files?.patientTestimonialBanner
      ? await this.cdn.upload(files.patientTestimonialBanner, 'patient-testimonials')
      : null;
    const patientTestimonialMobileBanner = files?.patientTestimonialMobileBanner
      ? await this.cdn.upload(files.patientTestimonialMobileBanner, 'patient-testimonials')
      : null;
    const patientTestimonialFile = files?.patientTestimonialFile
      ? await this.cdn.upload(files.patientTestimonialFile, 'patient-testimonials')
      : null;

    try {
      const entity = this.repo.create({
        ...dto,
        patientTestimonialBanner,
        patientTestimonialMobileBanner,
        patientTestimonialFile,
        status: dto.status ?? ContentStatus.DRAFT,
      });
      return await this.saveOrThrow(entity, dto.slug);
    } catch (err) {
      await this.cdn.delete(patientTestimonialBanner);
      await this.cdn.delete(patientTestimonialMobileBanner);
      await this.cdn.delete(patientTestimonialFile);
      throw err;
    }
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<PatientTestimonial>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.repo
      .createQueryBuilder('entity')
      .orderBy('entity.createdAt', 'DESC');
    applyDeletedFilter(qb, query);

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

  async findDeleted(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<PatientTestimonial>> {
    return this.findAll({ ...query, includeDeleted: true, onlyDeleted: true });
  }

  async findPublished(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<PatientTestimonial>> {
    return this.findAll({
      ...query,
      status: ContentStatus.PUBLISHED,
      includeDeleted: false,
    });
  }

  async findOne(id: string): Promise<PatientTestimonial> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(
        `Patient testimonial not found for id "${id}". Check the id and try again.`,
      );
    }
    return entity;
  }

  async findPublishedBySlug(slug: string): Promise<PatientTestimonial> {
    const entity = await this.repo.findOne({
      where: { slug, status: ContentStatus.PUBLISHED },
    });
    if (!entity) {
      throw new NotFoundException(
        `Published patient testimonial not found for slug "${slug}".`,
      );
    }
    return entity;
  }

  async update(
    id: string,
    dto: UpdatePatientTestimonialDto,
    files?: PatientTestimonialFiles,
  ): Promise<PatientTestimonial> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    entity.patientTestimonialBanner = await this.cdn.replace(
      entity.patientTestimonialBanner,
      files?.patientTestimonialBanner,
      'patient-testimonials',
    );
    entity.patientTestimonialMobileBanner = await this.cdn.replace(
      entity.patientTestimonialMobileBanner,
      files?.patientTestimonialMobileBanner,
      'patient-testimonials',
    );
    entity.patientTestimonialFile = await this.cdn.replace(
      entity.patientTestimonialFile,
      files?.patientTestimonialFile,
      'patient-testimonials',
    );
    return this.saveOrThrow(entity, dto.slug ?? entity.slug);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.softRemove(entity);
  }

  async restore(id: string): Promise<PatientTestimonial> {
    return restoreSoftDeleted(this.repo, id, 'Patient testimonial');
  }

  private async saveOrThrow(
    entity: PatientTestimonial,
    slug?: string,
  ): Promise<PatientTestimonial> {
    try {
      return await this.repo.save(entity);
    } catch (err) {
      if (this.isUniqueViolation(err)) {
        throw new ConflictException(
          slug
            ? `A patient testimonial with slug ${slug} already exists. Choose a different slug.`
            : 'A patient testimonial with this slug already exists. Choose a different slug.',
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
