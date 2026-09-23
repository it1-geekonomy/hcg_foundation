import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import {
  buildPaginatedResult,
  PaginatedResult,
} from '../../common/interfaces/paginated.interface';
import {
  applyDeletedFilter,
  restoreSoftDeleted,
} from '../../common/utils/soft-delete';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';
import { Volunteer } from './entities/volunteer.entity';

@Injectable()
export class VolunteerService {
  constructor(
    @InjectRepository(Volunteer)
    private readonly repo: Repository<Volunteer>,
  ) {}

  async create(dto: CreateVolunteerDto): Promise<Volunteer> {
    const entity = this.repo.create(dto);
    return await this.repo.save(entity);
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<Volunteer>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.repo
      .createQueryBuilder('entity')
      .orderBy('entity.createdAt', 'DESC');
    applyDeletedFilter(qb, query);

    if (query.search) {
      qb.andWhere(
        '(entity.fullName ILIKE :search OR entity.email ILIKE :search OR entity.phone ILIKE :search OR entity.areasOfInterest ILIKE :search OR entity.reason ILIKE :search)',
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
  ): Promise<PaginatedResult<Volunteer>> {
    return this.findAll({ ...query, includeDeleted: true, onlyDeleted: true });
  }

  async findOne(id: string): Promise<Volunteer> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(
        `Volunteer lead not found for id "${id}". Check the id and try again.`,
      );
    }
    return entity;
  }

  async update(id: string, dto: UpdateVolunteerDto): Promise<Volunteer> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return await this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.softRemove(entity);
  }

  async restore(id: string): Promise<Volunteer> {
    return restoreSoftDeleted(this.repo, id, 'Volunteer lead');
  }
}
