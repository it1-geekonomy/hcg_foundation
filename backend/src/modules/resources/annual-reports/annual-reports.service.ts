import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import {
  buildPaginatedResult,
  PaginatedResult,
} from '../../../common/interfaces/paginated.interface';
import { ContentStatus } from '../../../common/enums/content-status.enum';
import { R2StorageService } from '../../../common/storage/r2-storage.service';
import { CreateAnnualReportDto } from './dto/create-annual-report.dto';
import { UpdateAnnualReportDto } from './dto/update-annual-report.dto';
import { AnnualReport } from './entities/annual-report.entity';

type ReportFiles = {
  banner?: Express.Multer.File;
  file?: Express.Multer.File;
};

@Injectable()
export class AnnualReportsService {
  constructor(
    @InjectRepository(AnnualReport)
    private readonly repo: Repository<AnnualReport>,
    private readonly storage: R2StorageService,
  ) {}

  async create(
    dto: CreateAnnualReportDto,
    files: ReportFiles = {},
  ): Promise<AnnualReport> {
    const entity = this.repo.create({
      title: dto.title,
      slug: dto.slug,
      reportYear: dto.reportYear ?? null,
      status: dto.status ?? ContentStatus.DRAFT,
      metaTitle: dto.metaTitle ?? null,
      metaDescription: dto.metaDescription ?? null,
      schemaCode: dto.schemaCode ?? null,
    });

    if (files.banner) {
      entity.annualReportBanner = await this.uploadBanner(files.banner);
    }
    if (files.file) {
      entity.annualReportFile = await this.uploadReportFile(files.file);
    }

    return this.repo.save(entity);
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<AnnualReport>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.repo
      .createQueryBuilder('entity')
      .orderBy('entity.createdAt', 'DESC');

    if (query.status) {
      qb.andWhere('entity.status = :status', { status: query.status });
    }

    if (query.search) {
      qb.andWhere(
        '(entity.title ILIKE :search OR entity.slug ILIKE :search OR entity.reportYear ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return buildPaginatedResult(data, total, page, limit);
  }

  async findOne(id: string): Promise<AnnualReport> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`AnnualReport ${id} not found`);
    }
    return entity;
  }

  async findBySlug(slug: string): Promise<AnnualReport> {
    const entity = await this.repo.findOne({ where: { slug } });
    if (!entity) {
      throw new NotFoundException(`AnnualReport slug "${slug}" not found`);
    }
    return entity;
  }

  async update(
    id: string,
    dto: UpdateAnnualReportDto,
    files: ReportFiles = {},
  ): Promise<AnnualReport> {
    const entity = await this.findOne(id);

    if (dto.title !== undefined) entity.title = dto.title;
    if (dto.slug !== undefined) entity.slug = dto.slug;
    if (dto.reportYear !== undefined) entity.reportYear = dto.reportYear;
    if (dto.status !== undefined) entity.status = dto.status;
    if (dto.metaTitle !== undefined) entity.metaTitle = dto.metaTitle;
    if (dto.metaDescription !== undefined)
      entity.metaDescription = dto.metaDescription;
    if (dto.schemaCode !== undefined) entity.schemaCode = dto.schemaCode;

    if (files.banner) {
      const previous = entity.annualReportBanner;
      entity.annualReportBanner = await this.uploadBanner(files.banner);
      await this.storage.deleteByPublicUrl(previous);
    }
    if (files.file) {
      const previous = entity.annualReportFile;
      entity.annualReportFile = await this.uploadReportFile(files.file);
      await this.storage.deleteByPublicUrl(previous);
    }

    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.storage.deleteByPublicUrl(entity.annualReportBanner);
    await this.storage.deleteByPublicUrl(entity.annualReportFile);
    await this.repo.remove(entity);
  }

  private async uploadBanner(file: Express.Multer.File): Promise<string> {
    const uploaded = await this.storage.upload({
      folder: 'annual-reports/banners',
      fileName: file.originalname,
      buffer: file.buffer,
      contentType: file.mimetype || 'application/octet-stream',
    });
    return uploaded.url;
  }

  private async uploadReportFile(file: Express.Multer.File): Promise<string> {
    const uploaded = await this.storage.upload({
      folder: 'annual-reports/files',
      fileName: file.originalname,
      buffer: file.buffer,
      contentType: file.mimetype || 'application/octet-stream',
    });
    return uploaded.url;
  }
}
