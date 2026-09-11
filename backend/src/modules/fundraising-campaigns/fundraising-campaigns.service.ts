import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampaignStatus } from '../../common/enums/campaign-status.enum';
import {
  buildPaginatedResult,
  PaginatedResult,
} from '../../common/interfaces/paginated.interface';
import { CreateFundraisingCampaignDto } from './dto/create-fundraising-campaign.dto';
import { ListFundraisingCampaignsQueryDto } from './dto/list-fundraising-campaigns-query.dto';
import { UpdateFundraisingCampaignDto } from './dto/update-fundraising-campaign.dto';
import { FundraisingCampaign } from './entities/fundraising-campaign.entity';

@Injectable()
export class FundraisingCampaignsService {
  constructor(
    @InjectRepository(FundraisingCampaign)
    private readonly repo: Repository<FundraisingCampaign>,
  ) {}

  async create(
    dto: CreateFundraisingCampaignDto,
  ): Promise<FundraisingCampaign> {
    const entity = this.repo.create({
      ...dto,
      status: CampaignStatus.PENDING,
    });
    return await this.repo.save(entity);
  }

  async findAll(
    query: ListFundraisingCampaignsQueryDto,
  ): Promise<PaginatedResult<FundraisingCampaign>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.repo
      .createQueryBuilder('campaign')
      .orderBy('campaign.createdAt', 'DESC');

    if (query.status) {
      qb.andWhere('campaign.status = :status', { status: query.status });
    }

    if (query.search?.trim()) {
      qb.andWhere(
        '(campaign.fullName ILIKE :search OR campaign.email ILIKE :search OR campaign.phoneNumber ILIKE :search OR campaign.city ILIKE :search OR campaign.fundraisingReason ILIKE :search)',
        { search: `%${query.search.trim()}%` },
      );
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return buildPaginatedResult(data, total, page, limit);
  }

  async findOne(id: string): Promise<FundraisingCampaign> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(
        `Fundraising campaign not found for id "${id}". Check the id and try again.`,
      );
    }
    return entity;
  }

  async update(
    id: string,
    dto: UpdateFundraisingCampaignDto,
  ): Promise<FundraisingCampaign> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return await this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
