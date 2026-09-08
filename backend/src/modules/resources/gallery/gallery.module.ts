import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';
import { GalleryItem } from './entities/gallery-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GalleryItem])],
  controllers: [GalleryController],
  providers: [GalleryService],
  exports: [GalleryService, TypeOrmModule],
})
export class GalleryModule {}
