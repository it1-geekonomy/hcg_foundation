import { Column, Entity } from 'typeorm';
import { SeoContentEntity } from '../../../../common/entities/seo-content.entity';

/**
 * Independent table — no FK relations (ERD constraint).
 */
@Entity('donors')
export class Donor extends SeoContentEntity {

  @Column({ name: 'full_name', type: 'varchar', nullable: false })
  fullName: string;

  @Column({ type: 'varchar', nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  phone?: string;

  @Column({ type: 'int', nullable: false })
  amount: number;

  @Column({ type: 'varchar', nullable: true, default: 'INR' })
  currency?: string;

  @Column({ name: 'payment_status', type: 'varchar', nullable: true, default: 'pending' })
  paymentStatus?: string;

  @Column({ name: 'payment_reference', type: 'varchar', nullable: true })
  paymentReference?: string;

  @Column({ type: 'text', nullable: true })
  message?: string;
}
