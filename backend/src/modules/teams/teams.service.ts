import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ContentStatus } from '../../common/enums/content-status.enum';
import {
  buildPaginatedResult,
  PaginatedResult,
} from '../../common/interfaces/paginated.interface';
import { CdnFile, CdnService } from '../../common/storage/cdn.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Team } from './entities/team.entity';

export type TeamFiles = {
  teamImage?: CdnFile;
};

export type TeamUploadedFiles = {
  teamImage?: CdnFile[];
};

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly repo: Repository<Team>,
    private readonly cdn: CdnService,
  ) {}

  async create(dto: CreateTeamDto, files?: TeamFiles): Promise<Team> {
    const teamImage = files?.teamImage
      ? await this.cdn.upload(files.teamImage, 'teams')
      : undefined;

    try {
      const entity = this.repo.create({
        ...dto,
        teamImage,
        status: dto.status ?? ContentStatus.DRAFT,
      });
      return await this.repo.save(entity);
    } catch (err) {
      await this.cdn.delete(teamImage);
      throw err;
    }
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<Team>> {
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
        '(entity.title ILIKE :search OR entity.designation ILIKE :search OR entity.shortDescription ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return buildPaginatedResult(data, total, page, limit);
  }

  async findPublished(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Team>> {
    return this.findAll({ ...query, status: ContentStatus.PUBLISHED });
  }

  async findOne(id: string): Promise<Team> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(
        `Team member not found for id "${id}". Check the id and try again.`,
      );
    }
    return entity;
  }

  async update(
    id: string,
    dto: UpdateTeamDto,
    files?: TeamFiles,
  ): Promise<Team> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    const newTeamImage = await this.cdn.replace(
      entity.teamImage,
      files?.teamImage,
      'teams',
    );
    entity.teamImage = newTeamImage ?? undefined;
    return await this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.cdn.delete(entity.teamImage);
    await this.repo.remove(entity);
  }
}
