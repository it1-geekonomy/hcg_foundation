import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeBanner } from './entities/home-banner.entity';
import { HomeBannersController } from './home-banners.controller';
import { HomeBannersService } from './home-banners.service';

@Module({
  imports: [TypeOrmModule.forFeature([HomeBanner])],
  controllers: [HomeBannersController],
  providers: [HomeBannersService],
  exports: [HomeBannersService],
})
export class HomeBannersModule {}
