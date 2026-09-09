import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import {
  buildPaginatedResult,
  PaginatedResult,
} from '../../common/interfaces/paginated.interface';
import { ContentStatus } from '../../common/enums/content-status.enum';
import { CreatePatientStoryDto } from './dto/create-patient-story.dto';
import { UpdatePatientStoryDto } from './dto/update-patient-story.dto';
import { PatientStory } from './entities/patient-story.entity';

@Injectable()
export class PatientStoriesService {
  constructor(
    @InjectRepository(PatientStory)
    private readonly repo: Repository<PatientStory>,
  ) {}

  async create(dto: CreatePatientStoryDto): Promise<PatientStory> {
    const entity = this.repo.create({
      ...dto,
      status: dto.status ?? ContentStatus.DRAFT,
    });
    return this.repo.save(entity);
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<PatientStory>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.repo
      .createQueryBuilder('entity')
      .orderBy('entity.storyDate', 'DESC', 'NULLS LAST')
      .addOrderBy('entity.createdAt', 'DESC');

    if (query.status) {
      qb.andWhere('entity.status = :status', { status: query.status });
    }

    if (query.search) {
      qb.andWhere(
        '(entity.title ILIKE :search OR entity.slug ILIKE :search OR entity.donationState ILIKE :search OR entity.shortDescription ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return buildPaginatedResult(data, total, page, limit);
  }

  async findOne(id: string): Promise<PatientStory> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`PatientStory ${id} not found`);
    }
    return entity;
  }

  async findBySlug(slug: string): Promise<PatientStory> {
    const entity = await this.repo.findOne({ where: { slug } });
    if (!entity) {
      throw new NotFoundException(`PatientStory slug "${slug}" not found`);
    }
    return entity;
  }

  async update(
    id: string,
    dto: UpdatePatientStoryDto,
  ): Promise<PatientStory> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
