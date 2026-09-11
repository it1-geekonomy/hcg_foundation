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
import {
  applyDeletedFilter,
  restoreSoftDeleted,
} from '../../common/utils/soft-delete';
import { CreateTrusteeDto } from './dto/create-trustee.dto';
import { UpdateTrusteeDto } from './dto/update-trustee.dto';
import { Trustee } from './entities/trustee.entity';

export type TrusteeFiles = {
  trusteeImage?: CdnFile;
};

export type TrusteeUploadedFiles = {
  trusteeImage?: CdnFile[];
};

@Injectable()
export class TrusteesService {
  constructor(
    @InjectRepository(Trustee)
    private readonly repo: Repository<Trustee>,
    private readonly cdn: CdnService,
  ) {}

  async create(dto: CreateTrusteeDto, files?: TrusteeFiles): Promise<Trustee> {
    const trusteeImage = files?.trusteeImage
      ? await this.cdn.upload(files.trusteeImage, 'trustees')
      : undefined;

    try {
      const entity = this.repo.create({
        ...dto,
        trusteeImage,
        status: dto.status ?? ContentStatus.DRAFT,
      });
      return await this.repo.save(entity);
    } catch (err) {
      await this.cdn.delete(trusteeImage);
      throw err;
    }
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<Trustee>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.repo
      .createQueryBuilder('entity')
      .orderBy('entity.createdAt', 'DESC');
    applyDeletedFilter(qb, query.includeDeleted);

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
  ): Promise<PaginatedResult<Trustee>> {
    return this.findAll({
      ...query,
      status: ContentStatus.PUBLISHED,
      includeDeleted: false,
    });
  }

  async findOne(id: string): Promise<Trustee> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(
        `Trustee not found for id "${id}". Check the id and try again.`,
      );
    }
    return entity;
  }

  async update(
    id: string,
    dto: UpdateTrusteeDto,
    files?: TrusteeFiles,
  ): Promise<Trustee> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    const newTrusteeImage = await this.cdn.replace(
      entity.trusteeImage,
      files?.trusteeImage,
      'trustees',
    );
    entity.trusteeImage = newTrusteeImage ?? undefined;
    return await this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.softRemove(entity);
  }

  async restore(id: string): Promise<Trustee> {
    return restoreSoftDeleted(this.repo, id, 'Trustee');
  }
}
