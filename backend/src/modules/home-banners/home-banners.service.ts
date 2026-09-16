import {
  BadRequestException,
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
import { CdnFile, CdnService } from '../../common/storage/cdn.service';
import {
  applyDeletedFilter,
  restoreSoftDeleted,
} from '../../common/utils/soft-delete';
import { CreateHomeBannerDto } from './dto/create-home-banner.dto';
import { UpdateHomeBannerDto } from './dto/update-home-banner.dto';
import { HomeBanner } from './entities/home-banner.entity';

const CDN_FOLDER = 'home-banners';

export type HomeBannerFiles = {
  bannerImage?: CdnFile;
  mobileBannerImage?: CdnFile;
  profileImage?: CdnFile;
};

export type HomeBannerUploadedFiles = {
  bannerImage?: CdnFile[];
  mobileBannerImage?: CdnFile[];
  profileImage?: CdnFile[];
};

@Injectable()
export class HomeBannersService {
  constructor(
    @InjectRepository(HomeBanner)
    private readonly repo: Repository<HomeBanner>,
    private readonly cdn: CdnService,
  ) {}

  async create(
    dto: CreateHomeBannerDto,
    files?: HomeBannerFiles,
  ): Promise<HomeBanner> {
    const bannerImageUrl = files?.bannerImage
      ? await this.cdn.upload(files.bannerImage, CDN_FOLDER)
      : dto.bannerImageUrl;

    if (!bannerImageUrl) {
      throw new BadRequestException(
        'Banner image file or bannerImageUrl is required to create a home banner.',
      );
    }

    const mobileBannerImageUrl = files?.mobileBannerImage
      ? await this.cdn.upload(files.mobileBannerImage, CDN_FOLDER)
      : dto.mobileBannerImageUrl;

    const profileImageUrl = files?.profileImage
      ? await this.cdn.upload(files.profileImage, CDN_FOLDER)
      : dto.profileImageUrl;

    try {
      const entity = this.repo.create({
        ...dto,
        bannerImageUrl,
        mobileBannerImageUrl,
        profileImageUrl,
        displayOrder: dto.displayOrder ?? 1,
        isActive: dto.isActive ?? true,
      });
      return await this.repo.save(entity);
    } catch (err) {
      if (files?.bannerImage) {
        await this.cdn.delete(bannerImageUrl);
      }
      if (files?.mobileBannerImage) {
        await this.cdn.delete(mobileBannerImageUrl);
      }
      if (files?.profileImage) {
        await this.cdn.delete(profileImageUrl);
      }
      throw err;
    }
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<HomeBanner>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.repo
      .createQueryBuilder('entity')
      .orderBy('entity.displayOrder', 'ASC')
      .addOrderBy('entity.createdAt', 'DESC');
    applyDeletedFilter(qb, query);

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return buildPaginatedResult(data, total, page, limit);
  }

  async findDeleted(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<HomeBanner>> {
    return this.findAll({ ...query, includeDeleted: true, onlyDeleted: true });
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
    files?: HomeBannerFiles,
  ): Promise<HomeBanner> {
    const entity = await this.findOne(id);
    const {
      bannerImageUrl: _bannerUrl,
      mobileBannerImageUrl: _mobileUrl,
      profileImageUrl: _profileUrl,
      ...rest
    } = dto;
    Object.assign(entity, rest);

    entity.bannerImageUrl =
      (await this.cdn.replace(
        entity.bannerImageUrl,
        files?.bannerImage,
        CDN_FOLDER,
      )) ?? entity.bannerImageUrl;

    entity.mobileBannerImageUrl =
      (await this.cdn.replace(
        entity.mobileBannerImageUrl,
        files?.mobileBannerImage,
        CDN_FOLDER,
      )) ?? entity.mobileBannerImageUrl;

    entity.profileImageUrl =
      (await this.cdn.replace(
        entity.profileImageUrl,
        files?.profileImage,
        CDN_FOLDER,
      )) ?? entity.profileImageUrl;

    return await this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.softRemove(entity);
  }

  async restore(id: string): Promise<HomeBanner> {
    return restoreSoftDeleted(this.repo, id, 'Home banner');
  }
}
