import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import {
  buildPaginatedResult,
  PaginatedResult,
} from '../../../common/interfaces/paginated.interface';
import { CreateLeadContactDto } from './dto/create-lead-contact.dto';
import { UpdateLeadContactDto } from './dto/update-lead-contact.dto';
import { LeadContact } from './entities/lead-contact.entity';

@Injectable()
export class LeadsContactService {
  constructor(
    @InjectRepository(LeadContact)
    private readonly repo: Repository<LeadContact>,
  ) {}

  async create(dto: CreateLeadContactDto): Promise<LeadContact> {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<LeadContact>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.repo
      .createQueryBuilder('entity')
      .orderBy('entity.createdAt', 'DESC');

    if (query.search) {
      qb.andWhere('(entity.fullName ILIKE :search OR entity.email ILIKE :search OR entity.phone ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return buildPaginatedResult(data, total, page, limit);
  }

  async findOne(id: string): Promise<LeadContact> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`LeadContact ${id} not found`);
    }
    return entity;
  }

  async update(id: string, dto: UpdateLeadContactDto): Promise<LeadContact> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
