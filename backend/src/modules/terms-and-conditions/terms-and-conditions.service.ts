import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ContentStatus } from '../../common/enums/content-status.enum';
import {
  buildPaginatedResult,
  PaginatedResult,
} from '../../common/interfaces/paginated.interface';
import {
  applyDeletedFilter,
  restoreSoftDeleted,
} from '../../common/utils/soft-delete';
import { CreateTermsAndConditionDto } from './dto/create-terms-and-condition.dto';
import { UpdateTermsAndConditionDto } from './dto/update-terms-and-condition.dto';
import { TermsAndCondition } from './entities/terms-and-condition.entity';

@Injectable()
export class TermsAndConditionsService {
  constructor(
    @InjectRepository(TermsAndCondition)
    private readonly repo: Repository<TermsAndCondition>,
  ) {}

  async create(dto: CreateTermsAndConditionDto): Promise<TermsAndCondition> {
    const entity = this.repo.create({
      ...dto,
      status: dto.status ?? ContentStatus.DRAFT,
    });
    return await this.repo.save(entity);
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<TermsAndCondition>> {
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
        '(entity.title ILIKE :search OR entity.content ILIKE :search)',
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
  ): Promise<PaginatedResult<TermsAndCondition>> {
    return this.findAll({ ...query, includeDeleted: true, onlyDeleted: true });
  }

  async findPublished(): Promise<TermsAndCondition | null> {
    return await this.repo.findOne({
      where: { status: ContentStatus.PUBLISHED },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<TermsAndCondition> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(
        `Terms and conditions not found for id "${id}". Check the id and try again.`,
      );
    }
    return entity;
  }

  async update(
    id: string,
    dto: UpdateTermsAndConditionDto,
  ): Promise<TermsAndCondition> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return await this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.softRemove(entity);
  }

  async restore(id: string): Promise<TermsAndCondition> {
    return restoreSoftDeleted(this.repo, id, 'Terms and conditions');
  }
}
