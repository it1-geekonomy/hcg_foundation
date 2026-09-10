import { Exclude } from 'class-transformer';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * Internal / admin users.
 * Independent table — no FK relations (ERD constraint).
 * No SEO fields (admin only).
 */
@Entity('users')
export class User extends BaseEntity {
  @ApiProperty({ example: 'Kishan' })
  @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: false })
  fullName: string;

  @ApiProperty({ example: 'kishan10@gmail.com' })
  @Index('idx_users_email')
  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email: string;

  @ApiProperty({ example: 'kishan10' })
  @Index('idx_users_username')
  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  username: string;

  @ApiHideProperty()
  @Exclude()
  @Column({ name: 'password_hash', type: 'text', nullable: false })
  passwordHash: string;
}
