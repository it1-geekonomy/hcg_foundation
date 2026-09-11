import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import {
  buildPaginatedResult,
  PaginatedResult,
} from '../../common/interfaces/paginated.interface';
import { CreateLeadsContactDto } from './dto/create-leads-contact.dto';
import { UpdateLeadsContactDto } from './dto/update-leads-contact.dto';
import { LeadsContact } from './entities/leads-contact.entity';

@Injectable()
export class LeadsContactService {
  constructor(
    @InjectRepository(LeadsContact)
    private readonly repo: Repository<LeadsContact>,
  ) {}

  async create(dto: CreateLeadsContactDto): Promise<LeadsContact> {
    const entity = this.repo.create(dto);
    return await this.repo.save(entity);
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<LeadsContact>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.repo
      .createQueryBuilder('entity')
      .orderBy('entity.createdAt', 'DESC');

    if (query.search) {
      qb.andWhere(
        '(entity.fullName ILIKE :search OR entity.email ILIKE :search OR entity.phone ILIKE :search OR entity.message ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return buildPaginatedResult(data, total, page, limit);
  }

  async findOne(id: string): Promise<LeadsContact> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(
        `Contact lead not found for id "${id}". Check the id and try again.`,
      );
    }
    return entity;
  }

  async update(id: string, dto: UpdateLeadsContactDto): Promise<LeadsContact> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return await this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
