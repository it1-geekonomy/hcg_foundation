import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('donor_counter_settings')
export class DonorCounterSettings extends BaseEntity {
  @ApiProperty({
    example: 1500,
    description: 'Donor count to display on the website (configured from CMS)',
    default: 0,
  })
  @Column({ name: 'count', type: 'int', default: 0 })
  count!: number;
}
