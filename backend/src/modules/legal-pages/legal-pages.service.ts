import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  buildPaginatedResult,
  PaginatedResult,
} from '../../common/interfaces/paginated.interface';
import { ContentStatus } from '../../common/enums/content-status.enum';
import { LegalPageType } from '../../common/enums/legal-page-type.enum';
import { CreateLegalPageDto } from './dto/create-legal-page.dto';
import { ListLegalPagesQueryDto } from './dto/list-legal-pages-query.dto';
import { UpdateLegalPageDto } from './dto/update-legal-page.dto';
import { LegalPage } from './entities/legal-page.entity';

@Injectable()
export class LegalPagesService {
  constructor(
    @InjectRepository(LegalPage)
    private readonly repo: Repository<LegalPage>,
  ) {}

  async create(dto: CreateLegalPageDto): Promise<LegalPage> {
    const entity = this.repo.create({
      ...dto,
      status: dto.status ?? ContentStatus.DRAFT,
    });
    return this.repo.save(entity);
  }

  async findAll(
    query: ListLegalPagesQueryDto,
  ): Promise<PaginatedResult<LegalPage>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.repo
      .createQueryBuilder('entity')
      .orderBy('entity.updatedAt', 'DESC');

    if (query.status) {
      qb.andWhere('entity.status = :status', { status: query.status });
    }

    if (query.pageType) {
      qb.andWhere('entity.pageType = :pageType', {
        pageType: query.pageType,
      });
    }

    if (query.search) {
      qb.andWhere(
        '(entity.title ILIKE :search OR entity.slug ILIKE :search OR entity.content ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return buildPaginatedResult(data, total, page, limit);
  }

  async findOne(id: string): Promise<LegalPage> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`LegalPage ${id} not found`);
    }
    return entity;
  }

  async findBySlug(slug: string): Promise<LegalPage> {
    const entity = await this.repo.findOne({ where: { slug } });
    if (!entity) {
      throw new NotFoundException(`LegalPage slug "${slug}" not found`);
    }
    return entity;
  }

  /** Latest published page for a type (public site). */
  async findPublishedByType(pageType: LegalPageType): Promise<LegalPage> {
    const entity = await this.repo.findOne({
      where: { pageType, status: ContentStatus.PUBLISHED },
      order: { updatedAt: 'DESC' },
    });
    if (!entity) {
      throw new NotFoundException(
        `No published ${pageType.replace(/_/g, ' ')} found`,
      );
    }
    return entity;
  }

  async update(id: string, dto: UpdateLegalPageDto): Promise<LegalPage> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
