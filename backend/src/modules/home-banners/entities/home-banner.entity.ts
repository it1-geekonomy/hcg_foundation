import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('home_banners')
export class HomeBanner extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string;

  @Column({ name: 'short_description', type: 'text', nullable: true })
  shortDescription?: string;

  @Column({ name: 'banner_image_url', type: 'text', nullable: false })
  bannerImageUrl: string;

  @Column({ name: 'mobile_banner_image_url', type: 'text', nullable: true })
  mobileBannerImageUrl?: string;

  @Column({ name: 'profile_image_url', type: 'text', nullable: true })
  profileImageUrl?: string;

  @Column({ name: 'display_order', type: 'int', nullable: false, default: 1 })
  displayOrder: number;

  @Column({ name: 'is_active', type: 'boolean', nullable: false, default: true })
  isActive: boolean;
}
