import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import {
  buildPaginatedResult,
  PaginatedResult,
} from '../../common/interfaces/paginated.interface';
import { CreateHomeBannerDto } from './dto/create-home-banner.dto';
import { UpdateHomeBannerDto } from './dto/update-home-banner.dto';
import { HomeBanner } from './entities/home-banner.entity';

@Injectable()
export class HomeBannersService {
  constructor(
    @InjectRepository(HomeBanner)
    private readonly repo: Repository<HomeBanner>,
  ) {}

  async create(dto: CreateHomeBannerDto): Promise<HomeBanner> {
    const entity = this.repo.create(dto);
    return await this.repo.save(entity);
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<HomeBanner>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.repo
      .createQueryBuilder('entity')
      .orderBy('entity.displayOrder', 'ASC')
      .addOrderBy('entity.createdAt', 'DESC');

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return buildPaginatedResult(data, total, page, limit);
  }

  async findActive(): Promise<HomeBanner[]> {
    return await this.repo.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<HomeBanner> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(
        `Home banner not found for id "${id}". Check the id and try again.`,
      );
    }
    return entity;
  }

  async update(
    id: string,
    dto: UpdateHomeBannerDto,
  ): Promise<HomeBanner> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return await this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
