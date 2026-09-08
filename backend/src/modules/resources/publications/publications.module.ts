import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicationsController } from './publications.controller';
import { PublicationsService } from './publications.service';
import { Publication } from './entities/publication.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Publication])],
  controllers: [PublicationsController],
  providers: [PublicationsService],
  exports: [PublicationsService, TypeOrmModule],
})
export class PublicationsModule {}
