import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrusteesController } from './trustees.controller';
import { TrusteesService } from './trustees.service';
import { Trustee } from './entities/trustee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Trustee])],
  controllers: [TrusteesController],
  providers: [TrusteesService],
  exports: [TrusteesService, TypeOrmModule],
})
export class TrusteesModule {}
