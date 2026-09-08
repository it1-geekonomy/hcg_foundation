import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import {
  buildPaginatedResult,
  PaginatedResult,
} from '../../../common/interfaces/paginated.interface';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly repo: Repository<Event>,
  ) {}

  async create(dto: CreateEventDto): Promise<Event> {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Event>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.repo
      .createQueryBuilder('entity')
      .orderBy('entity.createdAt', 'DESC');

    if (query.search) {
      qb.andWhere('(entity.title ILIKE :search OR entity.slug ILIKE :search OR entity.description ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return buildPaginatedResult(data, total, page, limit);
  }

  async findOne(id: string): Promise<Event> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Event ${id} not found`);
    }
    return entity;
  }

  async update(id: string, dto: UpdateEventDto): Promise<Event> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
