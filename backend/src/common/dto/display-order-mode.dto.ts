import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import type { DisplayOrderMode } from '../utils/display-order';

export class DisplayOrderModeDto {
  @ApiPropertyOptional({
    enum: ['move', 'swap'],
    default: 'move',
    description:
      'How a new displayOrder is applied: "move" shifts the rows in between, ' +
      '"swap" trades places with the row currently at that position.',
  })
  @IsOptional()
  @IsIn(['move', 'swap'])
  orderMode?: DisplayOrderMode;
}
