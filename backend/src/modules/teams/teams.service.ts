import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentStatus } from '../../common/enums/content-status.enum';
import { TeamType } from '../../common/enums/team-type.enum';
import {
  buildPaginatedResult,
  PaginatedResult,
} from '../../common/interfaces/paginated.interface';
import { CdnFile, CdnService } from '../../common/storage/cdn.service';
import {
  assignDisplayOrderOnRestore,
  compactDisplayOrderAfterDelete,
  insertWithDisplayOrder,
  saveWithDisplayOrder,
} from '../../common/utils/display-order';
import {
  applyDeletedFilter,
  restoreSoftDeleted,
} from '../../common/utils/soft-delete';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamQueryDto } from './dto/team-query.dto';
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

    const { displayOrder: requestedOrder, ...rest } = dto;
    const type = rest.type ?? TeamType.TEAM;

    try {
      const entity = this.repo.create({
        ...rest,
        type,
        teamImage,
        status: dto.status ?? ContentStatus.DRAFT,
      });
      return await insertWithDisplayOrder(this.repo, entity, requestedOrder, {
        type,
      });
    } catch (err) {
      if (teamImage) await this.cdn.delete(teamImage);
      throw err;
    }
  }

  async findAll(query: TeamQueryDto): Promise<PaginatedResult<Team>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.repo
      .createQueryBuilder('entity')
      .orderBy('entity.displayOrder', 'ASC')
      .addOrderBy('entity.createdAt', 'DESC');
    applyDeletedFilter(qb, query);

    if (query.status) {
      qb.andWhere('entity.status = :status', { status: query.status });
    }

    if (query.type) {
      qb.andWhere('entity.type = :type', { type: query.type });
    }

    if (query.search) {
      qb.andWhere(
        '(entity.title ILIKE :search OR entity.designation ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return buildPaginatedResult(data, total, page, limit);
  }

  async findDeleted(query: TeamQueryDto): Promise<PaginatedResult<Team>> {
    return this.findAll({ ...query, includeDeleted: true, onlyDeleted: true });
  }

  async findPublished(query: TeamQueryDto): Promise<PaginatedResult<Team>> {
    return this.findAll({
      ...query,
      status: ContentStatus.PUBLISHED,
      includeDeleted: false,
    });
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
    const previousOrder = entity.displayOrder;
    const previousType = entity.type;
    const { displayOrder: requested, orderMode, teamImage: teamImageField, ...rest } = dto;
    Object.assign(entity, rest);

    if (files?.teamImage) {
      entity.teamImage =
        (await this.cdn.replace(entity.teamImage, files.teamImage, 'teams')) ??
        undefined;
    } else if (teamImageField === '') {
      await this.cdn.delete(entity.teamImage);
      entity.teamImage = null;
    }
    return saveWithDisplayOrder(this.repo, entity, {
      previousOrder,
      previousScope: { type: previousType },
      requested,
      scope: { type: entity.type },
      mode: orderMode,
    });
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    const removedOrder = entity.displayOrder;
    await this.repo.softRemove(entity);
    await compactDisplayOrderAfterDelete(this.repo, removedOrder, { type: entity.type });
  }

  async restore(id: string): Promise<Team> {
    const entity = await restoreSoftDeleted(this.repo, id, 'Team member');
    return assignDisplayOrderOnRestore(this.repo, entity, { type: entity.type });
  }
}
