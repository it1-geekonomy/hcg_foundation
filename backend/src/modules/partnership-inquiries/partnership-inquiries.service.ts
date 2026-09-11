import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InquiryStatus } from '../../common/enums/inquiry-status.enum';
import {
  buildPaginatedResult,
  PaginatedResult,
} from '../../common/interfaces/paginated.interface';
import { CreatePartnershipInquiryDto } from './dto/create-partnership-inquiry.dto';
import { ListPartnershipInquiriesQueryDto } from './dto/list-partnership-inquiries-query.dto';
import { UpdatePartnershipInquiryDto } from './dto/update-partnership-inquiry.dto';
import { PartnershipInquiry } from './entities/partnership-inquiry.entity';

@Injectable()
export class PartnershipInquiriesService {
  constructor(
    @InjectRepository(PartnershipInquiry)
    private readonly repo: Repository<PartnershipInquiry>,
  ) {}

  async create(dto: CreatePartnershipInquiryDto): Promise<PartnershipInquiry> {
    const entity = this.repo.create({
      ...dto,
      status: InquiryStatus.PENDING,
    });
    return await this.repo.save(entity);
  }

  async findAll(
    query: ListPartnershipInquiriesQueryDto,
  ): Promise<PaginatedResult<PartnershipInquiry>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.repo
      .createQueryBuilder('inquiry')
      .orderBy('inquiry.createdAt', 'DESC');

    if (query.status) {
      qb.andWhere('inquiry.status = :status', { status: query.status });
    }

    if (query.search?.trim()) {
      qb.andWhere(
        '(inquiry.fullName ILIKE :search OR inquiry.email ILIKE :search OR inquiry.phoneNumber ILIKE :search OR inquiry.organizationName ILIKE :search OR inquiry.message ILIKE :search)',
        { search: `%${query.search.trim()}%` },
      );
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return buildPaginatedResult(data, total, page, limit);
  }

  async findOne(id: string): Promise<PartnershipInquiry> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(
        `Partnership inquiry not found for id "${id}". Check the id and try again.`,
      );
    }
    return entity;
  }

  async update(
    id: string,
    dto: UpdatePartnershipInquiryDto,
  ): Promise<PartnershipInquiry> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return await this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
