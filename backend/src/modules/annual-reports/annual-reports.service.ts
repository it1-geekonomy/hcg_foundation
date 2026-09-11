import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
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
import { AnnualReportsQueryDto } from './dto/annual-reports-query.dto';
import { CreateAnnualReportDto } from './dto/create-annual-report.dto';
import { UpdateAnnualReportDto } from './dto/update-annual-report.dto';
import { AnnualReport } from './entities/annual-report.entity';

export type AnnualReportFiles = {
  annualReportBanner?: CdnFile;
  annualReportMobileBanner?: CdnFile;
  annualReportFile?: CdnFile;
};

export type AnnualReportUploadedFiles = {
  annualReportBanner?: CdnFile[];
  annualReportMobileBanner?: CdnFile[];
  annualReportFile?: CdnFile[];
};

@Injectable()
export class AnnualReportsService {
  constructor(
    @InjectRepository(AnnualReport)
    private readonly repo: Repository<AnnualReport>,
    private readonly cdn: CdnService,
  ) {}

  async create(
    dto: CreateAnnualReportDto,
    files?: AnnualReportFiles,
  ): Promise<AnnualReport> {
    const annualReportBanner = files?.annualReportBanner
      ? await this.cdn.upload(files.annualReportBanner, 'annual-reports')
      : (dto.annualReportBanner ?? null);

    const annualReportMobileBanner = files?.annualReportMobileBanner
      ? await this.cdn.upload(files.annualReportMobileBanner, 'annual-reports')
      : (dto.annualReportMobileBanner ?? null);

    const annualReportFile = files?.annualReportFile
      ? await this.cdn.upload(files.annualReportFile, 'annual-reports')
      : (dto.annualReportFile ?? null);

    try {
      const entity = this.repo.create({
        ...dto,
        annualReportBanner,
        annualReportMobileBanner,
        annualReportFile,
        status: dto.status ?? ContentStatus.DRAFT,
      });
      return await this.saveOrThrow(entity, dto.slug);
    } catch (err) {
      await this.cdn.delete(annualReportBanner);
      await this.cdn.delete(annualReportMobileBanner);
      await this.cdn.delete(annualReportFile);
      throw err;
    }
  }

  async findAll(
    query: AnnualReportsQueryDto,
  ): Promise<PaginatedResult<AnnualReport>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.repo
      .createQueryBuilder('entity')
      .orderBy('entity.reportYear', 'DESC', 'NULLS LAST')
      .addOrderBy('entity.createdAt', 'DESC');
    applyDeletedFilter(qb, query.includeDeleted);

    if (query.status) {
      qb.andWhere('entity.status = :status', { status: query.status });
    }

    if (query.reportYear) {
      qb.andWhere('entity.reportYear = :reportYear', {
        reportYear: query.reportYear,
      });
    }

    if (query.search) {
      qb.andWhere(
        '(entity.title ILIKE :search OR entity.slug ILIKE :search OR entity.reportYear ILIKE :search OR entity.metaTitle ILIKE :search)',
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
    query: AnnualReportsQueryDto,
  ): Promise<PaginatedResult<AnnualReport>> {
    return this.findAll({
      ...query,
      status: ContentStatus.PUBLISHED,
      includeDeleted: false,
    });
  }

  async findOne(id: string): Promise<AnnualReport> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(
        `Annual report not found for id "${id}". Check the id and try again.`,
      );
    }
    return entity;
  }

  async findPublishedBySlug(slug: string): Promise<AnnualReport> {
    const entity = await this.repo.findOne({
      where: { slug, status: ContentStatus.PUBLISHED },
    });
    if (!entity) {
      throw new NotFoundException(
        `Published annual report not found for slug "${slug}".`,
      );
    }
    return entity;
  }

  async update(
    id: string,
    dto: UpdateAnnualReportDto,
    files?: AnnualReportFiles,
  ): Promise<AnnualReport> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);

    if (files?.annualReportBanner) {
      entity.annualReportBanner = await this.cdn.replace(
        entity.annualReportBanner,
        files.annualReportBanner,
        'annual-reports',
      );
    } else if (dto.annualReportBanner !== undefined) {
      entity.annualReportBanner = dto.annualReportBanner;
    }

    if (files?.annualReportMobileBanner) {
      entity.annualReportMobileBanner = await this.cdn.replace(
        entity.annualReportMobileBanner,
        files.annualReportMobileBanner,
        'annual-reports',
      );
    } else if (dto.annualReportMobileBanner !== undefined) {
      entity.annualReportMobileBanner = dto.annualReportMobileBanner;
    }

    if (files?.annualReportFile) {
      entity.annualReportFile = await this.cdn.replace(
        entity.annualReportFile,
        files.annualReportFile,
        'annual-reports',
      );
    } else if (dto.annualReportFile !== undefined) {
      entity.annualReportFile = dto.annualReportFile;
    }

    return this.saveOrThrow(entity, dto.slug ?? entity.slug);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.softRemove(entity);
  }

  async restore(id: string): Promise<AnnualReport> {
    return restoreSoftDeleted(this.repo, id, 'Annual report');
  }

  private async saveOrThrow(
    entity: AnnualReport,
    slug?: string,
  ): Promise<AnnualReport> {
    try {
      return await this.repo.save(entity);
    } catch (err) {
      if (this.isUniqueViolation(err)) {
        throw new ConflictException(
          slug
            ? `An annual report with slug "${slug}" already exists. Choose a different slug.`
            : 'An annual report with this slug already exists. Choose a different slug.',
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
