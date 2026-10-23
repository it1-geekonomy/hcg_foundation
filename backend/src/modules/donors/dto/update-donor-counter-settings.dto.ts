import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class UpdateDonorCounterSettingsDto {
  @ApiProperty({
    example: 1500,
    description: 'Donor count to display on the website',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  count!: number;
}
