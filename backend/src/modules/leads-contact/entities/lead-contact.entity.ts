import { Column, Entity } from 'typeorm';
import { SeoContentEntity } from '../../../common/entities/seo-content.entity';

/**
 * Independent table — no FK relations (ERD constraint).
 */
@Entity('leads_contact')
export class LeadContact extends SeoContentEntity {

  @Column({ name: 'full_name', type: 'varchar', nullable: false })
  fullName: string;

  @Column({ type: 'varchar', nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  phone?: string;

  @Column({ type: 'varchar', nullable: true })
  subject?: string;

  @Column({ type: 'text', nullable: false })
  message: string;

  @Column({ type: 'varchar', nullable: true, default: 'new' })
  status?: string;
}
