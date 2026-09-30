import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import {
  buildPaginatedResult,
  PaginatedResult,
} from '../../common/interfaces/paginated.interface';
import { CdnFile, CdnService } from '../../common/storage/cdn.service';
import {
  applyDeletedFilter,
  restoreSoftDeleted,
} from '../../common/utils/soft-delete';
import { CreateLeadsInternshipDto } from './dto/create-leads-internship.dto';
import { UpdateLeadsInternshipDto } from './dto/update-leads-internship.dto';
import { LeadsInternship } from './entities/leads-internship.entity';

const CDN_FOLDER = 'leads-internship';

@Injectable()
export class LeadsInternshipService {
  constructor(
    @InjectRepository(LeadsInternship)
    private readonly repo: Repository<LeadsInternship>,
    private readonly cdn: CdnService,
  ) {}

  async create(dto: CreateLeadsInternshipDto, file?: CdnFile): Promise<LeadsInternship> {
    if (!file) {
      throw new BadRequestException('CV file is required');
    }

    const cvUrl = await this.cdn.upload(file, CDN_FOLDER, 'cv');

    try {
      const entity = this.repo.create({ ...dto, cv: cvUrl });
      return await this.repo.save(entity);
    } catch (err) {
      await this.cdn.delete(cvUrl);
      throw err;
    }
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<LeadsInternship>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.repo
      .createQueryBuilder('entity')
      .orderBy('entity.createdAt', 'DESC');
    applyDeletedFilter(qb, query);

    if (query.search) {
      qb.andWhere(
        '(entity.fullName ILIKE :search OR entity.email ILIKE :search OR entity.phone ILIKE :search OR entity.currentCourse ILIKE :search OR entity.message ILIKE :search)',
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
  ): Promise<PaginatedResult<LeadsInternship>> {
    return this.findAll({ ...query, includeDeleted: true, onlyDeleted: true });
  }

  async findOne(id: string): Promise<LeadsInternship> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(
        `Internship lead not found for id "${id}". Check the id and try again.`,
      );
    }
    return entity;
  }

  async update(id: string, dto: UpdateLeadsInternshipDto, file?: CdnFile): Promise<LeadsInternship> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    
    if (file) {
      entity.cv = (await this.cdn.replace(entity.cv, file, CDN_FOLDER, 'cv')) ?? entity.cv;
    }
    
    return await this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.softRemove(entity);
  }

  async restore(id: string): Promise<LeadsInternship> {
    return restoreSoftDeleted(this.repo, id, 'Internship lead');
  }
}
