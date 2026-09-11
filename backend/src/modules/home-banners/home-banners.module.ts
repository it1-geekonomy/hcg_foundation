import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateHomeBannerDto } from './dto/create-home-banner.dto';
import { UpdateHomeBannerDto } from './dto/update-home-banner.dto';
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
