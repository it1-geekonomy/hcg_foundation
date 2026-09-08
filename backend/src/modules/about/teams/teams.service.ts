import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  buildPaginatedResult,
  PaginatedResult,
} from '../../../common/interfaces/paginated.interface';
import { CreateTeamDto } from './dto/create-team.dto';
import { ListTeamsQueryDto } from './dto/list-teams-query.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Team } from './entities/team.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly repo: Repository<Team>,
  ) {}

  async create(dto: CreateTeamDto): Promise<Team> {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async findAll(query: ListTeamsQueryDto): Promise<PaginatedResult<Team>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.repo
      .createQueryBuilder('team')
      .orderBy('team.createdAt', 'DESC');

    if (query.status) {
      qb.andWhere('team.status = :status', { status: query.status });
    }

    if (query.memberType) {
      qb.andWhere('team.memberType = :memberType', {
        memberType: query.memberType,
      });
    }

    if (query.search) {
      qb.andWhere(
        '(team.title ILIKE :search OR team.designation ILIKE :search OR team.shortDescription ILIKE :search OR team.content ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return buildPaginatedResult(data, total, page, limit);
  }

  async findOne(id: string): Promise<Team> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Team ${id} not found`);
    }
    return entity;
  }

  async update(id: string, dto: UpdateTeamDto): Promise<Team> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Team ${id} not found`);
    }
  }
}
