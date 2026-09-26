import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImpactVideo } from './entities/impact-video.entity';
import { ImpactVideosController } from './impact-videos.controller';
import { ImpactVideosService } from './impact-videos.service';

@Module({
  imports: [TypeOrmModule.forFeature([ImpactVideo])],
  controllers: [ImpactVideosController],
  providers: [ImpactVideosService],
  exports: [ImpactVideosService, TypeOrmModule],
})
export class ImpactVideosModule {}
